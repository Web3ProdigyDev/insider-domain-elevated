import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { KeyRound, LockKeyhole, Plus, Upload } from "lucide-react";
import { AuthShell } from "@/components/layout/auth-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { notify } from "@/lib/notify";
import { createClient } from "@/lib/supabase/client";
import { useRequireMember } from "@/lib/use-auth";
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
  const { allowed } = useRequireMember({ allowIncomplete: true });
  const [mode, setMode] = React.useState<"choose" | "create" | "import">("choose");
  const [material, setMaterial] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [recoveryPhrase, setRecoveryPhrase] = React.useState("");
  const [createdWallet, setCreatedWallet] = React.useState<Wallet | null>(null);
  const [phraseConfirmed, setPhraseConfirmed] = React.useState(false);
  const [showMaterial, setShowMaterial] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [session, setSession] = React.useState<{ user: { id: string } } | null>(null);
  const supabase = React.useMemo(() => createClient(), []);

  React.useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active) setSession(data.session ? { user: { id: data.session.user.id } } : null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      if (active) setSession(next ? { user: { id: next.user.id } } : null);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  React.useEffect(() => {
    if (session === null) return;
  }, [session]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setError("");
    if (password.length < 12 || /^\d+$/.test(password)) {
      setError("Use at least 12 characters and include more than numbers.");
      return;
    }
    if (recoveryPhrase && !phraseConfirmed) {
      setError("Confirm that you wrote down your recovery phrase before continuing.");
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

  if (!allowed || !session) return null;
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
                <label className="mt-4 flex items-start gap-3 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={phraseConfirmed}
                    onChange={(event) => setPhraseConfirmed(event.target.checked)}
                    className="mt-0.5 size-4 accent-gold"
                  />
                  <span>
                    I wrote down this recovery phrase and understand it cannot be recovered.
                  </span>
                </label>
              </div>
            ) : null}
            {mode === "import" ? (
              <Input
                label="Seed phrase or private key"
                type={showMaterial ? "text" : "password"}
                autoComplete="off"
                value={material}
                trailing={
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => setShowMaterial((visible) => !visible)}
                    aria-label={showMaterial ? "Hide wallet material" : "Show wallet material"}
                  >
                    {showMaterial ? "Hide" : "Show"}
                  </button>
                }
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
              type={showPassword ? "text" : "password"}
              trailing={
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide vault password" : "Show vault password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              }
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="12+ characters"
            />
            <Input
              label="Confirm vault password"
              type={showPassword ? "text" : "password"}
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
