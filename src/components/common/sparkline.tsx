import * as React from "react";
import { cn } from "@/lib/utils";

/** Deterministic pseudo-random walk so a coin's shape stays stable per session. */
function seededSeries(seed: string, points: number, drift: number) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rand = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
  const out: number[] = [];
  let value = 100;
  for (let i = 0; i < points; i++) {
    value += (rand() - 0.5) * 3 + drift / points;
    out.push(value);
  }
  return out;
}

/** Hairline sparkline. No axes, no grid — a shape, not a chart. */
export function Sparkline({
  seed,
  change,
  points = 48,
  className,
  height = 48,
}: {
  seed: string;
  change: number;
  points?: number;
  className?: string | undefined;
  height?: number;
}) {
  const positive = change >= 0;
  const path = React.useMemo(() => {
    const series = seededSeries(seed, points, change);
    const min = Math.min(...series);
    const max = Math.max(...series);
    const span = max - min || 1;
    return series
      .map((v, i) => {
        const x = (i / (points - 1)) * 100;
        const y = 100 - ((v - min) / span) * 100;
        return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" ");
  }, [seed, points, change]);

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={cn("w-full", className)}
      style={{ height }}
    >
      <path
        d={path}
        fill="none"
        vectorEffect="non-scaling-stroke"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={positive ? "stroke-positive" : "stroke-negative"}
      />
    </svg>
  );
}
