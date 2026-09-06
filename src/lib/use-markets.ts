import * as React from "react";
import { useQuery } from "@tanstack/react-query";

import { getMarketCoins, type MarketCoin } from "./markets.functions";
import { getWalletData } from "./wallet.functions";
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
  const { coins, byId, isLoading: marketsLoading, isError: marketsError } = useMarkets();
  const walletQuery = useQuery({
    queryKey: ["wallet-data"],
    queryFn: () => getWalletData(),
    retry: false,
  });

  return React.useMemo(() => {
    const positions = (walletQuery.data?.balances ?? [])
      .map((row) => {
        const coin = byId.get(row.assetId);
        const amount = Number(row.amount);
        const price = coin?.price ?? 0;
        return {
          id: row.assetId,
          symbol: coin?.symbol ?? row.assetId,
          name: coin?.name ?? row.assetId,
          image: coin?.image,
          amount,
          price,
          change24h: coin?.change24h ?? 0,
          value: amount * price,
          address: "",
          network: "",
          weight: 0,
        } satisfies Position;
      })
      .filter((position) => position.amount > 0)
      .sort((a, b) => b.value - a.value);
    const balance = positions.reduce((sum, position) => sum + position.value, 0);
    const weighted = positions.map((position) => ({
      ...position,
      weight: balance ? position.value / balance : 0,
    }));
    const change24h = weighted.reduce(
      (sum, position) => sum + position.change24h * position.weight,
      0,
    );
    const changeValue = balance - balance / (1 + change24h / 100);
    return {
      positions: weighted,
      balance,
      change24h,
      changeValue,
      isLoading: marketsLoading || walletQuery.isLoading,
      isError: marketsError || walletQuery.isError,
      coins,
    };
  }, [
    byId,
    coins,
    marketsError,
    marketsLoading,
    walletQuery.data,
    walletQuery.isError,
    walletQuery.isLoading,
  ]);
}
