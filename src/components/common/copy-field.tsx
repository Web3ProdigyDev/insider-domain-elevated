import * as React from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { notify } from "@/lib/notify";

/** Monospaced value with a copy affordance. Used for addresses and keys. */
export function CopyField({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string | undefined;
}) {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      /* clipboard unavailable — the value is still visible */
    }
    setCopied(true);
    notify.message(`${label} copied`);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "flex w-full items-center justify-between gap-4 rounded-2xl border border-border bg-card px-5 py-4 text-left transition-colors duration-300 ease-[var(--ease-luxe)] hover:border-border-strong hover:bg-surface-raised",
        className,
      )}
    >
      <span className="min-w-0">
        <span className="text-eyebrow block">{label}</span>
        <span className="numeric mt-1.5 block break-all text-xs text-foreground">{value}</span>
      </span>
      <span className="shrink-0 text-muted-foreground">
        {copied ? (
          <Check className="size-4 text-gold" strokeWidth={1.75} />
        ) : (
          <Copy className="size-4" strokeWidth={1.75} />
        )}
      </span>
    </button>
  );
}
