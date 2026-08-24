import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, Plus, Minus } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/common/section-header";
import { CoinLogo } from "@/components/common/coin-logo";
import { Sparkline } from "@/components/common/sparkline";
import { CopyField } from "@/components/common/copy-field";
import { QuickActions } from "@/components/common/quick-actions";
import { TransactionCard } from "@/components/cards/transaction-card";
import { TradeSheet, type TradeMode } from "@/components/trade/trade-sheet";
import { formatPrice, formatCompact } from "@/components/cards/coin-card";
import { formatSigned } from "@/lib/placeholder-data";
import { getWalletData } from "@/lib/wallet.functions";
import { useQuery } from "@tanstack/react-query";
import { holdings } from "@/lib/holdings";
import { useMarkets } from "@/lib/use-markets";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/asset/$id")({
  head: () => ({
    meta: [
      { title: "Asset — Insider Domain" },
      {
        name: "description",
        content: "Live price, holdings, address and simulated order actions for one instrument.",
      },
      { property: "og:title", content: "Asset — Insider Domain" },
      {
        property: "og:description",
        content: "Live price, holdings, address and simulated order actions for one instrument.",
      },
    ],
  }),
  component: AssetDetail,
});

function AssetDetail() {
  const { id } = Route.useParams();
  const { byId, isLoading } = useMarkets();
  const walletQuery = useQuery({
    queryKey: ["wallet-data"],
    queryFn: () => getWalletData(),
    retry: false,
  });
  const [mode, setMode] = useState<TradeMode | null>(null);

  const coin = byId.get(id);
  const holding = holdings.find((h) => h.id === id);
  const symbol = coin?.symbol ?? holding?.symbol ?? id.toUpperCase();
  const name = coin?.name ?? holding?.name ?? id;
  const price = coin?.price ?? 0;
  const change = coin?.change24h ?? 0;
  const positive = change >= 0;
  const amount = holding?.amount ?? 0;

  const related = (walletQuery.data?.activity ?? []).filter((t) => t.assetId === id);

  return (
    <AppShell eyebrow={holding ? "Held position" : "Instrument"} title={name}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/markets"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" strokeWidth={1.75} /> Back to markets
        </Link>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Operations:</span>
          <span>buy · sell · send · receive</span>
        </div>
      </div>

      <Card padding="lg" variant="raised">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <CoinLogo src={coin?.image} symbol={symbol} size={44} />
            <div className="min-w-0">
              <p className="truncate text-sm text-foreground">{name}</p>
              <p className="text-eyebrow mt-1">{symbol}</p>
            </div>
          </div>
          <Badge variant={positive ? "positive" : "negative"}>{formatSigned(change)}</Badge>
        </div>

        <p className="numeric mt-6 text-3xl tracking-[var(--tracking-tightest)] text-foreground sm:text-4xl">
          {isLoading ? "—" : formatPrice(price)}
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground">Live mid, refreshed continuously</p>

        <div className="mt-6 rounded-xl border border-border bg-surface-raised/50 p-3">
          <div className="mb-2 flex items-center justify-between text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
            <span>Live chart</span>
            <span>1D</span>
          </div>
          <Sparkline seed={id} change={change} height={92} />
        </div>
      </Card>

      <QuickActions
        className="mt-4"
        actions={[
          { label: "Buy", icon: Plus, onClick: () => setMode("buy"), accent: true },
          { label: "Sell", icon: Minus, onClick: () => setMode("sell") },
          { label: "Send", icon: ArrowUpRight, onClick: () => setMode("send") },
          { label: "Receive", icon: ArrowDownLeft, onClick: () => setMode("receive") },
        ]}
      />

      {holding ? (
        <section className="mt-10">
          <SectionHeader title="Your position" />
          <Card padding="lg">
            <dl className="space-y-4">
              <Row label="Holdings">{`${amount.toLocaleString()} ${symbol}`}</Row>
              <Row label="Market value">{formatPrice(amount * price)}</Row>
              <Row label="Network">{holding.network}</Row>
            </dl>
          </Card>
          <CopyField className="mt-3" label={`${symbol} address`} value={holding.address} />
        </section>
      ) : null}

      <section className="mt-10">
        <SectionHeader title="Market" />
        <Card padding="lg">
          <dl className="space-y-4">
            <Row label="24h change">
              <span className={cn(positive ? "text-positive" : "text-negative")}>
                {formatSigned(change)}
              </span>
            </Row>
            <Row label="Market cap">{formatCompact(coin?.marketCap ?? 0)}</Row>
            <Row label="24h volume">{formatCompact(coin?.volume24h ?? 0)}</Row>
            <Row label="Rank">{coin ? `#${coin.rank}` : "—"}</Row>
          </dl>
        </Card>
      </section>

      {related.length ? (
        <section className="mt-10">
          <SectionHeader title="Activity" />
          <div className="space-y-3">
            {related.map((t) => (
              <TransactionCard
                key={t.id}
                transaction={{
                  id: t.id,
                  type: t.type as "buy" | "sell" | "deposit" | "withdrawal",
                  asset: symbol,
                  amount: Number(t.amount),
                  value: Number(t.amount),
                  date: t.createdAt.toLocaleDateString(),
                  status: t.status as "settled" | "pending" | "failed",
                }}
              />
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-10 flex gap-3">
        <Button full onClick={() => setMode("buy")}>
          Buy {symbol}
        </Button>
        <Button variant="secondary" full onClick={() => setMode("sell")}>
          Sell
        </Button>
      </div>

      <TradeSheet
        mode={mode ?? "buy"}
        open={mode !== null}
        onOpenChange={(open) => !open && setMode(null)}
        symbol={symbol}
        name={name}
        price={price}
        address={holding?.address}
        network={holding?.network}
      />
    </AppShell>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="numeric truncate text-sm text-foreground">{children}</dd>
    </div>
  );
}
