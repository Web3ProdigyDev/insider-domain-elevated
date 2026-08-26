import { Wallet } from "ethers";

const DATABASE_NAME = "insider-domain-vault";
const STORE_NAME = "vault";
const KEY = "primary";

type StoredVault = { address: string; encrypted: string };

function openVaultDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadVault(): Promise<StoredVault | null> {
  if (typeof indexedDB === "undefined") return null;
  const database = await openVaultDatabase();
  try {
    return await new Promise<StoredVault | null>((resolve, reject) => {
      const request = database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(KEY);
      request.onsuccess = () => resolve((request.result as StoredVault | undefined) ?? null);
      request.onerror = () => reject(request.error);
    });
  } finally {
    database.close();
  }
}

export async function hasVault(): Promise<boolean> {
  return (await loadVault()) !== null;
}

export async function unlockVault(password: string): Promise<Wallet> {
  const stored = await loadVault();
  if (!stored) throw new Error("No local vault exists.");
  return Wallet.fromEncryptedJson(stored.encrypted, password);
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
      request.onerror = () => reject(request.error);
    });
  } finally {
    database.close();
  }
}

export type { StoredVault };
