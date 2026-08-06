import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/app-shell";
import { SearchBar } from "@/components/common/search-bar";
import { AssetCard } from "@/components/cards/asset-card";
import { EmptyState } from "@/components/common/empty-state";
import {
  SegmentedTabs,
  SegmentedTabsContent,
  SegmentedTabsList,
  SegmentedTabsTrigger,
} from "@/components/common/segmented-tabs";
import { Sheet } from "@/components/common/sheet-panel";
import { Button } from "@/components/ui/button";
import { assets, formatCurrency, type Asset } from "@/lib/placeholder-data";
import { Search } from "lucide-react";

export const Route = createFileRoute("/markets")({
  head: () => ({
    meta: [
      { title: "Markets — Insider Domain" },
      {
        name: "description",
        content: "Browse simulated markets and instruments available inside Insider Domain.",
      },
      { property: "og:title", content: "Markets — Insider Domain" },
      {
        property: "og:description",
        content: "Browse simulated markets and instruments available inside Insider Domain.",
      },
    ],
  }),
  component: Markets,
});

function Markets() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Asset | null>(null);

  const filtered = assets.filter((a) =>
    `${a.name} ${a.symbol}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <AppShell eyebrow="Simulated" title="Markets">
      <SearchBar value={query} onValueChange={setQuery} placeholder="Search instruments" />

      <SegmentedTabs defaultValue="all" className="mt-6">
        <SegmentedTabsList>
          <SegmentedTabsTrigger value="all">All</SegmentedTabsTrigger>
          <SegmentedTabsTrigger value="held">Held</SegmentedTabsTrigger>
          <SegmentedTabsTrigger value="watch">Watchlist</SegmentedTabsTrigger>
        </SegmentedTabsList>

        <SegmentedTabsContent value="all">
          {filtered.length ? (
            <div className="space-y-3">
              {filtered.map((asset) => (
                <AssetCard key={asset.id} asset={asset} onSelect={setSelected} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Search />}
              title="Nothing matches that"
              description="Try a different symbol or instrument name."
            />
          )}
        </SegmentedTabsContent>

        <SegmentedTabsContent value="held">
          <div className="space-y-3">
            {assets
              .filter((a) => a.holdings > 0)
              .map((asset) => (
                <AssetCard key={asset.id} asset={asset} onSelect={setSelected} />
              ))}
          </div>
        </SegmentedTabsContent>

        <SegmentedTabsContent value="watch">
          <EmptyState
            title="Your watchlist is empty"
            description="Instruments you follow will appear here."
            action={<Button variant="secondary">Browse markets</Button>}
          />
        </SegmentedTabsContent>
      </SegmentedTabs>

      <Sheet
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected?.name ?? ""}
        description={selected ? `${selected.symbol} · ${formatCurrency(selected.price)}` : undefined}
        footer={
          <>
            <Button full>Buy</Button>
            <Button variant="secondary" full>
              Sell
            </Button>
          </>
        }
      >
        <dl className="space-y-4">
          <div className="flex items-center justify-between">
            <dt className="text-sm text-muted-foreground">Holdings</dt>
            <dd className="numeric text-sm">
              {selected?.holdings.toLocaleString()} {selected?.symbol}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-sm text-muted-foreground">Position value</dt>
            <dd className="numeric text-sm">{formatCurrency(selected?.value ?? 0, 0)}</dd>
          </div>
        </dl>
      </Sheet>
    </AppShell>
  );
}
