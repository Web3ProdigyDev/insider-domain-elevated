import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
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
  const [profileLoading, setProfileLoading] = React.useState(true);
  React.useEffect(() => {
    let active = true;
    const loadProfile = async (nextSession: Session | null) => {
      if (!nextSession) {
        setProfile(null);
        setProfileLoading(false);
        return;
      }
      setProfileLoading(true);
      const { data: row, error } = await supabase
        .from("profiles")
        .select("role,onboarding_completed,dob,first_name,surname,username")
        .eq("id", nextSession.user.id)
        .maybeSingle();
      if (active) {
        if (error) console.warn("[v0] profile load failed", error);
        setProfile(row);
        setProfileLoading(false);
      }
    };
    void supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        setSession(data.session);
        return loadProfile(data.session);
      })
      .catch((error: unknown) => {
        if (!active) return;
        console.warn("[v0] auth session load failed", error);
        setSession(null);
        setProfile(null);
        setProfileLoading(false);
      });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!active) return;
      setSession(next);
      void loadProfile(next);
    });
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
  const ready = session !== undefined && !profileLoading;
  return { user, ready, session };
}

/**
 * Client-side membership gate used by the application shell.
 * Sends unauthenticated visitors to the entrance, and verified members
 * with unfinished onboarding into the access review.
 */
export function useRequireMember({ adminOnly = false, allowIncomplete = false } = {}) {
  const { user, ready } = useAuth();
  const navigate = useNavigate();
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
    if (!allowIncomplete && !user.onboardingCompleted) {
      void navigate({ to: "/onboarding", replace: true });
      return;
    }
    if (adminOnly && user.role !== "admin") {
      void navigate({ to: "/", replace: true });
    }
  }, [ready, user, navigate, adminOnly, allowIncomplete]);

  const allowed =
    !!user &&
    user.emailVerified &&
    (allowIncomplete || user.onboardingCompleted) &&
    (!adminOnly || user.role === "admin");

  return { user, ready, allowed };
}
