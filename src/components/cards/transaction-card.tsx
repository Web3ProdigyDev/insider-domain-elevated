import { ArrowDownLeft, ArrowUpRight, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, type Transaction } from "@/lib/placeholder-data";

const icons = {
  buy: ArrowDownLeft,
  sell: ArrowUpRight,
  deposit: Plus,
  withdrawal: Minus,
} as const;

const labels = {
  buy: "Bought",
  sell: "Sold",
  deposit: "Deposit",
  withdrawal: "Withdrawal",
} as const;

export function TransactionCard({
  transaction,
  className,
}: {
  transaction: Transaction;
  className?: string | undefined;
}) {
  const Icon = icons[transaction.type];
  const outgoing = transaction.type === "sell" || transaction.type === "withdrawal";

  return (
    <div
      className={cn(
        "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4",
        className,
      )}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-full border border-border text-muted-foreground">
        <Icon className="size-4" strokeWidth={1.75} />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm text-foreground">
          {labels[transaction.type]} {transaction.asset}
        </span>
        <span className="block truncate text-xs text-muted-foreground">{transaction.date}</span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1.5">
        <span className="numeric text-sm text-foreground">
          {outgoing ? "−" : "+"}
          {formatCurrency(transaction.value, 0)}
        </span>
        {transaction.status !== "settled" ? (
          <Badge variant={transaction.status === "failed" ? "negative" : "default"}>
            {transaction.status}
          </Badge>
        ) : null}
      </span>
    </div>
  );
}
