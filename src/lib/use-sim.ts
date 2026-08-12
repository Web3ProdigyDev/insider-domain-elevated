import * as React from "react";

import {
  assistantTick,
  catchUpAssistant,
  getSim,
  hydrateSim,
  simStore,
  type SimState,
} from "./sim-store";

/** Subscribes to the simulated product store. SSR-safe. */
export function useSim(): SimState {
  const state = React.useSyncExternalStore(simStore.subscribe, getSim, getSim);

  React.useEffect(() => {
    hydrateSim();
    catchUpAssistant();
  }, []);

  return state;
}

/**
 * Drives the background assistant. Mount once (the app shell does) so the
 * assistant keeps working on any screen while it is active.
 */
export function useAssistantRuntime(intervalMs = 12_000) {
  const state = useSim();
  const active = state.assistant.status === "active";

  React.useEffect(() => {
    if (!active) return;
    const id = setInterval(() => assistantTick(), intervalMs);
    return () => clearInterval(id);
  }, [active, intervalMs]);
}

export function useUnreadCount() {
  const state = useSim();
  return state.notifications.filter((n) => !n.read).length;
}
