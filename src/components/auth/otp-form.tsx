"use client";

import * as React from "react";
import { ArrowRight, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

export function OtpForm({
  mode,
  email,
  onEmailChange,
  onSuccess,
}: {
  mode: "sign-in" | "sign-up";
  email: string;
  onEmailChange: (value: string) => void;
  onSuccess: () => void;
}) {
  const [code, setCode] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const [seconds, setSeconds] = React.useState(0);

  React.useEffect(() => {
    if (!seconds) return;
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [seconds]);

  const send = async () => {
    setBusy(true);
    setError("");
    const result = await authClient.emailOtp.sendVerificationOtp({
      email: email.trim(),
      type: "sign-in",
    });
    setBusy(false);
    if (result.error) {
      setError("We could not send a code. Check the email and try again.");
      return;
    }
    setSent(true);
    setSeconds(45);
  };

  const verify = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const result = await authClient.signIn.emailOtp({ email: email.trim(), otp: code });
    setBusy(false);
    if (result.error) {
      setError("That code is invalid or expired. Request a new one.");
      return;
    }
    onSuccess();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-2xl border border-gold/20 bg-gold-muted/40 px-4 py-3 text-sm text-muted-foreground">
        {sent ? (
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-gold" />
        ) : (
          <Mail className="mt-0.5 size-4 shrink-0 text-gold" />
        )}
        <p>
          {sent
            ? `A six-digit code was sent to ${email}.`
            : "We will send a one-time code to your email. No password to remember."}
        </p>
      </div>
      {!sent ? (
        <>
          <Input
            label="Email address"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            placeholder="you@example.com"
          />
          {error ? <p className="text-xs text-negative">{error}</p> : null}
          <Button
            type="button"
            full
            disabled={busy || !email.includes("@")}
            onClick={() => void send()}
          >
            {busy ? "Sending code…" : "Send secure code"} <ArrowRight />
          </Button>
        </>
      ) : (
        <form onSubmit={verify} className="space-y-5">
          <Input
            label="Verification code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(event) => {
              setCode(event.target.value.replace(/\D/g, ""));
              setError("");
            }}
            placeholder="000000"
            {...(error ? { error } : {})}
          />
          <Button type="submit" full disabled={busy || code.length !== 6}>
            {busy ? "Verifying…" : "Verify and continue"}
          </Button>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <button
              type="button"
              className="hover:text-foreground"
              disabled={seconds > 0 || busy}
              onClick={() => void send()}
            >
              {seconds ? `Resend in ${seconds}s` : "Resend code"}
            </button>
            <button
              type="button"
              className="hover:text-foreground"
              onClick={() => {
                setSent(false);
                setCode("");
                setError("");
              }}
            >
              Change email
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
