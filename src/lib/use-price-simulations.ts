import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "./supabase/client";
import type { PriceSimulation } from "./markets.functions";

const CADENCE = 30_000;

export function usePriceSimulations() {
  const query = useQuery({
    queryKey: ["price-simulations"],
    queryFn: async () => {
      const { data, error } = await createClient()
        .from("price_simulations")
        .select("id,coin_id,spike_percent,range_min,range_max,capture_fraction,active")
        .eq("active", true);
      if (error) throw error;
      return (data ?? []) as PriceSimulation[];
    },
    refetchInterval: CADENCE,
    staleTime: CADENCE,
    retry: 1,
  });
  return query;
}

function seededUnit(seed: string) {
  let value = 2166136261;
  for (const char of seed) value = Math.imul(value ^ char.charCodeAt(0), 16777619);
  value += Math.floor(Date.now() / CADENCE);
  value = Math.imul(value ^ (value >>> 16), 2246822507);
  return ((value ^ (value >>> 13)) >>> 0) / 4294967296;
}

export function applyPriceSimulations<T extends { id: string; price: number }>(
  coins: T[],
  simulations: PriceSimulation[],
) {
  const byCoin = new Map(simulations.map((simulation) => [simulation.coin_id, simulation]));
  return coins.map((coin) => {
    const simulation = byCoin.get(coin.id);
    if (!simulation) return coin;
    const base = coin.price * (1 + Number(simulation.spike_percent ?? 0) / 100);
    const configuredMin = Number(simulation.range_min);
    const configuredMax = Number(simulation.range_max);
    const min = configuredMin > 0 ? configuredMin : base * 0.9;
    const max = configuredMax > 0 ? configuredMax : base * 1.1;
    const random = seededUnit(`${simulation.id}:${coin.id}`);
    return {
      ...coin,
      price: Math.min(
        max,
        Math.max(
          min,
          base * (1 - simulation.capture_fraction + random * simulation.capture_fraction),
        ),
      ),
      simulated: true,
    };
  });
}
