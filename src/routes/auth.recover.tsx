import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { AuthShell } from "@/components/layout/auth-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { notify } from "@/lib/notify";
import { resetPassword, verificationCodeFor } from "@/lib/auth-store";

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
  const [stage, setStage] = React.useState<"request" | "reset">("request");
  const [email, setEmail] = React.useState("");
  const [code, setCode] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [error, setError] = React.useState("");

  const expected = email ? verificationCodeFor(email) : "";

  const request = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setError("Enter a valid email");
      return;
    }
    setError("");
    setStage("reset");
    notify.message("Recovery code issued", "Simulated delivery — the code is shown on screen.");
  };

  const reset = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim() !== expected) return setError("That recovery code does not match.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    const result = resetPassword(email, password);
    if (!result.ok) return setError(result.error);
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              {...(error ? { error } : {})}
            />
            <Button type="submit" full>
              Send recovery code
            </Button>
          </form>
        ) : (
          <form className="space-y-5" onSubmit={reset}>
            <p className="rounded-2xl border border-gold/25 bg-gold-muted px-4 py-3 text-sm text-gold">
              Simulated code: <span className="numeric tracking-[0.3em]">{expected}</span>
            </p>
            <Input
              label="Recovery code"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            />
            <Input
              label="New password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              label="Confirm new password"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              {...(error ? { error } : {})}
            />
            <Button type="submit" full>
              Update password
            </Button>
          </form>
        )}
      </Card>
    </AuthShell>
  );
}
