import { createServerFn } from "@tanstack/react-start";

export type PriceSimulation = {
  id: string;
  coin_id: string;
  spike_percent: number | null;
  range_min: number | null;
  range_max: number | null;
  capture_fraction: number;
  active: boolean;
  // null = visible to every member; set = visible only to that one member.
  target_user_id: string | null;
};

export type MarketCoin = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  rank: number;
  simulated?: boolean;
};

type RawCoin = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number | null;
  price_change_percentage_24h: number | null;
  market_cap: number | null;
  total_volume: number | null;
  market_cap_rank: number | null;
};

let cache: { at: number; coins: MarketCoin[] } | null = null;
const TTL = 60_000;

async function page(): Promise<RawCoin[]> {
  const url =
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc` +
    `&per_page=250&page=1&price_change_percentage=24h`;
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`Market feed unavailable (${res.status})`);
  return (await res.json()) as RawCoin[];
}

export const getMarketCoins = createServerFn({ method: "GET" }).handler(async () => {
  if (cache && Date.now() - cache.at < TTL) return cache.coins;

  try {
    const first = await page();
    const coins: MarketCoin[] = first.map((c, i) => ({
      id: c.id,
      symbol: c.symbol.toUpperCase(),
      name: c.name,
      image: c.image,
      price: c.current_price ?? 0,
      change24h: c.price_change_percentage_24h ?? 0,
      marketCap: c.market_cap ?? 0,
      volume24h: c.total_volume ?? 0,
      rank: c.market_cap_rank ?? i + 1,
    }));
    cache = { at: Date.now(), coins };
    return coins;
  } catch (error) {
    if (cache) return cache.coins;
    throw error;
  }
});
