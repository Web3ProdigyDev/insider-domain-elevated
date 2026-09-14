import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDownToLine, ArrowLeft, TrendingUp } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/common/empty-state";
import { SkeletonCard } from "@/components/common/skeletons";
import { Sparkline } from "@/components/common/sparkline";
import { CoinLogo } from "@/components/common/coin-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, formatCompact } from "@/components/cards/coin-card";
import { formatSigned } from "@/lib/format";
import { useMarkets } from "@/lib/use-markets";
import { useRequireMember } from "@/lib/use-auth";

export const Route = createFileRoute("/asset/$id")({
  head: () => ({ meta: [{ title: "Asset — Insider Domain" }] }),
  component: AssetDetail,
});

function AssetDetail() {
  const { id } = Route.useParams();
  const { ready, allowed } = useRequireMember();
  const { byId, isLoading, isError } = useMarkets();

  if (!ready || !allowed) return null;

  if (isLoading) {
    return (
      <AppShell eyebrow="Markets" title="Asset">
        <SkeletonCard />
      </AppShell>
    );
  }

  const coin = byId.get(id);

  if (isError || !coin) {
    return (
      <AppShell eyebrow="Markets" title="Asset unavailable">
        <EmptyState
          icon={<TrendingUp />}
          title="Asset unavailable"
          description="This asset couldn't be found or the market feed is temporarily unavailable."
          action={
            <Button variant="secondary" asChild>
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
      eyebrow="Markets"
      title={coin.name}
      action={
        <Button variant="ghost" size="sm" asChild>
          <Link to="/markets">
            <ArrowLeft /> Back to markets
          </Link>
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <CoinLogo src={coin.image} symbol={coin.symbol} size={48} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-lg text-foreground">{coin.name}</p>
              <Badge variant="outline">{coin.symbol}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Rank #{coin.rank}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="numeric text-3xl text-foreground">{formatPrice(coin.price)}</p>
          <p
            className={
              "numeric mt-1 text-sm " + (positive ? "text-positive" : "text-negative")
            }
          >
            {formatSigned(coin.change24h)} · 24h
          </p>
          <Sparkline
            seed={coin.id}
            change={coin.change24h}
            height={64}
            className="mt-5"
          />
        </div>

        <section className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-eyebrow">Market cap</p>
            <p className="numeric mt-3 text-sm text-foreground">
              {formatCompact(coin.marketCap)}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-eyebrow">24h volume</p>
            <p className="numeric mt-3 text-sm text-foreground">
              {formatCompact(coin.volume24h)}
            </p>
          </div>
        </section>

        {coin.symbol.toUpperCase() === "SOL" ? (
          <Button asChild size="lg">
            <Link to="/deposit">
              <ArrowDownToLine /> Deposit {coin.symbol}
            </Link>
          </Button>
        ) : null}
      </div>
    </AppShell>
  );
}