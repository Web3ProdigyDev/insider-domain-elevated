import * as bip39 from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

const DATABASE_NAME = "insider-domain-vault";
const STORE_NAME = "vault";
const KEY = "primary";
const SOLANA_DERIVATION_PATH = "m/44'/501'/0'/0'";

type StoredVault = { address: string; encrypted: string };

export type Wallet = {
  address: string;
  secretKey: Uint8Array;
};

/** Returned by createWallet/importWallet, which also hand back the mnemonic
 * so the caller can display it once for backup. Type-only addition — no
 * change to createWallet/importWallet's runtime behavior. */
export type WalletWithMnemonic = Wallet & { mnemonic: string };

function logVault(event: string, details?: unknown) {
  if (import.meta.env.DEV) console.info(`[v0] wallet vault: ${event}`, details ?? "");
}

function isSolanaAddress(value: string): boolean {
  try {
    return new PublicKey(value).toBase58() === value;
  } catch {
    return false;
  }
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function deriveEncryptionKey(password: string, salt: Uint8Array) {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 310_000, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

async function encryptSecret(secretKey: Uint8Array, password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveEncryptionKey(password, salt);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, secretKey);
  return [bytesToBase64(salt), bytesToBase64(iv), bytesToBase64(new Uint8Array(encrypted))].join(
    ".",
  );
}

async function decryptSecret(value: string, password: string) {
  const [saltValue, ivValue, encryptedValue] = value.split(".");
  if (!saltValue || !ivValue || !encryptedValue) throw new Error("Invalid encrypted wallet data.");
  const key = await deriveEncryptionKey(password, base64ToBytes(saltValue));
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBytes(ivValue) },
    key,
    base64ToBytes(encryptedValue),
  );
  return new Uint8Array(decrypted);
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
  if (typeof indexedDB === "undefined") {
    logVault("IndexedDB unavailable");
    return null;
  }
  const database = await openVaultDatabase();
  try {
    return await new Promise<StoredVault | null>((resolve, reject) => {
      const request = database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(KEY);
      request.onsuccess = () => {
        const vault = (request.result as StoredVault | undefined) ?? null;
        if (vault && !isSolanaAddress(vault.address)) {
          logVault("stale/incompatible vault ignored (not a Solana address)", {
            address: vault.address,
          });
          resolve(null);
          return;
        }
        logVault(
          vault ? "vault found" : "vault empty",
          vault ? { address: vault.address } : undefined,
        );
        resolve(vault);
      };
      request.onerror = () => reject(request.error ?? new Error("Unable to read wallet vault."));
    });
  } finally {
    database.close();
  }
}

async function saveVault(value: StoredVault) {
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

export async function hasVault(): Promise<boolean> {
  return (await loadVault()) !== null;
}

function walletFromSecret(secretKey: Uint8Array): Wallet {
  const keypair = Keypair.fromSecretKey(secretKey);
  return { address: keypair.publicKey.toBase58(), secretKey: keypair.secretKey };
}

export async function createWallet(password: string) {
  const mnemonic = bip39.generateMnemonic(128);
  const seed = await bip39.mnemonicToSeed(mnemonic);
  const derived = derivePath(SOLANA_DERIVATION_PATH, seed.toString("hex")).key;
  const wallet = walletFromSecret(derived);
  await saveVault({
    address: wallet.address,
    encrypted: await encryptSecret(wallet.secretKey, password),
  });
  logVault("Solana wallet created", { address: wallet.address });
  return { ...wallet, mnemonic };
}

function secretKeyFromRawInput(input: string): Uint8Array | null {
  const trimmed = input.trim();
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.every((n) => Number.isInteger(n))) {
        return Uint8Array.from(parsed as number[]);
      }
    } catch {
      return null;
    }
    return null;
  }
  try {
    const decoded = bs58.decode(trimmed);
    return decoded.length ? decoded : null;
  } catch {
    return null;
  }
}

export async function importWallet(input: string, password: string) {
  const trimmed = input.trim();
  const looksLikePhrase = trimmed.includes(" ");

  if (!looksLikePhrase) {
    const secretKey = secretKeyFromRawInput(trimmed);
    if (secretKey) {
      let wallet: Wallet;
      try {
        wallet = walletFromSecret(secretKey);
      } catch {
        throw new Error("That private key isn't valid. Check it and try again.");
      }
      await saveVault({
        address: wallet.address,
        encrypted: await encryptSecret(wallet.secretKey, password),
      });
      logVault("Solana wallet imported from private key", { address: wallet.address });
      return { ...wallet, mnemonic: "" };
    }
  }

  const normalized = trimmed.toLowerCase().replace(/\s+/g, " ");
  if (!(await bip39.validateMnemonic(normalized))) {
    throw new Error("That recovery phrase or private key isn't valid. Check it and try again.");
  }
  const seed = await bip39.mnemonicToSeed(normalized);
  const derived = derivePath(SOLANA_DERIVATION_PATH, seed.toString("hex")).key;
  const wallet = walletFromSecret(derived);
  await saveVault({
    address: wallet.address,
    encrypted: await encryptSecret(wallet.secretKey, password),
  });
  logVault("Solana wallet imported from mnemonic", { address: wallet.address });
  return { ...wallet, mnemonic: normalized };
}

export async function unlockVault(password: string): Promise<Wallet> {
  logVault("unlock requested");
  const stored = await loadVault();
  if (!stored) throw new Error("No local vault exists.");
  const wallet = walletFromSecret(await decryptSecret(stored.encrypted, password));
  if (wallet.address !== stored.address) throw new Error("Wallet vault verification failed.");
  return wallet;
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

export type { StoredVault };