import * as React from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";

import {
  authStore,
  currentUser,
  hydrateAuth,
  type MemberRecord,
} from "./auth-store";

/** Subscribes to the simulated auth store. SSR-safe. */
export function useAuth() {
  const state = React.useSyncExternalStore(
    authStore.subscribe,
    authStore.get,
    authStore.get,
  );

  React.useEffect(() => {
    hydrateAuth();
  }, []);

  const [ready, setReady] = React.useState(false);
  React.useEffect(() => setReady(true), []);

  const user: MemberRecord | null = React.useMemo(
    () => state.users.find((u) => u.id === state.sessionId) ?? null,
    [state.users, state.sessionId],
  );

  return { ...state, user, ready };
}

export { currentUser };

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
