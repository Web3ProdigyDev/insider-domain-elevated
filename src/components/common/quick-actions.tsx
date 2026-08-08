import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type QuickAction = {
  label: string;
  icon: LucideIcon;
  to?: string;
  params?: Record<string, string>;
  onClick?: () => void;
  accent?: boolean;
};

/** Reusable row of square actions. Every tile goes somewhere or does something. */
export function QuickActions({
  actions,
  className,
}: {
  actions: QuickAction[];
  className?: string | undefined;
}) {
  return (
    <div
      className={cn(
        "grid gap-3",
        actions.length >= 4 ? "grid-cols-4" : `grid-cols-${actions.length}`,
        className,
      )}
    >
      {actions.map((action) => {
        const inner = (
          <>
            <span
              className={cn(
                "grid size-10 place-items-center rounded-full border transition-colors duration-300 ease-[var(--ease-luxe)]",
                action.accent
                  ? "border-gold/30 bg-gold-muted text-gold"
                  : "border-border bg-surface-raised text-foreground",
              )}
            >
              <action.icon className="size-4" strokeWidth={1.75} />
            </span>
            <span className="text-[0.6875rem] tracking-tight text-muted-foreground">
              {action.label}
            </span>
          </>
        );

        const cls =
          "flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-2 py-4 transition-colors duration-300 ease-[var(--ease-luxe)] hover:border-border-strong hover:bg-surface-raised";

        if (action.to) {
          return (
            <Link
              key={action.label}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              to={action.to as any}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              params={action.params as any}
              className={cls}
            >
              {inner}
            </Link>
          );
        }

        return (
          <button key={action.label} type="button" onClick={action.onClick} className={cls}>
            {inner}
          </button>
        );
      })}
    </div>
  );
}
