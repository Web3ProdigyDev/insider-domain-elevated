import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDownToLine, ArrowLeft, ArrowUpFromLine, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/common/empty-state";
import { SkeletonCard } from "@/components/common/skeletons";
import { Sparkline } from "@/components/common/sparkline";
import { CoinLogo } from "@/components/common/coin-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, formatCompact } from "@/components/cards/coin-card";
import { formatSigned } from "@/lib/format";
import { useMarkets } from "@/lib/use-markets";
import { useRequireMember } from "@/lib/use-auth";
import { useVaultAddress } from "@/lib/use-vault-address";
import { useSolanaNetwork } from "@/lib/solana-network";
import { formatTokenAmount, holdingFor, holdingsQueryOptions } from "@/lib/solana-assets";

export const Route = createFileRoute("/asset/$id")({
  head: () => ({ meta: [{ title: "Asset — Insider Domain" }] }),
  component: AssetDetail,
});

function AssetDetail() {
  const { id } = Route.useParams();
  const { ready, allowed } = useRequireMember();
  const { byId, isLoading, isError } = useMarkets();
  const { address: vaultAddress, checked: vaultChecked } = useVaultAddress();
  const [network] = useSolanaNetwork();
  const holdingsQuery = useQuery({
    ...holdingsQueryOptions(vaultAddress ?? "", network),
    enabled: Boolean(vaultAddress),
  });

  if (!ready || !allowed) return null;

  if (isLoading) {
    return (
      <AppShell eyebrow="Markets" title="Asset">
        <SkeletonCard />
      </AppShell>
    );
  }

  const coin = byId.get(id);

  if (isError || !coin) {
    return (
      <AppShell eyebrow="Markets" title="Asset unavailable">
        <EmptyState
          icon={<TrendingUp />}
          title="Asset unavailable"
          description="This asset couldn't be found or the market feed is temporarily unavailable."
          action={
            <Button variant="secondary" asChild>
              <Link to="/markets">Back to markets</Link>
            </Button>
          }
        />
      </AppShell>
    );
  }

  const positive = coin.change24h >= 0;
  const isMainnet = network === "mainnet";
  const held = holdingsQuery.data ? holdingFor(holdingsQuery.data, coin.id) : 0;

  return (
    <AppShell
      eyebrow="Markets"
      title={coin.name}
      action={
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/wallet">
              <ArrowLeft /> Wallet
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/markets">Markets</Link>
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <CoinLogo src={coin.image} symbol={coin.symbol} size={48} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-lg text-foreground">{coin.name}</p>
              <Badge variant="outline">{coin.symbol}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Rank #{coin.rank}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="numeric text-3xl text-foreground">{formatPrice(coin.price)}</p>
          <p className={"numeric mt-1 text-sm " + (positive ? "text-positive" : "text-negative")}>
            {formatSigned(coin.change24h)} · 24h
          </p>
          <Sparkline seed={coin.id} change={coin.change24h} height={64} className="mt-5" />
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-eyebrow">Your holding</p>
            <Badge variant={isMainnet ? "gold" : "default"}>
              {isMainnet ? "Mainnet" : "Devnet"}
            </Badge>
          </div>
          {!vaultChecked ? (
            <p className="mt-3 text-xs text-muted-foreground">Checking wallet…</p>
          ) : !vaultAddress ? (
            <div className="mt-3">
              <p className="text-xs leading-relaxed text-muted-foreground">
                Set up a wallet to see your balance here.
              </p>
              <Button className="mt-3" size="sm" asChild>
                <Link to="/wallet-setup">Set up wallet</Link>
              </Button>
            </div>
          ) : holdingsQuery.isLoading ? (
            <p className="mt-3 text-xs text-muted-foreground">Loading balance…</p>
          ) : holdingsQuery.isError ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Balance unavailable on {isMainnet ? "mainnet" : "devnet"} right now.
            </p>
          ) : (
            <>
              <p className="numeric mt-3 text-2xl text-foreground">
                {formatTokenAmount(held)} {coin.symbol}
              </p>
              <p className="numeric mt-1 text-xs text-muted-foreground">
                {isMainnet ? formatPrice(held * coin.price) : "Test network, no market value"}
              </p>
            </>
          )}
        </div>

        <section className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-eyebrow">Market cap</p>
            <p className="numeric mt-3 text-sm text-foreground">{formatCompact(coin.marketCap)}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-eyebrow">24h volume</p>
            <p className="numeric mt-3 text-sm text-foreground">{formatCompact(coin.volume24h)}</p>
          </div>
        </section>

        {coin.symbol.toUpperCase() === "SOL" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Button asChild size="lg">
              <Link to="/deposit" search={{ asset: coin.id }}>
                <ArrowDownToLine /> Deposit {coin.symbol}
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/withdraw" search={{ asset: coin.id }}>
                <ArrowUpFromLine /> Withdraw {coin.symbol}
              </Link>
            </Button>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}