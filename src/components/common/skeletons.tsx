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

export function SkeletonMediaCard() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
      <Skeleton className="size-12 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-3 w-3/5" />
        <Skeleton className="h-2.5 w-2/5" />
      </div>
      <div className="space-y-2 text-right">
        <Skeleton className="ml-auto h-3 w-16" />
        <Skeleton className="ml-auto h-2.5 w-10" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, index) => (
        <SkeletonMediaCard key={index} />
      ))}
    </div>
  );
}

export function PageLoading({ label = "Loading your workspace" }: { label?: string }) {
  return (
    <div
      className="flex min-h-[40vh] flex-col items-center justify-center gap-5 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="relative size-14">
        <div className="absolute inset-0 rounded-2xl border border-gold/30 bg-gold-muted/30" />
        <div className="absolute inset-2 animate-pulse rounded-xl border border-gold/60" />
        <div className="absolute inset-[18px] rounded-full bg-gold shadow-[0_0_24px_var(--gold)]" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="mt-1 text-xs text-muted-foreground">Preparing your private desk</p>
      </div>
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
