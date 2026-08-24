import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, ArrowDownLeft, Plus, Repeat, Crosshair } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PortfolioCard } from "@/components/cards/portfolio-card";
import { AssetCard } from "@/components/cards/asset-card";
import { CoinCard } from "@/components/cards/coin-card";
import { TransactionCard } from "@/components/cards/transaction-card";
import { SectionHeader } from "@/components/common/section-header";
import { QuickActions } from "@/components/common/quick-actions";
import { Sparkline } from "@/components/common/sparkline";
import { AllocationBar } from "@/components/common/allocation-bar";
import { formatSigned } from "@/lib/placeholder-data";
import { useMarkets, usePortfolio } from "@/lib/use-markets";
import { useAuth } from "@/lib/use-auth";
import { getWalletData } from "@/lib/wallet.functions";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview — Insider Domain" },
      {
        name: "description",
        content:
          "Your private overview: live balance, positions, movers and recent activity inside Insider Domain.",
      },
      { property: "og:title", content: "Overview — Insider Domain" },
      {
        property: "og:description",
        content: "Your private overview: live balance, positions, movers and recent activity.",
      },
    ],
  }),
  component: Overview,
});

function Overview() {
  const { user } = useAuth();
  const { positions, balance, change24h, changeValue, isLoading } = usePortfolio();
  const { coins } = useMarkets();
  const walletQuery = useQuery({
    queryKey: ["wallet-data"],
    queryFn: () => getWalletData(),
    retry: false,
  });

  const movers = [...coins]
    .slice(0, 100)
    .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))
    .slice(0, 4);

  return (
    <AppShell
      eyebrow={user ? `${user.firstName} · member` : "Member overview"}
      title="Overview"
      action={
        <Button size="sm" asChild>
          <Link to="/deposit">
            <Plus /> Add funds
          </Link>
        </Button>
      }
    >
      <PortfolioCard
        balance={balance}
        change24h={change24h}
        changeValue={changeValue}
        meta={isLoading ? "Loading the tape…" : `${positions.length} positions · live`}
        action={
          <>
            <Button asChild>
              <Link to="/deposit">Add funds</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link to="/transfer">Transfer</Link>
            </Button>
          </>
        }
      />

      <QuickActions
        className="mt-4"
        actions={[
          { label: "Add funds", icon: Plus, to: "/deposit", accent: true },
          { label: "Transfer", icon: Repeat, to: "/transfer" },
          { label: "Send", icon: ArrowUpRight, to: "/transfer" },
          { label: "Receive", icon: ArrowDownLeft, to: "/receive" },
        ]}
      />

      <section className="mt-10">
        <SectionHeader title="Allocation" />
        <Card padding="lg">
          <AllocationBar positions={positions} />
        </Card>
      </section>

      <section className="mt-10">
        <SectionHeader
          title="Positions"
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/wallet">
                All <ArrowUpRight />
              </Link>
            </Button>
          }
        />
        <div className="space-y-3">
          {positions.slice(0, 4).map((position) => (
            <AssetCard key={position.id} position={position} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <SectionHeader
          title="Movers"
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/markets">
                Markets <ArrowUpRight />
              </Link>
            </Button>
          }
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {movers.map((coin) => (
            <CoinCard key={coin.id} coin={coin} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <SectionHeader title="Sniper AI" />
        <Card padding="lg" variant="raised">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Crosshair className="size-4 text-gold" strokeWidth={1.75} />
                <p className="text-sm text-foreground">Autonomous execution</p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Scanning liquidity across 300 instruments. Simulated entries only.
              </p>
            </div>
            <Badge variant="gold">Armed</Badge>
          </div>
          <Sparkline seed="sniper" change={2.4} height={56} className="mt-5" />
          <div className="mt-5 flex items-center justify-between gap-4">
            <p className="numeric text-xs text-muted-foreground">
              Session P&L <span className="text-positive">{formatSigned(3.42)}</span>
            </p>
            <Button variant="secondary" size="sm" asChild>
              <Link to="/trading">Open desk</Link>
            </Button>
          </div>
        </Card>
      </section>

      <section className="mt-10">
        <SectionHeader
          title="Recent activity"
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/wallet">
                All <ArrowUpRight />
              </Link>
            </Button>
          }
        />
        <div className="space-y-3">
          {(walletQuery.data?.activity ?? []).slice(0, 3).map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={{
                id: transaction.id,
                type: transaction.type as "buy" | "sell" | "deposit" | "withdrawal",
                asset: transaction.assetId,
                amount: Number(transaction.amount),
                value: Number(transaction.amount),
                date: transaction.createdAt.toLocaleDateString(),
                status: transaction.status as "settled" | "pending" | "failed",
              }}
            />
          ))}
          {!walletQuery.isLoading && !walletQuery.data?.activity?.length ? (
            <Card padding="md">
              <p className="text-sm text-muted-foreground">No account activity yet.</p>
            </Card>
          ) : null}
        </div>
      </section>
    </AppShell>
  );
}
