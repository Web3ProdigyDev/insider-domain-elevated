import * as React from "react";
import { useQuery } from "@tanstack/react-query";

import { getMarketCoins, type MarketCoin } from "./markets.functions";
import { useLivePrices } from "./use-live-prices";

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

/** Live market portfolio view; user balances are loaded by wallet queries. */
export function usePortfolio() {
  const { isLoading, isError } = useMarkets();

  return React.useMemo(
    () => ({
      positions: [] as Position[],
      balance: 0,
      change24h: 0,
      changeValue: 0,
      isLoading,
      isError,
    }),
    [isLoading, isError],
  );
}
