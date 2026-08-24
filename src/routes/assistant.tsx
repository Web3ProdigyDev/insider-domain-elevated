import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Check,
  CircleDollarSign,
  Pause,
  Play,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/empty-state";
import { notify } from "@/lib/notify";
import { useSim } from "@/lib/use-sim";
import {
  activateAssistant,
  assistantTick,
  catchUpAssistant,
  deactivateAssistant,
  setAssistantStatus,
} from "@/lib/sim-store";
import { cn } from "@/lib/utils";

const SEQUENCE = [
  "Reading your allocation",
  "Assessing market conditions",
  "Setting quiet safeguards",
  "Investment assistant online",
];

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Investment — Insider Domain" },
      { name: "description", content: "A private investment assistant awaiting configuration." },
    ],
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
  const active = assistant.status === "active";

  React.useEffect(() => {
    if (assistant.status !== "activating") return;
    setStep(0);
  }, [assistant.status]);

  return (
    <AppShell
      eyebrow="Private intelligence"
      title="AI Investment"
      action={
        active ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              deactivateAssistant();
              notify.message(
                "AI Investment paused",
                "No further simulated activity will be recorded.",
              );
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
            <Sparkles className="size-4 text-gold" />
            <p className="text-sm text-foreground">Preparing a quiet investment companion</p>
          </div>
          <ul className="mt-6 flex flex-col gap-3">
            {SEQUENCE.map((line, index) => (
              <li
                key={line}
                className={cn(
                  "flex items-center gap-3 text-sm",
                  index <= step ? "text-foreground" : "text-muted-foreground opacity-45",
                )}
              >
                <span
                  className={cn(
                    "grid size-5 place-items-center rounded-full border",
                    index < step
                      ? "border-gold/40 bg-gold-muted text-gold"
                      : index === step
                        ? "border-gold text-gold"
                        : "border-border-strong",
                  )}
                >
                  {index < step ? <Check className="size-3" /> : index + 1}
                </span>
                {line}
              </li>
            ))}
          </ul>
        </Card>
      ) : active ? (
        <ActiveAssistant assistant={assistant} />
      ) : (
        <SetupAssistant
          onActivate={() =>
            notify.message(
              "AI Investment unavailable",
              "Assistant execution is not configured yet.",
            )
          }
          hasActivatedBefore={assistant.hasActivatedBefore}
        />
      )}
    </AppShell>
  );
}

function SetupAssistant({
  onActivate,
  hasActivatedBefore,
}: {
  onActivate: () => void;
  hasActivatedBefore: boolean;
}) {
  return (
    <section className="flex flex-col gap-6">
      <Card padding="lg" variant="raised">
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_220px] md:items-center">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-gold-muted text-gold">
              <Sparkles className="size-4" />
            </span>
            <div>
              <p className="text-sm text-foreground">AI Investment is off</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Assistant portfolio review is unavailable until the service is configured.
              </p>
            </div>
          </div>
          <AICompanion state="idle" />
        </div>
        <div className="mt-6 flex items-start gap-3 border-t border-border pt-5">
          <Badge variant="secondary">Simulation only</Badge>
          <p className="text-xs leading-relaxed text-muted-foreground">
            No real trades, wallets, private keys, or financial advice are involved.
          </p>
        </div>
      </Card>
      <Button full onClick={onActivate}>
        <Play /> {hasActivatedBefore ? "Turn AI Investment on" : "Activate AI Investment"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        You can pause at any time.{" "}
        <Link to="/privacy" className="text-gold hover:underline">
          Read the privacy policy
        </Link>
        .
      </p>
    </section>
  );
}

function ActiveAssistant({ assistant }: { assistant: ReturnType<typeof useSim>["assistant"] }) {
  return (
    <div className="flex flex-col gap-8">
      <Card padding="lg" variant="raised">
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_220px] md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-gold shadow-[0_0_0_5px] shadow-gold/10" />
              <p className="text-sm text-foreground">Working quietly</p>
            </div>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Reviewing allocation, market conditions, and simulated activity while you go about
              your day.
            </p>
          </div>
          <div className="flex items-center justify-between gap-4 md:flex-col md:items-end">
            <AICompanion state="active" />
            <Badge variant="gold">Active</Badge>
          </div>
        </div>
        <dl className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-4">
          <Stat label="Reviews">{assistant.reviews}</Stat>
          <Stat label="Contribution">{`${assistant.drift >= 0 ? "+" : ""}${assistant.drift.toFixed(2)}%`}</Stat>
          <Stat label="Last review">
            {assistant.lastTickAt ? relative(assistant.lastTickAt) : "—"}
          </Stat>
          <Stat label="State">Online</Stat>
        </dl>
      </Card>
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          to="/markets"
          className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground transition-colors hover:border-border-strong hover:bg-surface-raised"
        >
          <BarChart3 className="size-4 text-gold" />
          <span>Review market signals</span>
        </Link>
        <Link
          to="/markets"
          className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground transition-colors hover:border-border-strong hover:bg-surface-raised"
        >
          <CircleDollarSign className="size-4 text-gold" />
          <span>Open portfolio</span>
        </Link>
      </div>
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-eyebrow">Quiet activity</p>
            <h2 className="mt-1 text-lg text-foreground">While you were away</h2>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              assistantTick();
              notify.success("Review complete", "A simulated portfolio review was recorded.");
            }}
          >
            <RefreshCw /> Review now
          </Button>
        </div>
        {assistant.events.length ? (
          <ol className="flex flex-col gap-3">
            {assistant.events.slice(0, 12).map((event) => (
              <li
                key={event.id}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-4 rounded-2xl border border-border bg-card px-5 py-4"
              >
                <Activity className="mt-0.5 size-4 text-gold" />
                <div>
                  <p className="text-sm text-foreground">{event.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {event.detail}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">{relative(event.at)}</span>
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
    </div>
  );
}

function AICompanion({ state }: { state: "active" | "idle" }) {
  const active = state === "active";
  return (
    <div
      className={cn("ai-companion", active && "ai-companion-active")}
      role="img"
      aria-label={active ? "AI companion is working" : "AI companion is idle"}
    >
      <div className="ai-companion-face">
        <span className="ai-companion-eye" />
        <span className="ai-companion-eye" />
        <span className="ai-companion-mouth" />
      </div>
      <span className="ai-companion-signal">{active ? <TrendingUp /> : <CircleDollarSign />}</span>
      <span className="ai-companion-label">{active ? "scanning" : "standby"}</span>
    </div>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-eyebrow">{label}</dt>
      <dd className="numeric mt-1.5 text-sm text-foreground">{children}</dd>
    </div>
  );
}

export default Assistant;

export { Assistant };

// Keep the route's component declaration above as the TanStack entry point.
void Activity;
void Check;
void Pause;
void Play;
void Sparkles;
void cn;
void Card;
void Button;
void Badge;
void EmptyState;
void Link;
void React;
void notify;
void useSim;
void activateAssistant;
void assistantTick;
void catchUpAssistant;
void deactivateAssistant;
void setAssistantStatus;
void AppShell;
