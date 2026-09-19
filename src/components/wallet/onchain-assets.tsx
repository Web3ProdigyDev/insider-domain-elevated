import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  SegmentedTabs,
  SegmentedTabsList,
  SegmentedTabsTrigger,
} from "@/components/common/segmented-tabs";
import { CoinLogo } from "@/components/common/coin-logo";
import { SolanaLogo } from "@/components/common/solana-logo";
import { SkeletonCard } from "@/components/common/skeletons";
import { useMarkets } from "@/lib/use-markets";
import { fetchSolanaHoldings, type TokenHolding } from "@/lib/solana-assets";
import { isCustomRpc, useSolanaNetwork } from "@/lib/solana-network";

const COLLAPSED_UNKNOWN_TOKENS = 5;

function formatAmount(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: value >= 1 ? 4 : 8 });
}

function formatUsd(value: number) {
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function shortMint(mint: string) {
  return `${mint.slice(0, 4)}…${mint.slice(-4)}`;
}

function AssetRow({
  logo,
  name,
  subtitle,
  amountLabel,
  valueLabel,
}: {
  logo: React.ReactNode;
  name: string;
  subtitle: string;
  amountLabel: string;
  valueLabel: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
      {logo}
      <span className="min-w-0">
        <span className="block truncate text-sm text-foreground">{name}</span>
        <span className="block truncate text-xs text-muted-foreground">{subtitle}</span>
      </span>
      <span className="ml-auto shrink-0 text-right">
        <span className="numeric block text-sm text-foreground">{amountLabel}</span>
        <span className="numeric block text-xs text-muted-foreground">{valueLabel}</span>
      </span>
    </div>
  );
}

export function OnchainAssets({ address }: { address: string }) {
  const [network, setNetwork] = useSolanaNetwork();
  const { byId } = useMarkets();
  const [showAll, setShowAll] = React.useState(false);
  const isMainnet = network === "mainnet";

  const query = useQuery({
    queryKey: ["solana-holdings", network, address],
    queryFn: () => fetchSolanaHoldings(address, network),
    retry: 1,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const solPrice = byId.get("solana")?.price;
  const holdings = query.data;

  const unknownTokens = (holdings?.tokens ?? []).filter((token) => !token.known);
  const hiddenCount = showAll ? 0 : Math.max(0, unknownTokens.length - COLLAPSED_UNKNOWN_TOKENS);
  const visibleTokens = (holdings?.tokens ?? []).filter((token, _index, all) => {
    if (token.known || showAll) return true;
    return all.filter((item) => !item.known).indexOf(token) < COLLAPSED_UNKNOWN_TOKENS;
  });

  const renderToken = (token: TokenHolding) => {
    const coin = token.known?.coingeckoId ? byId.get(token.known.coingeckoId) : undefined;
    const usd = isMainnet && coin?.price ? token.amount * coin.price : null;
    return (
      <AssetRow
        key={token.mint}
        logo={<CoinLogo src={coin?.image} symbol={token.known?.symbol ?? "?"} size={32} />}
        name={token.known?.name ?? "Unknown token"}
        subtitle={token.known ? token.known.symbol : shortMint(token.mint)}
        amountLabel={`${formatAmount(token.amount)}${token.known ? ` ${token.known.symbol}` : ""}`}
        valueLabel={
          isMainnet ? (usd !== null ? formatUsd(usd) : "Price unavailable") : "Test token"
        }
      />
    );
  };

  return (
    <section aria-label="On-chain assets">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <p className="text-eyebrow">On-chain assets</p>
          <Badge variant={isMainnet ? "gold" : "default"}>{isMainnet ? "Mainnet" : "Devnet"}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void query.refetch()}
            disabled={query.isFetching}
            aria-label="Refresh on-chain balances"
          >
            <RefreshCw className={query.isFetching ? "animate-spin" : undefined} />
          </Button>
          <SegmentedTabs
            value={network}
            onValueChange={(value) => {
              setShowAll(false);
              setNetwork(value === "mainnet" ? "mainnet" : "devnet");
            }}
          >
            <SegmentedTabsList aria-label="Solana network">
              <SegmentedTabsTrigger value="devnet">Devnet</SegmentedTabsTrigger>
              <SegmentedTabsTrigger value="mainnet">Mainnet</SegmentedTabsTrigger>
            </SegmentedTabsList>
          </SegmentedTabs>
        </div>
      </div>

      {isMainnet ? (
        <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
          Mainnet balances are real funds. Values below come from the live network.
        </p>
      ) : null}

      {query.isLoading ? (
        <div className="flex flex-col gap-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : query.isError ? (
        <Card padding="default" className="border-dashed">
          <p className="text-sm text-foreground">
            Could not load {isMainnet ? "mainnet" : "devnet"} balances.
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {isMainnet && !isCustomRpc("mainnet")
              ? "The public mainnet endpoint often blocks browser requests. Set VITE_SOLANA_MAINNET_RPC to a dedicated RPC URL and redeploy."
              : "The network endpoint did not respond. Try again in a moment."}
          </p>
          <Button
            className="mt-4"
            size="sm"
            variant="secondary"
            onClick={() => void query.refetch()}
          >
            Try again
          </Button>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          <AssetRow
            logo={<SolanaLogo size={32} />}
            name="Solana"
            subtitle="SOL"
            amountLabel={`${formatAmount(holdings?.sol ?? 0)} SOL`}
            valueLabel={
              isMainnet
                ? solPrice
                  ? `${formatUsd((holdings?.sol ?? 0) * solPrice)} · ${formatUsd(solPrice)} each`
                  : "Price unavailable"
                : "Test network, no market value"
            }
          />
          {visibleTokens.map(renderToken)}
          {hiddenCount > 0 ? (
            <Button variant="ghost" size="sm" onClick={() => setShowAll(true)}>
              Show {hiddenCount} more {hiddenCount === 1 ? "token" : "tokens"}
            </Button>
          ) : null}
          {(holdings?.tokens.length ?? 0) === 0 ? (
            <p className="px-1 text-xs leading-relaxed text-muted-foreground">
              No other tokens on this network yet.
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}
