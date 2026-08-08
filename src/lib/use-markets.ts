import * as React from "react";
import { useQuery } from "@tanstack/react-query";

import { getMarketCoins, type MarketCoin } from "./markets.functions";
import { useLivePrices } from "./use-live-prices";
import { holdings } from "./holdings";

/** Shared live-market access. One query, one cache, used by every screen. */
export function useMarkets() {
  const query = useQuery({
    queryKey: ["market-coins"],
    queryFn: () => getMarketCoins(),
    refetchInterval: 15_000,
    staleTime: 10_000,
    retry: 2,
  });

  const coins = useLivePrices(query.data);

  const byId = React.useMemo(() => {
    const map = new Map<string, MarketCoin>();
    for (const coin of coins) map.set(coin.id, coin);
    return map;
  }, [coins]);

  return {
    coins,
    byId,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export type Position = {
  id: string;
  symbol: string;
  name: string;
  image: string | undefined;
  amount: number;
  price: number;
  change24h: number;
  value: number;
  address: string;
  network: string;
  /** Share of total portfolio value, 0–1 */
  weight: number;
};

/** Live positions derived from simulated holdings × real prices. */
export function usePortfolio() {
  const { byId, isLoading, isError } = useMarkets();

  return React.useMemo(() => {
    const rows = holdings.map((h) => {
      const coin = byId.get(h.id);
      const price = coin?.price ?? 0;
      return {
        id: h.id,
        symbol: h.symbol,
        name: h.name,
        image: coin?.image,
        amount: h.amount,
        price,
        change24h: coin?.change24h ?? 0,
        value: price * h.amount,
        address: h.address,
        network: h.network,
        weight: 0,
      } satisfies Position;
    });

    const balance = rows.reduce((sum, r) => sum + r.value, 0);
    const positions = rows
      .map((r) => ({ ...r, weight: balance ? r.value / balance : 0 }))
      .sort((a, b) => b.value - a.value);

    // 24h change of the book, value-weighted.
    const change24h = positions.reduce((sum, p) => sum + p.change24h * p.weight, 0);
    const changeValue = balance - balance / (1 + change24h / 100);

    return { positions, balance, change24h, changeValue, isLoading, isError };
  }, [byId, isLoading, isError]);
}
