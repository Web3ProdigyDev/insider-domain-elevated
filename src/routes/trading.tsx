import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Crosshair, Power } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/common/section-header";
import { Sparkline } from "@/components/common/sparkline";
import { EmptyState } from "@/components/common/empty-state";
import {
  SegmentedTabs,
  SegmentedTabsContent,
  SegmentedTabsList,
  SegmentedTabsTrigger,
} from "@/components/common/segmented-tabs";
import { TradeLogCard, type TradeLogEntry } from "@/components/cards/trade-log-card";
import { formatSigned } from "@/lib/placeholder-data";
import { notify } from "@/lib/notify";
import { useMarkets } from "@/lib/use-markets";
import { cn } from "@/lib/utils";

const MODES = [
  { id: "measured", label: "Measured", note: "0.5% risk · wide confirmation" },
  { id: "balanced", label: "Balanced", note: "1.2% risk · standard confirmation" },
  { id: "decisive", label: "Decisive", note: "2.4% risk · fast confirmation" },
] as const;

export const Route = createFileRoute("/trading")({
  head: () => ({
    meta: [
      { title: "Trading — Insider Domain" },
      {
        name: "description",
        content:
          "The Sniper AI desk: autonomous, simulated execution across 300 live instruments.",
      },
      { property: "og:title", content: "Trading — Insider Domain" },
      {
        property: "og:description",
        content: "The Sniper AI desk: autonomous, simulated execution across live instruments.",
      },
    ],
  }),
  component: Trading,
});

function Trading() {
  const { coins, isLoading } = useMarkets();
  const [armed, setArmed] = useState(true);
  const [mode, setMode] = useState<(typeof MODES)[number]["id"]>("balanced");
  const [log, setLog] = useState<TradeLogEntry[]>([]);

  // Simulated execution feed. Fires only while the desk is armed.
  useEffect(() => {
    if (!armed || !coins.length) return;
    const id = setInterval(() => {
      const coin = coins[Math.floor(Math.random() * Math.min(coins.length, 120))];
      if (!coin) return;
      const spread = mode === "decisive" ? 4 : mode === "balanced" ? 2.2 : 1.1;
      setLog((prev) =>
        [
          {
            id: `${coin.id}-${Date.now()}`,
            side: coin.change24h >= 0 ? "long" : "short",
            symbol: coin.symbol,
            name: coin.name,
            image: coin.image,
            entry: coin.price,
            pnl: (Math.random() - 0.38) * spread,
            time: new Date().toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
            status: Math.random() > 0.55 ? "open" : "closed",
          } satisfies TradeLogEntry,
          ...prev,
        ].slice(0, 24),
      );
    }, 3600);
    return () => clearInterval(id);
  }, [armed, coins, mode]);

  const stats = useMemo(() => {
    const wins = log.filter((l) => l.pnl >= 0).length;
    const session = log.reduce((sum, l) => sum + l.pnl, 0);
    return {
      session,
      hit: log.length ? (wins / log.length) * 100 : 0,
      fills: log.length,
    };
  }, [log]);

  return (
    <AppShell
      eyebrow="Sniper AI"
      title="Trading"
      action={
        <Button
          variant={armed ? "secondary" : "primary"}
          size="sm"
          onClick={() => {
            setArmed((a) => !a);
            notify.message(armed ? "Desk disarmed" : "Desk armed", "Simulated execution only.");
          }}
        >
          <Power /> {armed ? "Disarm" : "Arm desk"}
        </Button>
      }
    >
      <Card padding="lg" variant="raised">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Crosshair className="size-4 text-gold" strokeWidth={1.75} />
              <p className="text-sm text-foreground">Autonomous execution</p>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {armed
                ? "Scanning liquidity across 300 live instruments."
                : "Standing down. No orders will be placed."}
            </p>
          </div>
          <Badge variant={armed ? "gold" : "default"}>{armed ? "Armed" : "Idle"}</Badge>
        </div>

        <Sparkline seed={`sniper-${mode}`} change={stats.session} height={72} className="mt-6" />

        <dl className="mt-6 grid grid-cols-3 gap-4">
          <Stat label="Session" tone={stats.session >= 0 ? "positive" : "negative"}>
            {formatSigned(stats.session)}
          </Stat>
          <Stat label="Hit rate">{`${stats.hit.toFixed(0)}%`}</Stat>
          <Stat label="Fills">{String(stats.fills)}</Stat>
        </dl>
      </Card>

      <section className="mt-10">
        <SectionHeader title="Posture" />
        <div className="grid gap-3 sm:grid-cols-3">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setMode(m.id);
                notify.message(`Posture set to ${m.label}`);
              }}
              className={cn(
                "rounded-2xl border bg-card px-5 py-4 text-left transition-colors duration-300 ease-[var(--ease-luxe)]",
                mode === m.id
                  ? "border-gold/40 bg-surface-raised"
                  : "border-border hover:border-border-strong hover:bg-surface-raised",
              )}
            >
              <p className="text-sm text-foreground">{m.label}</p>
              <p className="mt-1.5 text-xs text-muted-foreground">{m.note}</p>
            </button>
          ))}
        </div>
      </section>

      <SegmentedTabs defaultValue="live" className="mt-10">
        <SegmentedTabsList>
          <SegmentedTabsTrigger value="live">Live tape</SegmentedTabsTrigger>
          <SegmentedTabsTrigger value="open">Open</SegmentedTabsTrigger>
        </SegmentedTabsList>

        <SegmentedTabsContent value="live">
          {log.length ? (
            <div className="space-y-3">
              {log.map((entry) => (
                <TradeLogCard key={entry.id} entry={entry} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Crosshair />}
              title={isLoading ? "Connecting to the tape" : armed ? "Waiting for a setup" : "Desk idle"}
              description={
                armed
                  ? "Executions will appear here as conditions are met."
                  : "Arm the desk to begin simulated execution."
              }
              {...(armed ? {} : { action: <Button onClick={() => setArmed(true)}>Arm desk</Button> })}
            />
          )}
        </SegmentedTabsContent>

        <SegmentedTabsContent value="open">
          {log.filter((l) => l.status === "open").length ? (
            <div className="space-y-3">
              {log
                .filter((l) => l.status === "open")
                .map((entry) => (
                  <TradeLogCard key={entry.id} entry={entry} />
                ))}
            </div>
          ) : (
            <EmptyState title="No open exposure" description="Closed fills sit in the live tape." />
          )}
        </SegmentedTabsContent>
      </SegmentedTabs>
    </AppShell>
  );
}

function Stat({
  label,
  children,
  tone,
}: {
  label: string;
  children: React.ReactNode;
  tone?: "positive" | "negative" | undefined;
}) {
  return (
    <div>
      <dt className="text-eyebrow">{label}</dt>
      <dd
        className={cn(
          "numeric mt-1.5 text-sm",
          tone === "positive"
            ? "text-positive"
            : tone === "negative"
              ? "text-negative"
              : "text-foreground",
        )}
      >
        {children}
      </dd>
    </div>
  );
}
