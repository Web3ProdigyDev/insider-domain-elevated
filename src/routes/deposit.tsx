import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Landmark, Bitcoin, CreditCard } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/common/section-header";
import { CopyField } from "@/components/common/copy-field";
import { notify } from "@/lib/notify";
import { holdings } from "@/lib/holdings";
import { cn } from "@/lib/utils";

const METHODS = [
  { id: "wire", label: "Wire transfer", note: "1–2 business days · no fee", icon: Landmark },
  { id: "crypto", label: "Crypto deposit", note: "Network confirmation · no fee", icon: Bitcoin },
  { id: "card", label: "Card", note: "Instant · 1.4%", icon: CreditCard },
] as const;

export const Route = createFileRoute("/deposit")({
  head: () => ({
    meta: [
      { title: "Add funds — Insider Domain" },
      { name: "description", content: "Fund your simulated account by wire, crypto or card." },
      { property: "og:title", content: "Add funds — Insider Domain" },
      {
        property: "og:description",
        content: "Fund your simulated account by wire, crypto or card.",
      },
    ],
  }),
  component: Deposit,
});

function Deposit() {
  const [method, setMethod] = useState<(typeof METHODS)[number]["id"]>("wire");
  const [amount, setAmount] = useState("");
  const usdc = holdings.find((h) => h.symbol === "USDC");

  return (
    <AppShell eyebrow="Funding" title="Add funds">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" strokeWidth={1.75} /> Back to overview
      </Link>

      <SectionHeader title="Method" />
      <div className="space-y-3">
        {METHODS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMethod(m.id)}
            className={cn(
              "flex w-full items-center gap-4 rounded-2xl border bg-card px-5 py-4 text-left transition-colors duration-300 ease-[var(--ease-luxe)]",
              method === m.id
                ? "border-gold/40 bg-surface-raised"
                : "border-border hover:border-border-strong hover:bg-surface-raised",
            )}
          >
            <span
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-full border",
                method === m.id
                  ? "border-gold/30 bg-gold-muted text-gold"
                  : "border-border text-muted-foreground",
              )}
            >
              <m.icon className="size-4" strokeWidth={1.75} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm text-foreground">{m.label}</span>
              <span className="block truncate text-xs text-muted-foreground">{m.note}</span>
            </span>
            {method === m.id ? (
              <Badge variant="gold" className="ml-auto">
                Selected
              </Badge>
            ) : null}
          </button>
        ))}
      </div>

      <section className="mt-10">
        <SectionHeader title="Amount" />
        <Card padding="lg">
          {method === "crypto" && usdc ? (
            <div className="space-y-4">
              <CopyField label="USDC address (Ethereum)" value={usdc.address} />
              <p className="text-sm leading-relaxed text-muted-foreground">
                Send only USDC on Ethereum. Funds credit after twelve confirmations.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <Input
                label="Amount (USD)"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
              <div className="flex flex-wrap gap-2">
                {[5000, 25000, 100000].map((preset) => (
                  <Button
                    key={preset}
                    variant="secondary"
                    size="sm"
                    onClick={() => setAmount(String(preset))}
                  >
                    ${preset.toLocaleString()}
                  </Button>
                ))}
              </div>
              <Button
                full
                onClick={() => {
                  const value = Number(amount) || 0;
                  if (value <= 0) {
                    notify.error("Enter an amount", "Funding still needs a figure.");
                    return;
                  }
                  notify.success(
                    `Funding initiated`,
                    `$${value.toLocaleString()} via ${METHODS.find((m) => m.id === method)?.label}. Simulated.`,
                  );
                  setAmount("");
                }}
              >
                Continue
              </Button>
            </div>
          )}
        </Card>
      </section>
    </AppShell>
  );
}
