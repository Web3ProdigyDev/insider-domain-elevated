import * as React from "react";
import { useQuery } from "@tanstack/react-query";

import { holdingsQueryOptions, type SolanaHoldings } from "./solana-assets";
import { useSolanaNetwork } from "./solana-network";
import { useVaultAddress } from "./use-vault-address";
import { usePortfolio, type Position } from "./use-markets";

function realPositions(coins: ReturnType<typeof usePortfolio>["coins"], holdings?: SolanaHoldings) {
  if (!holdings) return [];
  const candidates = coins.flatMap((coin) => {
    const amount =
      coin.id === "solana"
        ? holdings.sol
        : holdings.tokens
            .filter((token) => token.known?.coingeckoId === coin.id)
            .reduce((sum, token) => sum + token.amount, 0);
    if (!(amount > 0)) return [];
    return [
      {
        ...coin,
        amount,
        value: amount * coin.price,
        address: "",
        network: "devnet",
        weight: 0,
      } satisfies Position,
    ];
  });
  return candidates;
}

export function useTransferAssets() {
  const portfolio = usePortfolio();
  const [network] = useSolanaNetwork();
  const { address } = useVaultAddress();
  const holdingsQuery = useQuery({
    ...holdingsQueryOptions(address ?? "", network),
    enabled: Boolean(address),
  });

  const positions = React.useMemo(() => {
    const simulatedIds = new Set(portfolio.positions.map((position) => position.id));
    const onChain = realPositions(portfolio.coins, holdingsQuery.data).filter(
      (position) => !simulatedIds.has(position.id),
    );
    return [...portfolio.positions, ...onChain].sort((a, b) => b.value - a.value);
  }, [holdingsQuery.data, portfolio.coins, portfolio.positions]);

  return {
    positions,
    isLoading: portfolio.isLoading || holdingsQuery.isLoading,
  };
}
