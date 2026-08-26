import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AuthShell } from "@/components/layout/auth-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Your details — Insider Domain" }] }),
  component: Onboarding,
});

function Onboarding() {
  const navigate = useNavigate();
  const supabase = React.useMemo(() => createClient(), []);
  const [session, setSession] = React.useState<{ user: { id: string } } | null>(null);
  const [firstName, setFirstName] = React.useState("");
  const [surname, setSurname] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [dob, setDob] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active) setSession(data.session ? { user: { id: data.session.user.id } } : null);
    });
    return () => {
      active = false;
    };
  }, [supabase]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!session) return;
    setError("");
    const age = dob ? Math.floor((Date.now() - new Date(dob).getTime()) / 31_557_600_000) : 0;
    if (firstName.trim().length < 2 || surname.trim().length < 2)
      return setError("Enter your first and last name to continue.");
    if (!/^[a-z0-9_]{3,24}$/i.test(username))
      return setError("Choose a username with 3–24 letters, numbers, or underscores.");
    if (!dob || age < 18) return setError("You must be at least 18 to use this account.");
    setBusy(true);
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        first_name: firstName.trim(),
        surname: surname.trim(),
        username: username.trim().toLowerCase(),
        dob,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.user.id);
    setBusy(false);
    if (updateError) {
      setError("We could not save your details. Please check the fields and try again.");
      return;
    }
    void navigate({ to: "/wallet-setup", replace: true });
  };

  if (!session) return null;
  return (
    <AuthShell
      eyebrow="Step 1 of 2"
      title="Tell us who you are"
      description="A few details help us keep your account secure and confirm funding eligibility."
    >
      <div className="mb-5 flex gap-2" aria-label="Onboarding progress">
        <span className="h-1 flex-1 rounded-full bg-gold" />
        <span className="h-1 flex-1 rounded-full bg-border" />
      </div>
      <Card padding="lg">
        <form className="space-y-5" onSubmit={submit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="First name"
              autoComplete="given-name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
            />
            <Input
              label="Surname"
              autoComplete="family-name"
              value={surname}
              onChange={(event) => setSurname(event.target.value)}
            />
          </div>
          <Input
            label="Username"
            hint="This is how the desk will identify you."
            value={username}
            onChange={(event) => setUsername(event.target.value.replace(/[^a-z0-9_]/gi, ""))}
          />
          <Input
            label="Date of birth"
            type="date"
            value={dob}
            onChange={(event) => setDob(event.target.value)}
          />
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
          <Button type="submit" full disabled={busy}>
            {busy ? "Saving details…" : "Continue to wallet setup"}
          </Button>
        </form>
      </Card>
    </AuthShell>
  );
}
