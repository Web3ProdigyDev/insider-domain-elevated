import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { SearchBar } from "@/components/common/search-bar";
import { CoinCard } from "@/components/cards/coin-card";
import { AssetCard } from "@/components/cards/asset-card";
import { EmptyState } from "@/components/common/empty-state";
import {
  SegmentedTabs,
  SegmentedTabsContent,
  SegmentedTabsList,
  SegmentedTabsTrigger,
} from "@/components/common/segmented-tabs";
import { Button } from "@/components/ui/button";
import { useMarkets, usePortfolio } from "@/lib/use-markets";

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
  const [view, setView] = useState<"all" | "held" | "gainers">("all");

  const { coins, isLoading, isError } = useMarkets();
  const { positions } = usePortfolio();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return coins;
    return coins.filter((c) => `${c.name} ${c.symbol}`.toLowerCase().includes(q));
  }, [coins, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, totalPages);
  const visible = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  return (
    <AppShell
      eyebrow="Live"
      title="Markets"
      action={
        <Button size="sm" asChild>
          <Link to="/wallet">View wallet</Link>
        </Button>
      }
    >
      <SearchBar
        value={query}
        onValueChange={(v) => {
          setQuery(v);
          setPage(1);
        }}
        placeholder="Search 300 instruments"
      />

      <SegmentedTabs
        value={view}
        onValueChange={(value) => setView(value as typeof view)}
        className="mt-6"
      >
        <SegmentedTabsList>
          <SegmentedTabsTrigger value="all">All</SegmentedTabsTrigger>
          <SegmentedTabsTrigger value="held">Held</SegmentedTabsTrigger>
          <SegmentedTabsTrigger value="gainers">Gainers</SegmentedTabsTrigger>
        </SegmentedTabsList>

        <SegmentedTabsContent value="all">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[72px] animate-pulse rounded-2xl border border-border bg-card"
                />
              ))}
            </div>
          ) : isError ? (
            <EmptyState
              title="The tape is quiet"
              description="Live pricing is temporarily unavailable. It will resume shortly."
            />
          ) : visible.length ? (
            <>
              <div className="flex max-h-[52vh] flex-col gap-3 overflow-y-auto overscroll-contain pr-1">
                {visible.map((coin) => (
                  <CoinCard key={coin.id} coin={coin} />
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
          <div className="flex max-h-[52vh] flex-col gap-3 overflow-y-auto overscroll-contain pr-1">
            {positions.map((position) => (
              <AssetCard key={position.id} position={position} />
            ))}
          </div>
        </SegmentedTabsContent>

        <SegmentedTabsContent value="gainers">
          <div className="flex max-h-[52vh] flex-col gap-3 overflow-y-auto overscroll-contain pr-1">
            {[...coins]
              .sort((a, b) => b.change24h - a.change24h)
              .slice(0, 20)
              .map((coin) => (
                <CoinCard key={coin.id} coin={coin} />
              ))}
          </div>
        </SegmentedTabsContent>
      </SegmentedTabs>
    </AppShell>
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
