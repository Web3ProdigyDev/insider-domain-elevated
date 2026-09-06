import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronRight } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { SectionHeader } from "@/components/common/section-header";
import { CoinLogo } from "@/components/common/coin-logo";
import { formatPrice } from "@/components/cards/coin-card";
import { SearchBar } from "@/components/common/search-bar";
import { EmptyState } from "@/components/common/empty-state";
import { SkeletonList } from "@/components/common/skeletons";
import { usePortfolio } from "@/lib/use-markets";
import { useState } from "react";

export const Route = createFileRoute("/transfer")({ component: TransferPicker });

function TransferPicker() {
  const { positions, isLoading } = usePortfolio();
  const [query, setQuery] = useState("");
  const visible = positions.filter((p) =>
    `${p.name} ${p.symbol}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <AppShell eyebrow="Movement" title="Choose an asset">
      <Link
        to="/wallet"
        className="mb-6 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Wallet
      </Link>
      <SectionHeader
        title="What do you want to transfer?"
        description="Select an asset first, then review the amount and destination."
      />
      <SearchBar
        value={query}
        onValueChange={setQuery}
        placeholder="Search your assets"
        className="mb-4"
      />
      <div className="flex flex-col gap-2">
        {isLoading ? (
          <SkeletonList rows={6} />
        ) : visible.length ? (
          visible.map((p) => (
            <Link
              key={p.id}
              to="/transfer/$assetId"
              params={{ assetId: p.id }}
              className="flex w-full items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4 text-left hover:border-border-strong hover:bg-surface-raised"
            >
              <CoinLogo src={p.image} symbol={p.symbol} size={36} />
              <span className="min-w-0">
                <span className="block truncate text-sm text-foreground">{p.name}</span>
                <span className="text-xs text-muted-foreground">
                  {p.amount.toLocaleString()} {p.symbol} available
                </span>
              </span>
              <span className="numeric ml-auto text-sm text-foreground">
                {formatPrice(p.value)}
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Link>
          ))
        ) : (
          <EmptyState title="No assets found" description="Try another asset name or ticker." />
        )}
      </div>
    </AppShell>
  );
}
