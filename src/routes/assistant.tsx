import { createFileRoute, Link } from "@tanstack/react-router";
import { CircleDollarSign, Play, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { notify } from "@/lib/notify";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Investment — Insider Domain" },
      { name: "description", content: "A private investment assistant awaiting configuration." },
    ],
  }),
  component: Assistant,
});

function Assistant() {
  return (
    <AppShell eyebrow="Private intelligence" title="AI Investment">
      <SetupAssistant
        onActivate={() =>
          notify.message("AI Investment unavailable", "Assistant execution is not configured yet.")
        }
      />
    </AppShell>
  );
}

function SetupAssistant({ onActivate }: { onActivate: () => void }) {
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
          <Badge variant="secondary">Not configured</Badge>
          <p className="text-xs leading-relaxed text-muted-foreground">
            No portfolio actions are taken until the assistant service is connected.
          </p>
        </div>
      </Card>
      <Button full onClick={onActivate}>
        <Play /> Configure AI Investment
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
