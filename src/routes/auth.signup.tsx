import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthShell } from "@/components/layout/auth-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { OtpForm } from "@/components/auth/otp-form";
import { notify } from "@/lib/notify";

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
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [invitation, setInvitation] = React.useState("");
  const [error, setError] = React.useState("");
  const validInvitation = /^ID-\d{4}-[A-Z]{4}$/i.test(invitation.trim());
  const ready = name.trim().length >= 2 && email.includes("@") && validInvitation;

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
        <div className="space-y-5">
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
          {ready ? (
            <OtpForm
              mode="sign-up"
              email={email}
              onEmailChange={setEmail}
              onSuccess={() => {
                notify.success("Email verified", "Now secure your wallet.");
                void navigate({ to: "/wallet-setup" });
              }}
            />
          ) : (
            <p className="text-xs leading-relaxed text-muted-foreground">
              Your invitation is checked before we send a one-time verification code.
            </p>
          )}
        </div>
      </Card>
    </AuthShell>
  );
}
