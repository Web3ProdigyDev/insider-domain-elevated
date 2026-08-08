import { cn } from "@/lib/utils";
import type { Position } from "@/lib/use-markets";

const TONES = [
  "bg-gold",
  "bg-foreground/70",
  "bg-muted-foreground",
  "bg-positive/70",
  "bg-border-strong",
  "bg-foreground/30",
];

/** Weighted allocation bar with a typeset legend. */
export function AllocationBar({
  positions,
  className,
}: {
  positions: Position[];
  className?: string | undefined;
}) {
  const visible = positions.filter((p) => p.weight > 0.001);

  if (!visible.length) {
    return <div className="h-2 w-full animate-pulse rounded-full bg-surface-raised" />;
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-surface-raised">
        {visible.map((p, i) => (
          <span
            key={p.id}
            className={TONES[i % TONES.length]}
            style={{ width: `${p.weight * 100}%` }}
            title={`${p.symbol} ${(p.weight * 100).toFixed(1)}%`}
          />
        ))}
      </div>
      <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
        {visible.map((p, i) => (
          <li key={p.id} className="flex items-center gap-2.5">
            <span className={cn("size-1.5 shrink-0 rounded-full", TONES[i % TONES.length])} />
            <span className="min-w-0 truncate text-xs text-muted-foreground">{p.symbol}</span>
            <span className="numeric ml-auto text-xs text-foreground">
              {(p.weight * 100).toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
