import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionHeader({
  title,
  action,
  className,
}: {
  title: string;
  action?: ReactNode | undefined;
  className?: string | undefined;
}) {
  return (
    <div
      className={cn(
        "mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between",
        className,
      )}
    >
      <h2 className="text-eyebrow truncate">{title}</h2>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
