import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/app-shell";
import { PortfolioCard } from "@/components/cards/portfolio-card";
import { AssetCard } from "@/components/cards/asset-card";
import { TransactionCard } from "@/components/cards/transaction-card";
import { SectionHeader } from "@/components/common/section-header";
import {
  SegmentedTabs,
  SegmentedTabsContent,
  SegmentedTabsList,
  SegmentedTabsTrigger,
} from "@/components/common/segmented-tabs";
import { assets, portfolio, transactions } from "@/lib/placeholder-data";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — Insider Domain" },
      {
        name: "description",
        content: "Your simulated positions, allocation and settled activity in one quiet view.",
      },
      { property: "og:title", content: "Portfolio — Insider Domain" },
      {
        property: "og:description",
        content: "Your simulated positions, allocation and settled activity in one quiet view.",
      },
    ],
  }),
  component: Portfolio,
});

function Portfolio() {
  return (
    <AppShell eyebrow="Simulated" title="Portfolio">
      <PortfolioCard
        balance={portfolio.balance}
        change24h={portfolio.change24h}
        changeValue={portfolio.changeValue}
        meta={portfolio.allocationLabel}
      />

      <SegmentedTabs defaultValue="positions" className="mt-10">
        <SegmentedTabsList>
          <SegmentedTabsTrigger value="positions">Positions</SegmentedTabsTrigger>
          <SegmentedTabsTrigger value="activity">Activity</SegmentedTabsTrigger>
        </SegmentedTabsList>

        <SegmentedTabsContent value="positions">
          <SectionHeader title={`${assets.length} positions`} />
          <div className="space-y-3">
            {assets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        </SegmentedTabsContent>

        <SegmentedTabsContent value="activity">
          <SectionHeader title="All activity" />
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))}
          </div>
        </SegmentedTabsContent>
      </SegmentedTabs>
    </AppShell>
  );
}
