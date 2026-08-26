import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { AuthShell } from "@/components/layout/auth-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { notify } from "@/lib/notify";
import { signInWithPassword } from "@/lib/supabase/auth";

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
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    const result = await signInWithPassword(email, password);
    if (result.error) {
      setError("Invalid email or password, or confirm your email first.");
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
            label="Email address"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Your password"
            {...(error ? { error } : {})}
          />
          <Button type="submit" full disabled={!email.includes("@") || password.length < 8}>
            Sign in
          </Button>
          <p className="text-xs leading-relaxed text-muted-foreground">
            New members must confirm their email before signing in.
          </p>
        </form>
      </Card>
    </AuthShell>
  );
}
