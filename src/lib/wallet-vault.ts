import bs58 from "bs58";
import { loadVault, saveVault } from "./wallet-vault-store";

const SOLANA_DERIVATION_PATH = "m/44'/501'/0'/0'";

type Wallet = { address: string; secretKey: Uint8Array };
export type { StoredVault } from "./wallet-vault-store";
export type WalletWithMnemonic = Wallet & { mnemonic: string; backedUp: boolean };

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(value: string) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
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

async function walletFromSecret(secretKey: Uint8Array): Promise<Wallet> {
  const { Keypair } = await import("@solana/web3.js");
  const keypair = Keypair.fromSecretKey(secretKey);
  return { address: keypair.publicKey.toBase58(), secretKey: keypair.secretKey };
}

export async function createWallet(password: string): Promise<WalletWithMnemonic> {
  const bip39 = await import("bip39");
  const { derivePath } = await import("ed25519-hd-key");
  const mnemonic = bip39.generateMnemonic(128);
  const seed = await bip39.mnemonicToSeed(mnemonic);
  const wallet = await walletFromSecret(
    derivePath(SOLANA_DERIVATION_PATH, seed.toString("hex")).key,
  );
  const backedUp = await saveVault({
    address: wallet.address,
    encrypted: await encryptSecret(wallet.secretKey, password),
  });
  return { ...wallet, mnemonic, backedUp };
}

function secretKeyFromRawInput(input: string): Uint8Array | null {
  const trimmed = input.trim();
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed) && parsed.every((n) => Number.isInteger(n)))
        return Uint8Array.from(parsed as number[]);
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

export async function importWallet(input: string, password: string): Promise<WalletWithMnemonic> {
  const bip39 = await import("bip39");
  const { derivePath } = await import("ed25519-hd-key");
  const trimmed = input.trim();
  if (!trimmed.includes(" ")) {
    const secretKey = secretKeyFromRawInput(trimmed);
    if (secretKey) {
      try {
        const wallet = await walletFromSecret(secretKey);
        const backedUp = await saveVault({
          address: wallet.address,
          encrypted: await encryptSecret(wallet.secretKey, password),
        });
        return { ...wallet, mnemonic: "", backedUp };
      } catch {
        throw new Error("That private key isn't valid. Check it and try again.");
      }
    }
  }
  const normalized = trimmed.toLowerCase().replace(/\s+/g, " ");
  if (!(await bip39.validateMnemonic(normalized)))
    throw new Error("That recovery phrase or private key isn't valid. Check it and try again.");
  const seed = await bip39.mnemonicToSeed(normalized);
  const wallet = await walletFromSecret(
    derivePath(SOLANA_DERIVATION_PATH, seed.toString("hex")).key,
  );
  const backedUp = await saveVault({
    address: wallet.address,
    encrypted: await encryptSecret(wallet.secretKey, password),
  });
  return { ...wallet, mnemonic: normalized, backedUp };
}

export async function unlockVault(password: string): Promise<Wallet> {
  const stored = await loadVault();
  if (!stored) throw new Error("No local vault exists.");
  const wallet = await walletFromSecret(await decryptSecret(stored.encrypted, password));
  if (wallet.address !== stored.address) throw new Error("Wallet vault verification failed.");
  return wallet;
}
