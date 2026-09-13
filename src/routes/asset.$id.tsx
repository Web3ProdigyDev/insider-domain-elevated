import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, TrendingDown, TrendingUp } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/common/empty-state";
import { Skeleton, SkeletonCard } from "@/components/common/skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/common/section-header";
import { Sparkline } from "@/components/common/sparkline";
import { CoinLogo } from "@/components/common/coin-logo";
import { TradeSheet, type TradeMode } from "@/components/trade/trade-sheet";
import { formatPrice, formatCompact } from "@/components/cards/coin-card";
import { formatSigned } from "@/lib/format";
import { useMarkets, usePortfolio, type Position } from "@/lib/use-markets";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/asset/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.id} — Insider Domain` },
      {
        name: "description",
        content: "Live price, performance and holdings for this instrument.",
      },
    ],
  }),
  component: AssetDetail,
});

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-eyebrow">{label}</p>
      <p className="numeric mt-3 text-sm text-foreground">{children}</p>
    </div>
  );
}

function AssetDetail() {
  const { id } = Route.useParams();
  const { byId, isLoading, isError } = useMarkets();
  const { positions } = usePortfolio();

  const coin = byId.get(id);
  const position = positions.find((p: Position) => p.id === id);
  const held = (position?.amount ?? 0) > 0;

  const [sheet, setSheet] = React.useState<TradeMode | null>(null);

  if (isLoading) {
    return (
      <AppShell eyebrow="Instrument" title="Loading…">
        <SkeletonCard />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      </AppShell>
    );
  }

  if (isError || !coin) {
    return (
      <AppShell eyebrow="Instrument" title="Not found">
        <EmptyState
          title="Instrument not found"
          description="This asset couldn't be loaded. It may not be listed, or live pricing is temporarily unavailable."
          action={
            <Button asChild size="sm">
              <Link to="/markets">Back to markets</Link>
            </Button>
          }
        />
      </AppShell>
    );
  }

  const positive = coin.change24h >= 0;

  return (
    <AppShell
      eyebrow="Instrument"
      title={coin.name}
      action={
        <Button variant="ghost" size="sm" asChild>
          <Link to="/markets">
            <ArrowLeft /> Markets
          </Link>
        </Button>
      }
    >
      <div className="flex flex-col gap-8">
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <CoinLogo src={coin.image} symbol={coin.symbol} size={44} />
              <div className="min-w-0">
                <p className="truncate text-sm text-foreground">{coin.name}</p>
                <p className="text-xs text-muted-foreground">
                  {coin.symbol} · Rank #{coin.rank}
                </p>
              </div>
            </div>
            {held ? <Badge variant="gold">Held</Badge> : null}
          </div>

          <div className="mt-6 flex items-end justify-between gap-4">
            <div>
              <p className="numeric text-3xl tracking-tight text-foreground">
                {formatPrice(coin.price)}
              </p>
              <p
                className={cn(
                  "numeric mt-1 inline-flex items-center gap-1 text-sm",
                  positive ? "text-positive" : "text-negative",
                )}
              >
                {positive ? (
                  <TrendingUp className="size-3.5" strokeWidth={1.75} />
                ) : (
                  <TrendingDown className="size-3.5" strokeWidth={1.75} />
                )}
                {formatSigned(coin.change24h)} · 24h
              </p>
            </div>
          </div>

          <Sparkline
            seed={`asset-${coin.id}`}
            change={coin.change24h}
            height={96}
            className="mt-6"
          />
        </section>

        {held && position ? (
          <section>
            <SectionHeader title="Your position" />
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card px-5 py-4">
              <div>
                <p className="numeric text-sm text-foreground">
                  {position.amount.toLocaleString()} {coin.symbol}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(position.weight * 100).toFixed(1)}% of portfolio
                </p>
              </div>
              <p className="numeric text-sm text-foreground">{formatPrice(position.value)}</p>
            </div>
          </section>
        ) : null}

        <section>
          <SectionHeader title="Market stats" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat label="Market cap">{formatCompact(coin.marketCap)}</Stat>
            <Stat label="24h volume">{formatCompact(coin.volume24h)}</Stat>
            <Stat label="Rank">#{coin.rank}</Stat>
          </div>
        </section>

        <section className="flex gap-3">
          <Button full onClick={() => setSheet("buy")}>
            Buy {coin.symbol}
          </Button>
          <Button full variant="secondary" disabled={!held} onClick={() => setSheet("sell")}>
            Sell {coin.symbol}
          </Button>
        </section>
      </div>

      {sheet ? (
        <TradeSheet
          mode={sheet}
          open={sheet !== null}
          onOpenChange={(open) => {
            if (!open) setSheet(null);
          }}
          symbol={coin.symbol}
          name={coin.name}
          price={coin.price}
        />
      ) : null}
    </AppShell>
  );
}