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
  const [firstName, setFirstName] = React.useState("");
  const [surname, setSurname] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const ready =
    firstName.trim().length >= 2 &&
    surname.trim().length >= 2 &&
    email.includes("@") &&
    password.length >= 8;
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!ready || busy) return;
    setError("");
    setBusy(true);
    const result = await signUpWithPassword({ email, password, firstName, surname });
    if (result.error) {
      setError("We could not create that membership. Check your details and try again.");
      setBusy(false);
      return;
    }
    setSubmitted(true);
    notify.success("Check your inbox", "Confirm your email to activate membership.");
  };

  return (
    <AuthShell
      eyebrow="Private membership"
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
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="First name"
              autoComplete="given-name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              placeholder="Ada"
            />
            <Input
              label="Surname"
              autoComplete="family-name"
              value={surname}
              onChange={(event) => setSurname(event.target.value)}
              placeholder="Lovelace"
            />
          </div>
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
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
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
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 8 characters"
          />
          {error ? <p className="text-xs text-negative">{error}</p> : null}
          <p className="text-xs leading-relaxed text-muted-foreground">
            Email confirmation is required before access. If you hold an invitation code, you'll
            enter it during setup after confirming your email.
          </p>
          <Button type="submit" full disabled={!ready || submitted || busy}>
            {submitted ? "Confirmation sent" : busy ? "Creating membership…" : "Create membership"}
          </Button>
        </form>
      </Card>
    </AuthShell>
  );
}
