import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { formatSigned } from "@/lib/placeholder-data";
import { formatPrice } from "@/components/cards/coin-card";
import { CoinLogo } from "@/components/common/coin-logo";
import type { Position } from "@/lib/use-markets";

const usd = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

/** A live position row. Always links to the asset detail screen. */
export function AssetCard({
  position,
  className,
}: {
  position: Position;
  className?: string | undefined;
}) {
  const positive = position.change24h >= 0;

  return (
    <Link
      to="/asset/$id"
      params={{ id: position.id }}
      className={cn(
        "grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4 text-left transition-colors duration-300 ease-[var(--ease-luxe)] hover:border-border-strong hover:bg-surface-raised",
        className,
      )}
    >
      <CoinLogo src={position.image} symbol={position.symbol} size={36} />
      <span className="min-w-0">
        <span className="block truncate text-sm text-foreground">{position.name}</span>
        <span className="numeric block truncate text-xs text-muted-foreground">
          {position.price ? formatPrice(position.price) : "—"} ·{" "}
          {position.amount.toLocaleString()} {position.symbol}
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span className="numeric block text-sm text-foreground">{usd(position.value)}</span>
        <span
          className={cn("numeric block text-xs", positive ? "text-positive" : "text-negative")}
        >
          {formatSigned(position.change24h)}
        </span>
      </span>
    </Link>
  );
}
