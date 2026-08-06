import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string | undefined }) {
  return (
    <div
      className={cn(
        "animate-[var(--animate-shimmer)] rounded-lg bg-[linear-gradient(90deg,var(--surface)_0%,var(--surface-raised)_50%,var(--surface)_100%)] bg-[length:200%_100%]",
        className,
      )}
    />
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn("h-3", i === lines - 1 ? "w-2/5" : "w-full")} />
      ))}
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2.5">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-3 w-16 shrink-0" />
    </div>
  );
}

export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <Skeleton className="h-2.5 w-24" />
      <Skeleton className="mt-5 h-8 w-48" />
      <Skeleton className="mt-4 h-3 w-32" />
    </div>
  );
}
