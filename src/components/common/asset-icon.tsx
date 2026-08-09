import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { findAsset } from "@/lib/assets";
import type { MarketCoin } from "@/lib/markets.functions";

/**
 * The single asset mark used everywhere in the product — portfolio, markets,
 * deposit, withdraw, transactions, notifications, search and admin.
 * Accepts a symbol or a CoinGecko id and resolves the artwork itself.
 */
export function AssetIcon({
  asset,
  src,
  size = 32,
  className,
}: {
  /** Symbol (BTC) or id (bitcoin). */
  asset: string;
  /** Optional pre-resolved artwork, e.g. from a market row. */
  src?: string | undefined;
  size?: number;
  className?: string | undefined;
}) {
  const client = useQueryClient();
  const [failed, setFailed] = React.useState(false);

  const definition = findAsset(asset);
  const symbol = (definition?.symbol ?? asset).toUpperCase();

  const resolved = React.useMemo(() => {
    if (src) return src;
    const coins = client.getQueryData<MarketCoin[]>(["market-coins"]);
    if (!coins) return undefined;
    const id = definition?.id ?? asset.toLowerCase();
    return (
      coins.find((c) => c.id === id)?.image ??
      coins.find((c) => c.symbol.toUpperCase() === symbol)?.image
    );
  }, [src, client, definition, asset, symbol]);

  const show = resolved && !failed;

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
          src={resolved}
          alt={`${symbol} logo`}
          loading="lazy"
          onError={() => setFailed(true)}
          className="size-full object-cover"
        />
      ) : (
        <span
          className="numeric text-muted-foreground"
          style={{ fontSize: Math.max(9, size * 0.3) }}
        >
          {symbol.slice(0, 3)}
        </span>
      )}
    </span>
  );
}
