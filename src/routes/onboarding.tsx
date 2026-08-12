import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, ChevronLeft } from "lucide-react";

import { BrandMark } from "@/components/layout/auth-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import { calculateAge, formatDob } from "@/lib/age";
import {
  completeOnboarding,
  patchOnboarding,
  setOnboardingStep,
  type CommunicationChannel,
  type ExperienceLevel,
} from "@/lib/auth-store";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Access review — Insider Domain" },
      {
        name: "description",
        content: "A short private review before your Insider Domain environment opens.",
      },
      { property: "og:title", content: "Access review — Insider Domain" },
      {
        property: "og:description",
        content: "A short private review before your Insider Domain environment opens.",
      },
    ],
  }),
  component: Onboarding,
});

const CHANNELS: { id: CommunicationChannel; label: string; note: string }[] = [
  { id: "account", label: "Account activity", note: "Movements and confirmations" },
  { id: "security", label: "Security alerts", note: "Sign-ins and credential changes" },
  { id: "messages", label: "Messages", note: "Direct notes from the circle" },
  { id: "market", label: "Market updates", note: "Quiet, infrequent positioning notes" },
  { id: "community", label: "Community activity", note: "Replies and mentions" },
  { id: "product", label: "Product announcements", note: "New capabilities only" },
];

const EXPERIENCE: { id: ExperienceLevel; label: string; note: string }[] = [
  { id: "new", label: "New to digital assets", note: "We will keep language plain." },
  { id: "some", label: "Some experience", note: "You have held assets before." },
  { id: "wallets", label: "Comfortable with wallets", note: "Self-custody is familiar." },
  { id: "advanced", label: "Advanced", note: "You want the detail, not the tour." },
];

const TOTAL = 8;

