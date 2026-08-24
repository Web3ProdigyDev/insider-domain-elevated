import * as React from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";

import type { MemberRecord } from "./auth-store";
import { authClient } from "./auth-client";

/** Subscribes to the simulated auth store. SSR-safe. */
export function useAuth() {
  const session = authClient.useSession();
  const user: MemberRecord | null = session.data?.user
    ? ({
        id: session.data.user.id,
        email: session.data.user.email,
        firstName: session.data.user.name.split(" ")[0] ?? session.data.user.name,
        surname: session.data.user.name.split(" ").slice(1).join(" "),
        middleName: "",
        username: session.data.user.email.split("@")[0],
        password: "",
        dob: "",
        invitationCode: "",
        invitedBy: "",
        role: "member",
        emailVerified: session.data.user.emailVerified,
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
        createdAt: session.data.user.createdAt.toISOString(),
      } as MemberRecord)
    : null;

  return { user, ready: !session.isPending, session: session.data };
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
