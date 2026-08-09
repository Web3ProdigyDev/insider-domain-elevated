/**
 * Single asset registry. Every screen resolves symbols through here, so new
 * assets can be added without touching any component.
 */

export type AssetDefinition = {
  /** CoinGecko id — also the routing id for the asset desk. */
  id: string;
  symbol: string;
  name: string;
  network: string;
};

export const assetRegistry: AssetDefinition[] = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", network: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", network: "Ethereum" },
  { id: "solana", symbol: "SOL", name: "Solana", network: "Solana" },
  { id: "usd-coin", symbol: "USDC", name: "USD Coin", network: "Ethereum" },
  { id: "tether", symbol: "USDT", name: "Tether", network: "Ethereum" },
  { id: "ripple", symbol: "XRP", name: "XRP", network: "XRP Ledger" },
  { id: "chainlink", symbol: "LINK", name: "Chainlink", network: "Ethereum" },
  { id: "cardano", symbol: "ADA", name: "Cardano", network: "Cardano" },
  { id: "avalanche-2", symbol: "AVAX", name: "Avalanche", network: "Avalanche" },
  { id: "polkadot", symbol: "DOT", name: "Polkadot", network: "Polkadot" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin", network: "Dogecoin" },
  { id: "litecoin", symbol: "LTC", name: "Litecoin", network: "Litecoin" },
  { id: "matic-network", symbol: "MATIC", name: "Polygon", network: "Polygon" },
  { id: "binancecoin", symbol: "BNB", name: "BNB", network: "BNB Chain" },
  { id: "tron", symbol: "TRX", name: "TRON", network: "TRON" },
];

const bySymbol = new Map(assetRegistry.map((a) => [a.symbol.toUpperCase(), a]));
const byId = new Map(assetRegistry.map((a) => [a.id, a]));

export function findAsset(identifier: string): AssetDefinition | undefined {
  return bySymbol.get(identifier.toUpperCase()) ?? byId.get(identifier.toLowerCase());
}

/** Resolves the routing id for an asset identifier (symbol or id). */
export function assetIdFor(identifier: string): string {
  return findAsset(identifier)?.id ?? identifier.toLowerCase();
}