function Onboarding() {
  const navigate = useNavigate();
  const { user, ready, onboardingStep } = useAuth();
  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    if (!ready) return;
    if (!user) void navigate({ to: "/auth", replace: true });
    else if (!user.emailVerified) void navigate({ to: "/auth/verify", replace: true });
    else if (user.onboardingCompleted) void navigate({ to: "/", replace: true });
  }, [ready, user, navigate]);

  React.useEffect(() => {
    if (ready) setStep(Math.min(onboardingStep, TOTAL - 1));
    // Restore persisted progress once on entry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const go = React.useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(TOTAL - 1, next));
      setStep(clamped);
      setOnboardingStep(clamped);
    },
    [],
  );

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(step + 1);
      if (e.key === "ArrowLeft") go(step - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, go]);

  const touch = React.useRef<number | null>(null);

  if (!user) return null;

  const answers = user.onboarding;
  const age = calculateAge(user.dob);
  const fullName = [user.firstName, user.middleName, user.surname].filter(Boolean).join(" ");

  const finish = () => {
    completeOnboarding(user.id);
    notify.success(`Welcome, ${user.firstName}`, "Your private environment is ready.");
    void navigate({ to: "/", replace: true });
  };

  const steps: { title: string; body: React.ReactNode; footer: React.ReactNode }[] = [
    {
      title: "Let's confirm your details.",
      body: (
        <>
          <dl className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
            <Row label="Surname" value={user.surname} />
            <Row label="First name" value={user.firstName} />
            {user.middleName ? <Row label="Middle name" value={user.middleName} /> : null}
            <Row label="Date of birth" value={formatDob(user.dob)} />
            <Row label="Username" value={user.username} />
            <Row label="Email" value={user.email} />
          </dl>
          <p className="mt-5 text-sm text-muted-foreground">Is the information above accurate?</p>
        </>
      ),
      footer: (
        <>
          <Button
            full
            onClick={() => {
              patchOnboarding(user.id, { identityConfirmed: true });
              go(1);
            }}
          >
            Yes, confirm
          </Button>
          <Button variant="ghost" full onClick={() => navigate({ to: "/settings" })}>
            Edit my information
          </Button>
        </>
      ),
    },
    {
      title: "Age confirmation",
      body: (
        <>
          <p className="text-sm leading-relaxed text-muted-foreground">
            You entered your date of birth as {formatDob(user.dob)}.
          </p>
          <p className="numeric mt-6 text-4xl font-light tracking-tight text-foreground">
            {age} years
          </p>
          <p className="mt-6 text-sm text-muted-foreground">Is this information correct?</p>
        </>
      ),
      footer: (
        <>
          <Button
            full
            onClick={() => {
              patchOnboarding(user.id, { ageConfirmed: true });
              go(2);
            }}
          >
            Yes, confirm
          </Button>
          <Button variant="ghost" full onClick={() => navigate({ to: "/settings" })}>
            Change my information
          </Button>
        </>
      ),
    },
    {
      title: "Confirm your invitation",
      body: (
        <>
          <div className="rounded-2xl border border-border bg-surface px-5 py-4">
            <p className="text-eyebrow">Referring member</p>
            <p className="mt-1.5 text-sm text-foreground">{user.invitedBy}</p>
            <p className="numeric mt-3 text-xs text-muted-foreground">{user.invitationCode}</p>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            Do you confirm that you received this invitation directly from the member listed above?
          </p>
        </>
      ),
      footer: (
        <Button
          full
          onClick={() => {
            patchOnboarding(user.id, { invitationConfirmed: true });
            go(3);
          }}
        >
          Confirm invitation
        </Button>
      ),
    },
    {
      title: "Private membership",
      body: (
        <>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Your invitation is associated with a private referral relationship.
          </p>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            Do you agree not to publicly distribute your invitation code or disclose private
            referral information without permission?
          </p>
        </>
      ),
      footer: (
        <Button
          full
          onClick={() => {
            patchOnboarding(user.id, { privacyAccepted: true });
            go(4);
          }}
        >
          I understand
        </Button>
      ),
    },
    {
      title: "Protect your account",
      body: (
        <>
          <p className="text-sm leading-relaxed text-muted-foreground">
            For your protection, keep your password, verification codes, and account credentials
            private.
          </p>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            Do you understand that you should never share your account credentials with another
            person?
          </p>
        </>
      ),
      footer: (
        <Button
          full
          onClick={() => {
            patchOnboarding(user.id, { securityAccepted: true });
            go(5);
          }}
        >
          Yes, I understand
        </Button>
      ),
    },
    {
      title: "Stay informed",
      body: (
        <div className="space-y-3">
          {CHANNELS.map((channel) => {
            const active = answers.communications.includes(channel.id);
            return (
              <button
                key={channel.id}
                type="button"
                onClick={() =>
                  patchOnboarding(user.id, {
                    communications: active
                      ? answers.communications.filter((c) => c !== channel.id)
                      : [...answers.communications, channel.id],
                  })
                }
                className={cn(
                  "flex w-full items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-colors duration-300 ease-[var(--ease-luxe)]",
                  active
                    ? "border-gold/40 bg-surface-raised"
                    : "border-border bg-card hover:border-border-strong",
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-foreground">{channel.label}</span>
                  <span className="block text-xs text-muted-foreground">{channel.note}</span>
                </span>
                <span
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded-full border",
                    active ? "border-gold bg-gold-muted text-gold" : "border-border-strong",
                  )}
                >
                  {active ? <Check className="size-3" strokeWidth={2} /> : null}
                </span>
              </button>
            );
          })}
        </div>
      ),
      footer: (
        <Button full onClick={() => go(6)}>
          Continue
        </Button>
      ),
    },
    {
      title: "Tell us about your experience",
      body: (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            How familiar are you with digital assets?
          </p>
          <div className="space-y-3">
            {EXPERIENCE.map((option) => {
              const active = answers.experience === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => patchOnboarding(user.id, { experience: option.id })}
                  className={cn(
                    "block w-full rounded-2xl border px-5 py-4 text-left transition-colors duration-300 ease-[var(--ease-luxe)]",
                    active
                      ? "border-gold/40 bg-surface-raised"
                      : "border-border bg-card hover:border-border-strong",
                  )}
                >
                  <span className="block text-sm text-foreground">{option.label}</span>
                  <span className="block text-xs text-muted-foreground">{option.note}</span>
                </button>
              );
            })}
          </div>
        </>
      ),
      footer: (
        <Button full disabled={!answers.experience} onClick={() => go(7)}>
          Continue
        </Button>
      ),
    },
    {
      title: "Your access is ready.",
      body: (
        <>
          <dl className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
            <StatusRow label="Identity" value="Confirmed" />
            <StatusRow label="Invitation" value="Verified" />
            <StatusRow label="Account" value="Active" />
            <StatusRow label="Security" value="Configured" />
          </dl>
          <p className="mt-8 text-lg font-medium tracking-tight text-foreground">
            Welcome, {user.firstName.toUpperCase()}.
          </p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Your private environment is ready.
          </p>
        </>
      ),
      footer: (
        <Button full onClick={finish}>
          Enter Insider Domain
        </Button>
      ),
    },
  ];

  const active = steps[step]!;

  return (
    <div
      className="flex min-h-screen w-full flex-col items-center bg-background px-5 py-10"
      style={{ paddingBottom: "max(2.5rem, env(safe-area-inset-bottom))" }}
      onTouchStart={(e) => (touch.current = e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        if (touch.current === null) return;
        const delta = (e.changedTouches[0]?.clientX ?? 0) - touch.current;
        if (Math.abs(delta) > 70) go(step + (delta < 0 ? 1 : -1));
        touch.current = null;
      }}
    >
      <div className="w-full max-w-lg">
        <div className="mb-8 flex items-center justify-between">
          <BrandMark size={32} />
          <span className="numeric text-xs tracking-[0.2em] text-muted-foreground">
            {String(step + 1).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")}
          </span>
        </div>

        <div className="mb-8 flex gap-1">
          {Array.from({ length: TOTAL }, (_, i) => (
            <span
              key={i}
              className={cn(
                "h-px flex-1 transition-colors duration-500 ease-[var(--ease-luxe)]",
                i <= step ? "bg-gold" : "bg-border",
              )}
            />
          ))}
        </div>

        <Card padding="lg">
          <h1 className="text-xl font-medium tracking-[var(--tracking-tightest)] text-foreground">
            {active.title}
          </h1>
          <div className="mt-6">{active.body}</div>
          <div className="mt-8 space-y-3">{active.footer}</div>
        </Card>

        {step > 0 ? (
          <button
            type="button"
            onClick={() => go(step - 1)}
            className="mt-6 inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-3.5" strokeWidth={1.75} /> Back
          </button>
        ) : null}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 bg-card px-5 py-3.5">
      <dt className="text-eyebrow">{label}</dt>
      <dd className="min-w-0 truncate text-sm text-foreground">{value}</dd>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 bg-card px-5 py-3.5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd>
        <Badge variant="gold">{value}</Badge>
      </dd>
    </div>
  );
}
