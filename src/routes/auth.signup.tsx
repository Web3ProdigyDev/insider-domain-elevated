import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/layout/auth-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { notify } from "@/lib/notify";
import { signUpWithPassword } from "@/lib/supabase/auth";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({
    meta: [
      { title: "Create membership — Insider Domain" },
      { name: "description", content: "Create a private Insider Domain membership." },
    ],
  }),
  component: SignUpRoute,
});

function SignUpRoute() {
  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [invitation, setInvitation] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const validInvitation = /^ID-\d{4}-[A-Z]{4}$/i.test(invitation.trim());
  const ready =
    name.trim().length >= 2 && email.includes("@") && password.length >= 8 && validInvitation;
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!ready) return;
    setError("");
    const result = await signUpWithPassword({ email, password, name });
    if (result.error) {
      setError("We could not create that membership. Check your details and try again.");
      return;
    }
    setSubmitted(true);
    notify.success("Check your inbox", "Confirm your email to activate membership.");
  };

  return (
    <AuthShell
      eyebrow="Invitation required"
      title="Create your membership"
      description="Verify your email, then secure your wallet in a private setup flow."
      footer={
        <>
          Already a member?{" "}
          <Link to="/auth" className="text-gold underline-offset-4 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <Card padding="lg">
        <form className="space-y-5" onSubmit={submit}>
          {submitted ? (
            <div className="rounded-2xl border border-gold/20 bg-gold-muted/40 p-4 text-sm leading-relaxed text-muted-foreground">
              We sent a confirmation link to <span className="text-foreground">{email}</span>.
              Confirm it, then sign in to continue.
            </div>
          ) : null}
          <Input
            label="Full name"
            autoComplete="name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError("");
            }}
            placeholder="Your name"
          />
          <Input
            label="Invitation code"
            value={invitation}
            onChange={(event) => {
              setInvitation(event.target.value.toUpperCase());
              setError("");
            }}
            placeholder="ID-2291-VELA"
            {...(invitation && !validInvitation ? { error: "Format: ID-0000-ABCD" } : {})}
          />
          <Input
            label="Email address"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError("");
            }}
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
          />
          {error ? <p className="text-xs text-negative">{error}</p> : null}
          <p className="text-xs leading-relaxed text-muted-foreground">
            Your invitation is checked before we create your account. Email confirmation is required
            before access.
          </p>
          <Button type="submit" full disabled={!ready || submitted}>
            {submitted ? "Confirmation sent" : "Create membership"}
          </Button>
        </form>
      </Card>
    </AuthShell>
  );
}
