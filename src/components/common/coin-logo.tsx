import * as React from "react";
import { cn } from "@/lib/utils";

/** Coin mark with a graceful fallback to the ticker when no logo resolves. */
export function CoinLogo({
  src,
  symbol,
  size = 32,
  className,
}: {
  src?: string | undefined;
  symbol: string;
  size?: number;
  className?: string | undefined;
}) {
  const [failed, setFailed] = React.useState(false);
  const show = src && !failed;

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-surface-raised",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {show ? (
        <img
          src={src}
          alt={`${symbol} logo`}
          loading="lazy"
          onError={() => setFailed(true)}
          className="size-full object-cover"
        />
      ) : (
        <span
          className="text-muted-foreground"
          style={{ fontSize: Math.max(9, size * 0.32) }}
        >
          {symbol.slice(0, 3)}
        </span>
      )}
    </span>
  );
}
