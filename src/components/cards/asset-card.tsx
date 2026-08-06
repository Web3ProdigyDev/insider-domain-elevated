import { cn } from "@/lib/utils";
import { formatCurrency, formatSigned, type Asset } from "@/lib/placeholder-data";

export function AssetCard({
  asset,
  onSelect,
  className,
}: {
  asset: Asset;
  onSelect?: ((asset: Asset) => void) | undefined;
  className?: string | undefined;
}) {
  const positive = asset.change24h >= 0;

  return (
    <button
      type="button"
      onClick={() => onSelect?.(asset)}
      className={cn(
        "grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4 text-left transition-colors duration-300 ease-[var(--ease-luxe)] hover:border-border-strong hover:bg-surface-raised",
        className,
      )}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-full border border-border text-[0.6875rem] tracking-tight text-muted-foreground">
        {asset.symbol.slice(0, 3)}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm text-foreground">{asset.name}</span>
        <span className="numeric block truncate text-xs text-muted-foreground">
          {asset.holdings.toLocaleString()} {asset.symbol}
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span className="numeric block text-sm text-foreground">
          {formatCurrency(asset.value, 0)}
        </span>
        <span
          className={cn("numeric block text-xs", positive ? "text-positive" : "text-negative")}
        >
          {formatSigned(asset.change24h)}
        </span>
      </span>
    </button>
  );
}
