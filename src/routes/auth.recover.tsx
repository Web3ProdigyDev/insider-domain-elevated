import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { AuthShell } from "@/components/layout/auth-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

  const request = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setError("Enter a valid email");
      return;
    }
    setError("Password reset delivery is not configured yet.");
  };

  const reset = (e: React.FormEvent) => {
    e.preventDefault();
    setError("Password reset delivery is not configured yet.");
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
