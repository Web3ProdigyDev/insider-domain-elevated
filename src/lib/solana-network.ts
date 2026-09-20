import * as React from "react";

export type SolanaNetwork = "devnet" | "mainnet";

const STORAGE_KEY = "insider-domain:solana-network";
const DEFAULT_NETWORK: SolanaNetwork = "devnet";

/** The public mainnet endpoint is rate limited and often refuses browser
 * traffic. Set VITE_SOLANA_MAINNET_RPC to a dedicated endpoint (Helius,
 * QuickNode, Alchemy) before relying on mainnet. */
const RPC_URLS: Record<SolanaNetwork, string> = {
  devnet: import.meta.env["VITE_SOLANA_DEVNET_RPC"] || "https://api.devnet.solana.com",
  mainnet: import.meta.env["VITE_SOLANA_MAINNET_RPC"] || "https://api.mainnet-beta.solana.com",
};

export function getSolanaNetwork(): SolanaNetwork {
  return getSnapshot();
}

export function rpcUrl(network: SolanaNetwork): string {
  return RPC_URLS[network];
}

export function isCustomRpc(network: SolanaNetwork): boolean {
  return network === "mainnet"
    ? Boolean(import.meta.env["VITE_SOLANA_MAINNET_RPC"])
    : Boolean(import.meta.env["VITE_SOLANA_DEVNET_RPC"]);
}

const listeners = new Set<() => void>();
let current: SolanaNetwork | undefined;

function readStored(): SolanaNetwork {
  if (typeof window === "undefined") return DEFAULT_NETWORK;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "mainnet" ? "mainnet" : "devnet";
  } catch {
    return DEFAULT_NETWORK;
  }
}

function getSnapshot(): SolanaNetwork {
  if (current === undefined) current = readStored();
  return current;
}

function getServerSnapshot(): SolanaNetwork {
  return DEFAULT_NETWORK;
}

function emit() {
  listeners.forEach((listener) => listener());
}

export function setSolanaNetwork(next: SolanaNetwork) {
  current = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Storage can be blocked; the in-memory value still applies for this session.
  }
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    current = readStored();
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Selected Solana cluster, remembered per browser. Defaults to devnet. */
export function useSolanaNetwork() {
  const network = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return [network, setSolanaNetwork] as const;
}
