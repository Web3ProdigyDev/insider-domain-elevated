import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Pause, Activity, ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/common/section-header";
import { EmptyState } from "@/components/common/empty-state";
import { Sparkline } from "@/components/common/sparkline";
import { notify } from "@/lib/notify";
import { useSim } from "@/lib/use-sim";
import {
  activateAssistant,
  configureAssistant,
  deactivateAssistant,
  focusCopy,
  setAssistantStatus,
  type AssistantFocus,
} from "@/lib/sim-store";
import { cn } from "@/lib/utils";

const SEQUENCE = [
  "Reading your allocation",
  "Assessing market conditions",
  "Calibrating to your focus",
  "Setting risk boundaries",
  "Assistant online",
];

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "Investment Assistant — Insider Domain" },
      {
        name: "description",
        content:
          "Your private investment assistant: choose a focus, activate, and let it review allocation and market conditions continuously.",
      },
      { property: "og:title", content: "Investment Assistant — Insider Domain" },
      {
        property: "og:description",
        content: "Choose a focus, activate, and let the assistant work quietly in the background.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://insider-domain-elevated.lovable.app/assistant" },
    ],
    links: [{ rel: "canonical", href: "https://insider-domain-elevated.lovable.app/assistant" }],
  }),
  component: Assistant,
});

function relative(at: number) {
  const mins = Math.max(0, Math.round((Date.now() - at) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.round(mins / 60)}h ago`;
}

function Assistant() {
  const { assistant } = useSim();
  const [step, setStep] = React.useState(0);

  // Activation sequence.
  React.useEffect(() => {
    if (assistant.status !== "activating") return;
    setStep(0);
    const id = setInterval(() => {
      setStep((s) => {
        if (s >= SEQUENCE.length - 1) {
          clearInterval(id);
          activateAssistant();
          notify.success("Assistant active", "It will keep working in the background.");
          return s;
        }
        return s + 1;
      });
    }, 900);
    return () => clearInterval(id);
  }, [assistant.status]);

  const focus = assistant.focus;
  const active = assistant.status === "active";

  return (
    <AppShell
      eyebrow="Private intelligence"
      title="Investment Assistant"
      action={
        active ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              deactivateAssistant();
              notify.message("Assistant paused", "No further simulated activity.");
            }}
          >
            <Pause /> Pause
          </Button>
        ) : null
      }
    >
      {assistant.status === "activating" ? (
        <Card padding="lg" variant="raised">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 animate-pulse text-gold" strokeWidth={1.75} />
            <p className="text-sm text-foreground">Preparing your assistant</p>
          </div>
          <ul className="mt-6 space-y-3">
            {SEQUENCE.map((line, i) => (
              <li
                key={line}
                className={cn(
                  "flex items-center gap-3 text-sm transition-opacity duration-500 ease-[var(--ease-luxe)]",
                  i <= step ? "text-foreground opacity-100" : "text-muted-foreground opacity-40",
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    i < step ? "bg-gold" : i === step ? "animate-pulse bg-gold" : "bg-border-strong",
                  )}
                />
                {line}
              </li>
            ))}
          </ul>
        </Card>
      ) : active ? (
        <>
          <Card padding="lg" variant="raised">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold/50" />
                    <span className="relative inline-flex size-2 rounded-full bg-gold" />
                  </span>
                  <p className="text-sm text-foreground">Working</p>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {focus ? focusCopy[focus].note : "Monitoring your portfolio continuously."}
                </p>
              </div>
              <Badge variant="gold">{focus ? focusCopy[focus].label : "Active"}</Badge>
            </div>

            <Sparkline seed={`assistant-${focus ?? "x"}`} change={assistant.drift} height={64} className="mt-6" />

            <dl className="mt-6 grid grid-cols-3 gap-4">
              <Stat label="Reviews">{String(assistant.reviews)}</Stat>
              <Stat label="Contribution" tone={assistant.drift >= 0 ? "positive" : "negative"}>
                {`${assistant.drift >= 0 ? "+" : ""}${assistant.drift.toFixed(2)}%`}
              </Stat>
              <Stat label="Last review">
                {assistant.lastTickAt ? relative(assistant.lastTickAt) : "—"}
              </Stat>
            </dl>
          </Card>

          <section className="mt-10">
            <SectionHeader
              title="Activity"
              action={
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/portfolio">Portfolio</Link>
                </Button>
              }
            />
            {assistant.events.length ? (
              <ol className="space-y-3">
                {assistant.events.slice(0, 20).map((e) => (
                  <li
                    key={e.id}
                    className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-4 rounded-2xl border border-border bg-card px-5 py-4"
                  >
                    <Activity className="mt-0.5 size-4 text-muted-foreground" strokeWidth={1.75} />
                    <div className="min-w-0">
                      <p className="truncate text-sm text-foreground">{e.label}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{e.detail}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">{relative(e.at)}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <EmptyState
                icon={<Activity />}
                title="Nothing yet"
                description="The first review will appear here shortly."
              />
            )}
          </section>
        </>
      ) : (
        <>
          <Card padding="lg" variant="raised">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-gold" strokeWidth={1.75} />
              <p className="text-sm text-foreground">Choose how it should invest</p>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              The assistant reviews your allocation, reads market conditions and adjusts within the
              boundaries you set. Everything here is simulated.
            </p>
          </Card>

          <section className="mt-10">
            <SectionHeader title="Focus" />
            <div className="grid gap-3 sm:grid-cols-2">
              {(Object.keys(focusCopy) as AssistantFocus[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => configureAssistant(key)}
                  className={cn(
                    "rounded-2xl border px-5 py-4 text-left transition-colors duration-300 ease-[var(--ease-luxe)]",
                    focus === key
                      ? "border-gold/40 bg-surface-raised"
                      : "border-border bg-card hover:border-border-strong hover:bg-surface-raised",
                  )}
                >
                  <p className="text-sm text-foreground">{focusCopy[key].label}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {focusCopy[key].note}
                  </p>
                </button>
              ))}
            </div>

            <Button
              full
              className="mt-6"
              disabled={!focus}
              onClick={() => setAssistantStatus("activating")}
            >
              <Sparkles /> Activate assistant
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              You can pause at any time. See the{" "}
              <Link to="/privacy" className="text-gold hover:underline">
                privacy policy
              </Link>
              .
            </p>
          </section>
        </>
      )}
    </AppShell>
  );
}

function Stat({
  label,
  tone,
  children,
}: {
  label: string;
  tone?: "positive" | "negative" | undefined;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-eyebrow">{label}</dt>
      <dd
        className={cn(
          "numeric mt-1.5 text-sm",
          tone === "positive" ? "text-positive" : tone === "negative" ? "text-negative" : "text-foreground",
        )}
      >
        {children}
      </dd>
    </div>
  );
}
