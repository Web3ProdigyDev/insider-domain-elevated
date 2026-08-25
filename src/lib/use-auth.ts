import * as React from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";

import type { MemberRecord } from "./auth-store";
import { createClient } from "./supabase/client";

/** Subscribes to the simulated auth store. SSR-safe. */
export function useAuth() {
  const supabase = React.useMemo(() => createClient(), []);
  const [session, setSession] = React.useState<any>(undefined);
  React.useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => active && setSession(data.session));
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
        firstName: authUser.user_metadata?.full_name?.split(" ")[0] ?? "Member",
        surname: authUser.user_metadata?.full_name?.split(" ").slice(1).join(" ") ?? "",
        middleName: "",
        username: (authUser.email ?? "member").split("@")[0],
        password: "",
        dob: "",
        invitationCode: "",
        invitedBy: "",
        role: "member",
        emailVerified: Boolean(authUser.email_confirmed_at),
        onboardingCompleted: true,
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
