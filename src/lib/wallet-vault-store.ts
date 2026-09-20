import bs58 from "bs58";
import { createClient } from "./supabase/client";
import { getSolanaNetwork } from "./solana-network";

const DATABASE_NAME = "insider-domain-vault";
const STORE_NAME = "vault";
const KEY = "primary";
const ACCOUNT_TABLE = "wallet_vaults";
const SYNC_TO_ACCOUNT = import.meta.env["VITE_SYNC_VAULT_TO_DB"] !== "false";

export type StoredVault = { address: string; encrypted: string };
export const VAULT_BACKUP_ENABLED = SYNC_TO_ACCOUNT;

function logVault(event: string, details?: unknown) {
  if (import.meta.env.DEV) console.info(`[v0] wallet vault: ${event}`, details ?? "");
}

function isSolanaAddress(value: string): boolean {
  try {
    return bs58.decode(value).length === 32;
  } catch {
    return false;
  }
}

function openVaultDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") return reject(new Error("IndexedDB is unavailable."));
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME))
        request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Unable to open wallet vault."));
  });
}

export async function loadVault(): Promise<StoredVault | null> {
  if (typeof indexedDB === "undefined") return null;
  const database = await openVaultDatabase();
  try {
    return await new Promise<StoredVault | null>((resolve, reject) => {
      const request = database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(KEY);
      request.onsuccess = () => {
        const vault = (request.result as StoredVault | undefined) ?? null;
        resolve(vault && isSolanaAddress(vault.address) ? vault : null);
      };
      request.onerror = () => reject(request.error ?? new Error("Unable to read wallet vault."));
    });
  } finally {
    database.close();
  }
}

async function saveLocalVault(value: StoredVault) {
  const database = await openVaultDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const request = database
        .transaction(STORE_NAME, "readwrite")
        .objectStore(STORE_NAME)
        .put(value, KEY);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error ?? new Error("Unable to save wallet vault."));
    });
  } finally {
    database.close();
  }
}

async function currentUserId(): Promise<string | null> {
  const {
    data: { user },
  } = await createClient().auth.getUser();
  return user?.id ?? null;
}

async function pushVaultToAccount(value: StoredVault): Promise<boolean> {
  if (!SYNC_TO_ACCOUNT || getSolanaNetwork() !== "devnet") return false;
  try {
    const userId = await currentUserId();
    if (!userId) return false;
    const { error } = await createClient().from(ACCOUNT_TABLE).upsert(
      {
        user_id: userId,
        address: value.address,
        encrypted: value.encrypted,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("[v0] wallet vault account backup failed", error);
    return false;
  }
}

export async function saveVault(value: StoredVault): Promise<boolean> {
  await saveLocalVault(value);
  return pushVaultToAccount(value);
}

async function fetchAccountVault(): Promise<StoredVault | null> {
  if (!SYNC_TO_ACCOUNT || getSolanaNetwork() !== "devnet") return null;
  try {
    const userId = await currentUserId();
    if (!userId) return null;
    const { data, error } = await createClient()
      .from(ACCOUNT_TABLE)
      .select("address, encrypted")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    const row = data as { address?: unknown; encrypted?: unknown } | null;
    if (
      !row ||
      typeof row.address !== "string" ||
      typeof row.encrypted !== "string" ||
      !isSolanaAddress(row.address)
    )
      return null;
    return { address: row.address, encrypted: row.encrypted };
  } catch (error) {
    console.error("[v0] wallet vault account lookup failed", error);
    return null;
  }
}

export async function peekAccountVault(): Promise<{ address: string } | null> {
  const vault = await fetchAccountVault();
  return vault ? { address: vault.address } : null;
}

export async function restoreVaultFromAccount(): Promise<StoredVault | null> {
  const vault = await fetchAccountVault();
  if (!vault) return null;
  await saveLocalVault(vault);
  return vault;
}

export async function hasVault(): Promise<boolean> {
  return (await loadVault()) !== null;
}

export async function clearVault(): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const database = await openVaultDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const request = database
        .transaction(STORE_NAME, "readwrite")
        .objectStore(STORE_NAME)
        .delete(KEY);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error ?? new Error("Unable to clear wallet vault."));
    });
  } finally {
    database.close();
  }
}
