import { cn } from "@/lib/utils";
import { CoinLogo } from "@/components/common/coin-logo";
import { formatSigned } from "@/lib/format";
import { formatPrice } from "@/components/cards/coin-card";

export type TradeLogEntry = {
  id: string;
  side: "long" | "short";
  symbol: string;
  name: string;
  image?: string | undefined;
  entry: number;
  pnl: number;
  time: string;
  status: "open" | "closed";
};

/** One simulated execution from the Sniper desk. */
export function TradeLogCard({
  entry,
  className,
}: {
  entry: TradeLogEntry;
  className?: string | undefined;
}) {
  const positive = entry.pnl >= 0;

  return (
    <div
      className={cn(
        "grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4",
        className,
      )}
    >
      <CoinLogo src={entry.image} symbol={entry.symbol} size={32} />
      <div className="min-w-0">
        <p className="truncate text-sm text-foreground">
          {entry.side === "long" ? "Long" : "Short"} {entry.symbol}
          <span className="ml-2 text-xs text-muted-foreground">
            {entry.status === "open" ? "open" : "closed"}
          </span>
        </p>
        <p className="numeric mt-1 truncate text-xs text-muted-foreground">
          {formatPrice(entry.entry)} · {entry.time}
        </p>
      </div>
      <p className={cn("numeric shrink-0 text-sm", positive ? "text-positive" : "text-negative")}>
        {formatSigned(entry.pnl)}
      </p>
    </div>
  );
}
