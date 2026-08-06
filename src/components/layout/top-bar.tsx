import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function TopBar({
  title,
  eyebrow,
  action,
  className,
}: {
  title: string;
  eyebrow?: string | undefined;
  action?: ReactNode | undefined;
  className?: string | undefined;
}) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border bg-background/80 px-5 py-4 backdrop-blur-xl sm:flex sm:justify-between lg:px-10 lg:py-6",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow ? <p className="text-eyebrow mb-1.5">{eyebrow}</p> : null}
        <h1 className="truncate text-xl font-medium tracking-[var(--tracking-tightest)] text-foreground lg:text-2xl">
          {title}
        </h1>
      </div>
      {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
    </header>
  );
}
