import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { AuthShell } from "@/components/layout/auth-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { notify } from "@/lib/notify";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/auth/")({
  head: () => ({
    meta: [
      { title: "Entrance — Insider Domain" },
      {
        name: "description",
        content: "Sign in to your private Insider Domain membership.",
      },
      { property: "og:title", content: "Entrance — Insider Domain" },
      {
        property: "og:description",
        content: "Sign in to your private Insider Domain membership.",
      },
    ],
  }),
  component: SignIn,
});

function SignIn() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = await authClient.signIn.email({ email: identifier.trim(), password });
    if (result.error) {
      setError("Those credentials were not recognised.");
      return;
    }
    notify.success("Welcome back", "Your secure session is active.");
    void navigate({ to: "/" });
  };

  return (
    <AuthShell
      eyebrow="Members only"
      title="Enter Insider Domain"
      description="Access is by invitation. Sign in with the credentials tied to your membership."
      footer={
        <>
          Hold an invitation?{" "}
          <Link to="/auth/signup" className="text-gold underline-offset-4 hover:underline">
            Create your membership
          </Link>
        </>
      }
    >
      <Card padding="lg">
        <form className="space-y-5" onSubmit={submit}>
          <Input
            label="Email or username"
            autoComplete="username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="a.marchetti"
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            {...(error ? { error } : {})}
          />
          <Button type="submit" full>
            Sign in
          </Button>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <Link to="/auth/recover" className="transition-colors hover:text-foreground">
              Forgot password
            </Link>
            <span>Use your account email</span>
          </div>
        </form>
      </Card>
    </AuthShell>
  );
}
