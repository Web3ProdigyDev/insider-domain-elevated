import { cn } from "@/lib/utils";
import { formatSigned } from "@/lib/placeholder-data";
import type { MarketCoin } from "@/lib/markets.functions";

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value < 1 ? 4 : 2,
    maximumFractionDigits: value < 1 ? 6 : 2,
  }).format(value);

export const formatCompact = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

export function CoinCard({
  coin,
  onSelect,
  className,
}: {
  coin: MarketCoin;
  onSelect?: ((coin: MarketCoin) => void) | undefined;
  className?: string | undefined;
}) {
  const positive = coin.change24h >= 0;

  return (
    <button
      type="button"
      onClick={() => onSelect?.(coin)}
      className={cn(
        "grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4 text-left transition-colors duration-300 ease-[var(--ease-luxe)] hover:border-border-strong hover:bg-surface-raised",
        className,
      )}
    >
      <span className="flex shrink-0 items-center gap-3">
        <span className="numeric w-6 text-right text-[0.6875rem] text-muted-foreground/70">
          {coin.rank}
        </span>
        <img
          src={coin.image}
          alt=""
          loading="lazy"
          className="size-8 rounded-full border border-border object-cover"
        />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm text-foreground">{coin.name}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {coin.symbol} · {formatCompact(coin.marketCap)}
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span className="numeric block text-sm tabular-nums text-foreground">
          {formatPrice(coin.price)}
        </span>
        <span
          className={cn("numeric block text-xs", positive ? "text-positive" : "text-negative")}
        >
          {formatSigned(coin.change24h)}
        </span>
      </span>
    </button>
  );
}
