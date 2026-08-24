import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Bitcoin, ChevronRight } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/common/section-header";
import { SearchBar } from "@/components/common/search-bar";
import { CoinLogo } from "@/components/common/coin-logo";
import { EmptyState } from "@/components/common/empty-state";
import { useMarkets } from "@/lib/use-markets";
import { fundingEligibility } from "@/lib/age";
import { useAuth } from "@/lib/use-auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/deposit")({
  head: () => ({
    meta: [
      { title: "Deposit — Insider Domain" },
      {
        name: "description",
        content: "Deposit into your Insider Domain account using a verified crypto network.",
      },
      { property: "og:title", content: "Deposit — Insider Domain" },
      {
        property: "og:description",
        content: "Deposit into your Insider Domain account using a verified crypto network.",
      },
    ],
  }),
  component: Deposit,
});

function Deposit() {
  const { user } = useAuth();
  const { coins } = useMarkets();
  const eligibility = fundingEligibility(user?.dob ?? "1990-01-01");
  const [method, setMethod] = React.useState<"crypto">("crypto");
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState("bitcoin");

  const options = React.useMemo(() => {
    const base = coins.length ? coins : [];
    const q = query.trim().toLowerCase();
    const list = q
      ? base.filter((c) => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q))
      : base;
    return list.slice(0, 40);
  }, [coins, query]);

  const coin = coins.find((c) => c.id === selected);
  const network = coin?.name ?? "Native network";

  const methods = [
    {
      id: "crypto" as const,
      label: "Crypto deposit",
      note: "Network confirmation · no fee",
      icon: Bitcoin,
    },
  ].filter((m) => eligibility.methods.includes(m.id));

  return (
    <AppShell eyebrow="Funding" title="Deposit">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" strokeWidth={1.75} /> Back to overview
      </Link>

      <SectionHeader title="Method" />
      <div className="space-y-3">
        {methods.map((m) => (
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
            <ChevronRight
              className="ml-auto size-4 shrink-0 text-muted-foreground"
              strokeWidth={1.75}
            />
          </button>
        ))}
      </div>

      {method === "crypto" && (
        <section className="mt-10">
          <SectionHeader title="Asset" />
          <SearchBar
            value={query}
            onValueChange={setQuery}
            placeholder="Search asset or ticker"
            className="mb-4"
          />
          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {options.length ? (
              options.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelected(c.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors duration-300 ease-[var(--ease-luxe)]",
                    selected === c.id
                      ? "border-gold/40 bg-surface-raised"
                      : "border-border bg-card hover:border-border-strong",
                  )}
                >
                  <CoinLogo src={c.image} symbol={c.symbol} size={28} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-foreground">{c.name}</span>
                    <span className="block text-xs text-muted-foreground">{c.symbol}</span>
                  </span>
                </button>
              ))
            ) : (
              <EmptyState title="No match" description="Try a different name or ticker." />
            )}
          </div>

          <Card padding="lg" className="mt-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <CoinLogo src={coin?.image} symbol={coin?.symbol ?? "—"} size={36} />
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground">
                    {coin?.name ?? "Select an asset"}
                  </p>
                  <p className="text-xs text-muted-foreground">{network}</p>
                </div>
              </div>
              <Badge variant="secondary">Not configured</Badge>
            </div>
            <div className="mt-6 rounded-xl border border-border bg-surface-raised/50 p-4">
              <p className="text-sm text-foreground">Deposit address unavailable</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                A verified address for {coin?.symbol ?? "this asset"} on {network} has not been
                configured for this account.
              </p>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Never send funds until the asset, network, and destination address are verified.
            </p>
          </Card>
        </section>
      )}
    </AppShell>
  );
}
