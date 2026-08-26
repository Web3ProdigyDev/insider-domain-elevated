import * as React from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";

import { createClient } from "./supabase/client";

type MemberRecord = {
  id: string;
  email: string;
  firstName: string;
  surname: string;
  middleName: string;
  username: string;
  password: string;
  dob: string;
  invitationCode: string;
  invitedBy: string;
  role: string;
  emailVerified: boolean;
  onboardingCompleted: boolean;
  onboarding: {
    identityConfirmed: boolean;
    ageConfirmed: boolean;
    invitationConfirmed: boolean;
    privacyAccepted: boolean;
    securityAccepted: boolean;
    communications: string[];
    experience: string | null;
  };
  wallet: null;
  createdAt: string;
};

/** Subscribes to the simulated auth store. SSR-safe. */
export function useAuth() {
  const supabase = React.useMemo(() => createClient(), []);
  const [session, setSession] = React.useState<Session | null | undefined>(undefined);
  const [profile, setProfile] = React.useState<{
    role: string;
    onboarding_completed: boolean;
    dob: string | null;
    first_name: string | null;
    surname: string | null;
    username: string | null;
  } | null>(null);
  React.useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (data.session) {
        const { data: row } = await supabase
          .from("profiles")
          .select("role,onboarding_completed,dob,first_name,surname,username")
          .eq("id", data.session.user.id)
          .maybeSingle();
        if (active) setProfile(row);
      } else setProfile(null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, next) => active && setSession(next),
    );
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);
  const authUser = session?.user;
  const user: MemberRecord | null = authUser
    ? ({
        id: authUser.id,
        email: authUser.email ?? "",
        firstName: profile?.first_name ?? "",
        surname: profile?.surname ?? "",
        middleName: "",
        username: profile?.username ?? "",
        password: "",
        dob: profile?.dob ?? "",
        invitationCode: "",
        invitedBy: "",
        role: profile?.role ?? "member",
        emailVerified: Boolean(authUser.email_confirmed_at),
        onboardingCompleted: profile?.onboarding_completed ?? false,
        onboarding: {
          identityConfirmed: true,
          ageConfirmed: true,
          invitationConfirmed: true,
          privacyAccepted: true,
          securityAccepted: true,
          communications: ["account", "security"],
          experience: null,
        },
        wallet: null,
        createdAt: authUser.created_at,
      } as MemberRecord)
    : null;
  return { user, ready: session !== undefined, session };
}

/**
 * Client-side membership gate used by the application shell.
 * Sends unauthenticated visitors to the entrance, and verified members
 * with unfinished onboarding into the access review.
 */
export function useRequireMember({ adminOnly = false } = {}) {
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  React.useEffect(() => {
    if (!ready) return;
    if (!user) {
      void navigate({ to: "/auth", replace: true });
      return;
    }
    if (!user.emailVerified) {
      void navigate({ to: "/auth/verify", replace: true });
      return;
    }
    if (!user.onboardingCompleted) {
      void navigate({ to: "/onboarding", replace: true });
      return;
    }
    if (adminOnly && user.role !== "admin") {
      void navigate({ to: "/", replace: true });
    }
  }, [ready, user, navigate, adminOnly, pathname]);

  const allowed =
    !!user &&
    user.emailVerified &&
    user.onboardingCompleted &&
    (!adminOnly || user.role === "admin");

  return { user, ready, allowed };
}
