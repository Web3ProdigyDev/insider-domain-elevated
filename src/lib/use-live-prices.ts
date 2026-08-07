import * as React from "react";
import type { MarketCoin } from "./markets.functions";

// Between server refreshes, nudge prices by a tiny amount so the tape breathes
// the way a live market does. Purely presentational.
export function useLivePrices(coins: MarketCoin[] | undefined, intervalMs = 2500) {
  const [tick, setTick] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return React.useMemo(() => {
    if (!coins) return [];
    if (tick === 0) return coins;
    return coins.map((coin) => {
      const drift = (Math.random() - 0.5) * 0.0009;
      return {
        ...coin,
        price: coin.price * (1 + drift),
        change24h: coin.change24h + drift * 100,
      };
    });
  }, [coins, tick]);
}
