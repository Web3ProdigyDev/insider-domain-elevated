import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { KeyRound, LockKeyhole, Plus, Upload } from "lucide-react";
import { AuthShell } from "@/components/layout/auth-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { notify } from "@/lib/notify";
import { authClient } from "@/lib/auth-client";
import { Wallet } from "ethers";

export const Route = createFileRoute("/wallet-setup")({
  head: () => ({ meta: [{ title: "Secure your wallet — Insider Domain" }] }),
  component: WalletSetup,
});

async function saveVault(wallet: Wallet, password: string) {
  const encrypted = await wallet.encrypt(password);
  const database = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("insider-domain-vault", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("vault");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  await new Promise<void>((resolve, reject) => {
    const request = database
      .transaction("vault", "readwrite")
      .objectStore("vault")
      .put({ address: wallet.address, encrypted }, "primary");
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
  database.close();
  return wallet.address;
}

function WalletSetup() {
  const navigate = useNavigate();
  const [mode, setMode] = React.useState<"choose" | "create" | "import">("choose");
  const [material, setMaterial] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [recoveryPhrase, setRecoveryPhrase] = React.useState("");
  const [createdWallet, setCreatedWallet] = React.useState<Wallet | null>(null);
  const { data: session } = authClient.useSession();

  React.useEffect(() => {
    if (!session?.user) void navigate({ to: "/auth", replace: true });
  }, [navigate, session]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (password.length < 10) {
      setError("Use at least 10 characters for your vault password.");
      return;
    }
    if (password !== confirm) {
      setError("Vault passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const wallet =
        createdWallet ??
        (mode === "create"
          ? Wallet.createRandom()
          : material.trim().split(/\s+/).length >= 12
            ? Wallet.fromPhrase(material.trim())
            : new Wallet(material.trim()));
      if (mode === "create" && !createdWallet) {
        setCreatedWallet(wallet);
        setRecoveryPhrase(wallet.mnemonic?.phrase ?? "");
        setBusy(false);
        return;
      }
      const address = await saveVault(wallet, password);
      notify.success(
        "Wallet secured",
        `Your wallet ${address.slice(0, 8)}…${address.slice(-6)} is encrypted on this device.`,
      );
      void navigate({ to: "/" });
    } catch {
      setError("That wallet material could not be imported. Check it and try again.");
    } finally {
      setBusy(false);
    }
  };

  if (!session?.user) return null;
  return (
    <AuthShell
      eyebrow="Private setup"
      title="Secure your wallet"
      description="Choose how to begin. Key material is encrypted in this browser and never uploaded to Insider Domain."
    >
      <Card padding="lg">
        {mode === "choose" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setMode("create")}
              className="group rounded-2xl border border-border bg-card p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:bg-surface-raised"
            >
              <Plus className="mb-8 size-5 text-gold transition-transform group-hover:rotate-90" />
              <p className="text-sm text-foreground">Create new wallet</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Generate a fresh self-custody wallet on this device.
              </p>
            </button>
            <button
              type="button"
              onClick={() => setMode("import")}
              className="group rounded-2xl border border-border bg-card p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:bg-surface-raised"
            >
              <Upload className="mb-8 size-5 text-gold transition-transform group-hover:-translate-y-1" />
              <p className="text-sm text-foreground">Import wallet</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Use a seed phrase or private key already in your care.
              </p>
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <div className="flex items-center gap-3 rounded-2xl border border-gold/20 bg-gold-muted/40 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
              <LockKeyhole className="size-4 shrink-0 text-gold" />
              Only an encrypted vault is saved in IndexedDB on this device.
            </div>
            {recoveryPhrase ? (
              <div className="rounded-2xl border border-gold/30 bg-gold-muted/50 p-4">
                <p className="text-eyebrow text-gold">Write this down offline</p>
                <p className="mt-3 select-all font-mono text-sm leading-7 text-foreground">
                  {recoveryPhrase}
                </p>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  Anyone with this phrase can control the wallet. We cannot recover it.
                </p>
              </div>
            ) : null}
            {mode === "import" ? (
              <Input
                label="Seed phrase or private key"
                type="password"
                autoComplete="off"
                value={material}
                onChange={(event) => setMaterial(event.target.value)}
                placeholder="Enter wallet material"
              />
            ) : (
              <div className="rounded-2xl border border-border bg-surface p-4 text-sm text-muted-foreground">
                A new recovery phrase will be shown once after creation. Write it down offline
                before continuing.
              </div>
            )}
            <Input
              label="Vault password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="10+ characters"
            />
            <Input
              label="Confirm vault password"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
            />
            {error ? <p className="text-xs text-negative">{error}</p> : null}
            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={() => setMode("choose")}>
                Back
              </Button>
              <Button type="submit" full disabled={busy}>
                {busy ? "Encrypting vault…" : "Secure wallet"} <KeyRound />
              </Button>
            </div>
          </form>
        )}
      </Card>
    </AuthShell>
  );
}
