import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/common/section-header";
import { CoinLogo } from "@/components/common/coin-logo";
import { formatPrice } from "@/components/cards/coin-card";
import { notify } from "@/lib/notify";
import { usePortfolio } from "@/lib/use-markets";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/transfer")({
  head: () => ({
    meta: [
      { title: "Transfer — Insider Domain" },
      {
        name: "description",
        content: "Move value between your simulated positions or send it on-chain.",
      },
      { property: "og:title", content: "Transfer — Insider Domain" },
      {
        property: "og:description",
        content: "Move value between your simulated positions or send it on-chain.",
      },
    ],
  }),
  component: Transfer,
});

function Transfer() {
  const { positions } = usePortfolio();
  const [fromId, setFromId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [destination, setDestination] = useState("");
  const [reviewing, setReviewing] = useState(false);

  const from = positions.find((p) => p.id === fromId) ?? positions[0];
  const numeric = Number(amount) || 0;

  return (
    <AppShell eyebrow="Movement" title="Transfer">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" strokeWidth={1.75} /> Back to overview
      </Link>

      <SectionHeader title="From" />
      <div className="space-y-3">
        {positions.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setFromId(p.id)}
            className={cn(
              "flex w-full items-center gap-4 rounded-2xl border bg-card px-5 py-4 text-left transition-colors duration-300 ease-[var(--ease-luxe)]",
              from?.id === p.id
                ? "border-gold/40 bg-surface-raised"
                : "border-border hover:border-border-strong hover:bg-surface-raised",
            )}
          >
            <CoinLogo src={p.image} symbol={p.symbol} size={32} />
            <span className="min-w-0">
              <span className="block truncate text-sm text-foreground">{p.name}</span>
              <span className="numeric block truncate text-xs text-muted-foreground">
                {p.amount.toLocaleString()} {p.symbol}
              </span>
            </span>
            <span className="numeric ml-auto shrink-0 text-sm text-foreground">
              {formatPrice(p.value)}
            </span>
          </button>
        ))}
      </div>

      <section className="mt-10">
        <SectionHeader title="Details" />
        <Card padding="lg">
          <div className="space-y-5">
            <Input
              label={`Amount (${from?.symbol ?? "—"})`}
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
            <Input
              label="Destination address"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Paste address"
            />
            <div className="flex items-center justify-between rounded-2xl border border-border bg-surface px-5 py-4">
              <span className="text-sm text-muted-foreground">Estimated value</span>
              <span className="numeric text-sm text-foreground">
                {formatPrice(numeric * (from?.price ?? 0))}
              </span>
            </div>
            {reviewing && (
              <div className="rounded-2xl border border-gold/30 bg-gold-muted px-4 py-3 text-sm text-foreground">
                Review: send {numeric.toLocaleString()} {from?.symbol ?? "asset"} to {destination}.
              </div>
            )}
            <Button
              full
              onClick={() => {
                if (!from || numeric <= 0) {
                  notify.error("Enter an amount", "A transfer still needs a size.");
                  return;
                }
                if (destination.trim().length < 8) {
                  notify.error("Enter a destination", "Paste a valid address to continue.");
                  return;
                }
                if (!reviewing) {
                  setReviewing(true);
                  notify.message(
                    "Transfer ready for review",
                    "Check the destination before confirming.",
                  );
                  return;
                }
                notify.success(
                  `Transfer submitted`,
                  `${numeric.toLocaleString()} ${from.symbol} · simulated, settling now.`,
                );
                setAmount("");
                setDestination("");
                setReviewing(false);
              }}
            >
              Review and send
            </Button>
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
