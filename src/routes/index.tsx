import { createFileRoute } from "@tanstack/react-router";
import { Plus, ArrowUpRight } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { PortfolioCard } from "@/components/cards/portfolio-card";
import { AssetCard } from "@/components/cards/asset-card";
import { TransactionCard } from "@/components/cards/transaction-card";
import { SectionHeader } from "@/components/common/section-header";
import { assets, portfolio, transactions, demoMember } from "@/lib/placeholder-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview — Insider Domain" },
      {
        name: "description",
        content:
          "Your private overview: simulated balance, positions and recent activity inside Insider Domain.",
      },
      { property: "og:title", content: "Overview — Insider Domain" },
      {
        property: "og:description",
        content: "Your private overview: simulated balance, positions and recent activity.",
      },
    ],
  }),
  component: Overview,
});

function Overview() {
  return (
    <AppShell
      eyebrow={`${demoMember.tier} member`}
      title="Overview"
      action={
        <Button variant="secondary" size="sm">
          <Plus /> Simulate
        </Button>
      }
    >
      <PortfolioCard
        balance={portfolio.balance}
        change24h={portfolio.change24h}
        changeValue={portfolio.changeValue}
        meta={portfolio.allocationLabel}
        action={
          <>
            <Button variant="primary">Add funds</Button>
            <Button variant="secondary">Transfer</Button>
          </>
        }
      />

      <section className="mt-10">
        <SectionHeader
          title="Positions"
          action={
            <Button variant="ghost" size="sm">
              All <ArrowUpRight />
            </Button>
          }
        />
        <div className="space-y-3">
          {assets.slice(0, 3).map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <SectionHeader title="Recent activity" />
        <div className="space-y-3">
          {transactions.slice(0, 3).map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))}
        </div>
      </section>
    </AppShell>
  );
}
