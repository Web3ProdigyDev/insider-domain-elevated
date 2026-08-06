import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode | undefined;
  title: string;
  description?: string | undefined;
  action?: ReactNode | undefined;
  className?: string | undefined;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-6 py-16 text-center",
        className,
      )}
    >
      {icon ? (
        <span className="mb-5 grid size-11 place-items-center rounded-full border border-border text-muted-foreground [&_svg]:size-4">
          {icon}
        </span>
      ) : null}
      <p className="text-sm font-medium tracking-tight text-foreground">{title}</p>
      {description ? (
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
