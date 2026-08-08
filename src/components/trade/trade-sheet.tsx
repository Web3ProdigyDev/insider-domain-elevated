import * as React from "react";

import { Sheet } from "@/components/common/sheet-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyField } from "@/components/common/copy-field";
import { formatPrice } from "@/components/cards/coin-card";
import { notify } from "@/lib/notify";

export type TradeMode = "buy" | "sell" | "send" | "receive";

const COPY: Record<TradeMode, { title: string; cta: string; note: string }> = {
  buy: { title: "Buy", cta: "Confirm purchase", note: "Simulated fill at the live mid." },
  sell: { title: "Sell", cta: "Confirm sale", note: "Simulated fill at the live mid." },
  send: { title: "Send", cta: "Confirm transfer", note: "Simulated on-chain transfer." },
  receive: { title: "Receive", cta: "Done", note: "Share this address to receive funds." },
};

/**
 * One sheet for every order-side interaction, reused across Markets,
 * Portfolio and asset detail.
 */
export function TradeSheet({
  mode,
  open,
  onOpenChange,
  symbol,
  name,
  price,
  address,
  network,
}: {
  mode: TradeMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  symbol: string;
  name: string;
  price: number;
  address?: string | undefined;
  network?: string | undefined;
}) {
  const [amount, setAmount] = React.useState("");
  const [destination, setDestination] = React.useState("");
  const copy = COPY[mode];
  const numeric = Number(amount) || 0;

  React.useEffect(() => {
    if (!open) {
      setAmount("");
      setDestination("");
    }
  }, [open]);

  const submit = () => {
    if (mode !== "receive" && numeric <= 0) {
      notify.error("Enter an amount", "Simulated orders still need a size.");
      return;
    }
    if (mode === "send" && destination.trim().length < 8) {
      notify.error("Enter a destination", "Paste a valid address to continue.");
      return;
    }
    onOpenChange(false);
    if (mode === "receive") return;
    notify.success(
      `${copy.title} ${numeric.toLocaleString()} ${symbol}`,
      `${formatPrice(numeric * price)} · simulated, settling now.`,
    );
  };

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={`${copy.title} ${name}`}
      description={`${symbol} · ${formatPrice(price)}`}
      footer={
        <Button full onClick={submit}>
          {copy.cta}
        </Button>
      }
    >
      {mode === "receive" ? (
        <div className="space-y-4">
          {address ? <CopyField label={`${symbol} address`} value={address} /> : null}
          <p className="text-sm leading-relaxed text-muted-foreground">
            {network ? `${network} network only. ` : ""}
            {copy.note}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <label className="block">
            <span className="text-eyebrow mb-2 block">Amount ({symbol})</span>
            <Input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </label>

          {mode === "send" ? (
            <label className="block">
              <span className="text-eyebrow mb-2 block">Destination</span>
              <Input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Paste address"
              />
            </label>
          ) : null}

          <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4">
            <span className="text-sm text-muted-foreground">Estimated value</span>
            <span className="numeric text-sm text-foreground">{formatPrice(numeric * price)}</span>
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">{copy.note}</p>
        </div>
      )}
    </Sheet>
  );
}
