import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { SearchBar } from "@/components/common/search-bar";
import { CoinCard, formatPrice, formatCompact } from "@/components/cards/coin-card";
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
import { assets, formatSigned } from "@/lib/placeholder-data";
import { getMarketCoins, type MarketCoin } from "@/lib/markets.functions";
import { useLivePrices } from "@/lib/use-live-prices";
import { cn } from "@/lib/utils";

const PER_PAGE = 25;

export const Route = createFileRoute("/markets")({
  head: () => ({
    meta: [
      { title: "Markets — Insider Domain" },
      {
        name: "description",
        content: "Live prices across 300 instruments, updated continuously inside Insider Domain.",
      },
      { property: "og:title", content: "Markets — Insider Domain" },
      {
        property: "og:description",
        content: "Live prices across 300 instruments, updated continuously inside Insider Domain.",
      },
    ],
  }),
  component: Markets,
});

function Markets() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<MarketCoin | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["market-coins"],
    queryFn: () => getMarketCoins(),
    refetchInterval: 20_000,
    staleTime: 15_000,
  });

  const coins = useLivePrices(data);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return coins;
    return coins.filter((c) => `${c.name} ${c.symbol}`.toLowerCase().includes(q));
  }, [coins, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, totalPages);
  const visible = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const selectedLive = selected
    ? (coins.find((c) => c.id === selected.id) ?? selected)
    : null;

  return (
    <AppShell eyebrow="Live" title="Markets">
      <SearchBar
        value={query}
        onValueChange={(v) => {
          setQuery(v);
          setPage(1);
        }}
        placeholder="Search 300 instruments"
      />

      <SegmentedTabs defaultValue="all" className="mt-6">
        <SegmentedTabsList>
          <SegmentedTabsTrigger value="all">All</SegmentedTabsTrigger>
          <SegmentedTabsTrigger value="held">Held</SegmentedTabsTrigger>
          <SegmentedTabsTrigger value="watch">Watchlist</SegmentedTabsTrigger>
        </SegmentedTabsList>

        <SegmentedTabsContent value="all">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-[72px] animate-pulse rounded-2xl border border-border bg-card" />
              ))}
            </div>
          ) : isError ? (
            <EmptyState
              title="The tape is quiet"
              description="Live pricing is temporarily unavailable. It will resume shortly."
            />
          ) : visible.length ? (
            <>
              <div className="space-y-3">
                {visible.map((coin) => (
                  <CoinCard key={coin.id} coin={coin} onSelect={setSelected} />
                ))}
              </div>
              <Pager
                page={current}
                totalPages={totalPages}
                total={filtered.length}
                onChange={setPage}
              />
            </>
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
                <AssetCard key={asset.id} asset={asset} />
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
        open={selectedLive !== null}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selectedLive?.name ?? ""}
        description={
          selectedLive
            ? `${selectedLive.symbol} · ${formatPrice(selectedLive.price)}`
            : undefined
        }
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
          <Row label="24h change">
            <span
              className={cn(
                (selectedLive?.change24h ?? 0) >= 0 ? "text-positive" : "text-negative",
              )}
            >
              {formatSigned(selectedLive?.change24h ?? 0)}
            </span>
          </Row>
          <Row label="Market cap">{formatCompact(selectedLive?.marketCap ?? 0)}</Row>
          <Row label="24h volume">{formatCompact(selectedLive?.volume24h ?? 0)}</Row>
          <Row label="Rank">{`#${selectedLive?.rank ?? "—"}`}</Row>
        </dl>
      </Sheet>
    </AppShell>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="numeric text-sm">{children}</dd>
    </div>
  );
}

function Pager({
  page,
  totalPages,
  total,
  onChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  onChange: (page: number) => void;
}) {
  return (
    <div className="mt-8 flex items-center justify-between gap-4 border-t border-border pt-5">
      <p className="text-xs text-muted-foreground">
        Page <span className="numeric">{page}</span> of{" "}
        <span className="numeric">{totalPages}</span> · <span className="numeric">{total}</span>{" "}
        instruments
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" strokeWidth={1.75} />
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" strokeWidth={1.75} />
        </Button>
      </div>
    </div>
  );
}
