import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatSigned } from "@/lib/placeholder-data";

export function PortfolioCard({
  label = "Total balance",
  balance,
  change24h,
  changeValue,
  meta,
  action,
  className,
}: {
  label?: string | undefined;
  balance: number;
  change24h: number;
  changeValue: number;
  meta?: string | undefined;
  action?: ReactNode | undefined;
  className?: string | undefined;
}) {
  const positive = change24h >= 0;

  return (
    <Card variant="raised" padding="lg" className={cn("animate-[var(--animate-rise)]", className)}>
      <p className="text-eyebrow">{label}</p>
      <p className="numeric mt-4 text-[2.25rem] leading-none tracking-[var(--tracking-tightest)] text-foreground sm:text-[2.75rem]">
        {formatCurrency(balance)}
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span
          className={cn(
            "numeric text-sm",
            positive ? "text-positive" : "text-negative",
          )}
        >
          {formatSigned(change24h)}
        </span>
        <span className="numeric text-sm text-muted-foreground">
          {positive ? "+" : "−"}
          {formatCurrency(Math.abs(changeValue))}
        </span>
        {meta ? <span className="text-sm text-muted-foreground">{meta}</span> : null}
      </div>
      {action ? <div className="mt-7 flex flex-wrap gap-3">{action}</div> : null}
    </Card>
  );
}
