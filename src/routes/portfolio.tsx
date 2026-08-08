import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Repeat } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PortfolioCard } from "@/components/cards/portfolio-card";
import { AssetCard } from "@/components/cards/asset-card";
import { TransactionCard } from "@/components/cards/transaction-card";
import { SectionHeader } from "@/components/common/section-header";
import { AllocationBar } from "@/components/common/allocation-bar";
import { QuickActions } from "@/components/common/quick-actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  SegmentedTabs,
  SegmentedTabsContent,
  SegmentedTabsList,
  SegmentedTabsTrigger,
} from "@/components/common/segmented-tabs";
import { transactions } from "@/lib/placeholder-data";
import { usePortfolio } from "@/lib/use-markets";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — Insider Domain" },
      {
        name: "description",
        content: "Live positions, allocation and settled activity in one quiet view.",
      },
      { property: "og:title", content: "Portfolio — Insider Domain" },
      {
        property: "og:description",
        content: "Live positions, allocation and settled activity in one quiet view.",
      },
    ],
  }),
  component: Portfolio,
});

function Portfolio() {
  const { positions, balance, change24h, changeValue, isLoading } = usePortfolio();

  return (
    <AppShell eyebrow="Simulated" title="Portfolio">
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
        ]}
      />

      <SegmentedTabs defaultValue="positions" className="mt-10">
        <SegmentedTabsList>
          <SegmentedTabsTrigger value="positions">Positions</SegmentedTabsTrigger>
          <SegmentedTabsTrigger value="allocation">Allocation</SegmentedTabsTrigger>
          <SegmentedTabsTrigger value="activity">Activity</SegmentedTabsTrigger>
        </SegmentedTabsList>

        <SegmentedTabsContent value="positions">
          <SectionHeader title={`${positions.length} positions`} />
          <div className="space-y-3">
            {positions.map((position) => (
              <AssetCard key={position.id} position={position} />
            ))}
          </div>
        </SegmentedTabsContent>

        <SegmentedTabsContent value="allocation">
          <SectionHeader title="Weighting" />
          <Card padding="lg">
            <AllocationBar positions={positions} />
          </Card>
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
