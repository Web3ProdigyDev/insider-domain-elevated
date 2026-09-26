import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { AuthShell } from "@/components/layout/auth-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { notify } from "@/lib/notify";
import { useAuth } from "@/lib/use-auth";
import { createClient } from "@/lib/supabase/client";
import { sendPasswordResetEmail, updatePassword } from "@/lib/supabase/auth";

export const Route = createFileRoute("/auth/recover")({
  head: () => ({
    meta: [
      { title: "Recover access — Insider Domain" },
      { name: "description", content: "Reset the password for your Insider Domain membership." },
      { property: "og:title", content: "Recover access — Insider Domain" },
      {
        property: "og:description",
        content: "Reset the password for your Insider Domain membership.",
      },
    ],
  }),
  component: Recover,
});

function Recover() {
  const navigate = useNavigate();
  const { configured } = useAuth();
  const [stage, setStage] = React.useState<"request" | "reset">("request");
  const [email, setEmail] = React.useState("");
  const [code, setCode] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const request = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError("");
    const trimmedEmail = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmedEmail)) {
      setError("Enter a valid email");
      return;
    }
    if (!configured) {
      setError(
        "Recovery is not available here. This environment is missing its Supabase key (VITE_SUPABASE_PUBLISHABLE_KEY).",
      );
      return;
    }
    setBusy(true);
    try {
      const { error: resetError } = await sendPasswordResetEmail(trimmedEmail);
      if (resetError) {
        setError(resetError.message || "Couldn't send a recovery code. Try again.");
        setBusy(false);
        return;
      }
    } catch (caught: unknown) {
      console.warn("[v0] password reset request failed", caught);
      setError("We could not reach the recovery service. Check your connection and try again.");
      setBusy(false);
      return;
    }
    notify.success("Check your email", "Enter the 6-digit code we sent to reset your password.");
    setBusy(false);
    setStage("reset");
  };

  const reset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError("");
    if (code.trim().length < 6) {
      setError("Enter the 6-digit code from your email");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: code.trim(),
        type: "recovery",
      });
      if (verifyError) {
        setError("That code is invalid or has expired. Request a new one.");
        setBusy(false);
        return;
      }
      const { error: updateError } = await updatePassword(password);
      if (updateError) {
        setError(updateError.message || "Couldn't update your password. Try again.");
        setBusy(false);
        return;
      }
    } catch (caught: unknown) {
      console.warn("[v0] password reset failed", caught);
      setError("We could not reach the recovery service. Check your connection and try again.");
      setBusy(false);
      return;
    }
    notify.success("Password updated", "Sign in with your new password.");
    void navigate({ to: "/auth" });
  };

  return (
    <AuthShell
      eyebrow="Recovery"
      title="Recover your access"
      description="We will issue a recovery code to the address tied to your membership."
      footer={
        <Link to="/auth" className="text-gold underline-offset-4 hover:underline">
          Back to entrance
        </Link>
      }
    >
      <Card padding="lg">
        {stage === "request" ? (
          <form className="space-y-5" onSubmit={request}>
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              {...(error ? { error } : {})}
            />
            <Button type="submit" full disabled={busy || !email.includes("@")}>
              {busy ? "Sending recovery code…" : "Send recovery code"}
            </Button>
          </form>
        ) : (
          <form className="space-y-5" onSubmit={reset}>
            <p className="text-xs text-muted-foreground">
              Sent to <span className="text-foreground">{email}</span>.{" "}
              <button
                type="button"
                className="text-gold underline-offset-4 hover:underline"
                onClick={() => {
                  setStage("request");
                  setCode("");
                  setError("");
                }}
              >
                Use a different email
              </button>
            </p>
            <Input
              label="Recovery code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            />
            <Input
              label="New password"
              type={showPassword ? "text" : "password"}
              trailing={
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              label="Confirm new password"
              type={showPassword ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              {...(error ? { error } : {})}
            />
            <Button
              type="submit"
              full
              disabled={busy || code.length < 6 || password.length < 8 || !confirm}
            >
              {busy ? "Updating password…" : "Update password"}
            </Button>
          </form>
        )}
      </Card>
    </AuthShell>
  );
}