import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDownToLine, ArrowUpFromLine, WalletCards } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CoinLogo } from "@/components/common/coin-logo";
import { useMarkets, usePortfolio } from "@/lib/use-markets";
import { getWalletData } from "@/lib/wallet.functions";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/wallet")({ component: Wallet });
function Wallet() {
  const walletQuery = useQuery({
    queryKey: ["wallet-data"],
    queryFn: () => getWalletData(),
    retry: false,
  });
  const wallet = walletQuery.data;
  const balances = Object.fromEntries(
    (wallet?.balances ?? []).map((row) => [row.assetId, Number(row.amount)]),
  );
  const transactions = (wallet?.activity ?? []).map((row) => ({
    id: row.id,
    note: `${row.type} ${row.assetId}`,
    symbol: row.assetId,
    status: row.status,
    amount: Number(row.amount),
  }));
  const { coins } = useMarkets();
  const { positions, balance, change24h } = usePortfolio();
  return (
    <AppShell eyebrow="Account custody" title="Wallet">
      <div className="flex flex-col gap-6">
        <Card variant="raised" padding="lg">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-gold-muted text-gold">
              <WalletCards className="size-5" />
            </span>
            <div>
              <p className="text-sm text-foreground">Primary wallet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {walletQuery.isLoading
                  ? "Loading account data"
                  : walletQuery.isError
                    ? "Wallet data unavailable"
                    : wallet?.balances?.length
                      ? "Balances synced from your account"
                      : "No wallet activity yet"}
              </p>
            </div>
            <Badge className="ml-auto" variant="secondary">
              {walletQuery.isError ? "Unavailable" : "Live"}
            </Badge>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Button asChild>
              <Link to="/deposit">
                <ArrowDownToLine /> Deposit
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/withdraw">
                <ArrowUpFromLine /> Withdraw
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/markets">Browse markets</Link>
            </Button>
          </div>
        </Card>
        <section className="grid gap-3 sm:grid-cols-3" aria-label="Portfolio summary">
          <Card padding="md">
            <p className="text-eyebrow">Portfolio value</p>
            <p className="numeric mt-2 text-2xl text-foreground">
              ${balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </Card>
          <Card padding="md">
            <p className="text-eyebrow">24h movement</p>
            <p className="numeric mt-2 text-2xl text-foreground">
              {change24h >= 0 ? "+" : ""}
              {change24h.toFixed(2)}%
            </p>
          </Card>
          <Card padding="md">
            <p className="text-eyebrow">Assets held</p>
            <p className="numeric mt-2 text-2xl text-foreground">
              {positions.filter((position) => position.amount > 0).length}
            </p>
          </Card>
        </section>
        <section>
          <p className="text-eyebrow">Balances</p>
          <div className="mt-3 flex max-h-[52vh] flex-col gap-2 overflow-y-auto overscroll-contain pr-1">
            {Object.entries(balances)
              .slice(0, 8)
              .map(([id, amount]) => {
                const coin = coins.find((item) => item.id === id);
                return (
                  <Link
                    key={id}
                    to="/asset/$id"
                    params={{ id }}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 transition-colors hover:border-border-strong hover:bg-surface-raised"
                  >
                    <CoinLogo src={coin?.image} symbol={coin?.symbol ?? id.slice(0, 3)} size={32} />
                    <span className="text-sm text-foreground">{coin?.name ?? id}</span>
                    <span className="ml-auto text-right">
                      <span className="numeric block text-sm text-foreground">
                        {amount.toFixed(4)} {coin?.symbol ?? ""}
                      </span>
                      <span className="numeric block text-xs text-muted-foreground">
                        {coin?.price ? `$${coin.price.toLocaleString()}` : "Price unavailable"} ·{" "}
                        {coin?.price
                          ? `$${(amount * coin.price).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                          : "—"}
                      </span>
                    </span>
                  </Link>
                );
              })}
          </div>
        </section>
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-eyebrow">Recent activity</p>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/markets">View markets</Link>
            </Button>
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {transactions.slice(0, 5).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3"
              >
                <div>
                  <p className="text-sm text-foreground">{tx.note}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {tx.symbol} · {tx.status}
                  </p>
                </div>
                <span className="numeric text-sm text-foreground">{tx.amount}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
