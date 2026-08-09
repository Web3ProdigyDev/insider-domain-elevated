import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MailCheck } from "lucide-react";

import { AuthShell } from "@/components/layout/auth-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { notify } from "@/lib/notify";
import { verifyEmail, verificationCodeFor, signOut } from "@/lib/auth-store";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/auth/verify")({
  head: () => ({
    meta: [
      { title: "Verify email — Insider Domain" },
      { name: "description", content: "Confirm your email address to activate your membership." },
      { property: "og:title", content: "Verify email — Insider Domain" },
      {
        property: "og:description",
        content: "Confirm your email address to activate your membership.",
      },
    ],
  }),
  component: Verify,
});

function Verify() {
  const navigate = useNavigate();
  const { user, ready } = useAuth();
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!ready) return;
    if (!user) void navigate({ to: "/auth", replace: true });
    else if (user.emailVerified && !user.onboardingCompleted)
      void navigate({ to: "/onboarding", replace: true });
    else if (user.emailVerified) void navigate({ to: "/", replace: true });
  }, [ready, user, navigate]);

  if (!user) return null;

  const expected = verificationCodeFor(user.email);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim() !== expected) {
      setError("That code does not match.");
      return;
    }
    verifyEmail(user.id);
    notify.success("Email verified", "Your access review is next.");
    void navigate({ to: "/onboarding" });
  };

  return (
    <AuthShell
      eyebrow="Verification"
      title="Confirm your email"
      description={`We sent a six-digit code to ${user.email}. This environment is simulated, so the code is shown below.`}
    >
      <Card padding="lg">
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-gold/25 bg-gold-muted px-4 py-3">
          <MailCheck className="size-4 shrink-0 text-gold" strokeWidth={1.75} />
          <p className="text-sm text-gold">
            Simulated code: <span className="numeric tracking-[0.3em]">{expected}</span>
          </p>
        </div>

        <form className="space-y-5" onSubmit={submit}>
          <Input
            label="Verification code"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/\D/g, ""));
              setError("");
            }}
            placeholder="000000"
            {...(error ? { error } : {})}
          />
          <Button type="submit" full>
            Verify and continue
          </Button>
          <Button
            type="button"
            variant="ghost"
            full
            onClick={() => {
              signOut();
              void navigate({ to: "/auth" });
            }}
          >
            Use a different account
          </Button>
        </form>
      </Card>
    </AuthShell>
  );
}
