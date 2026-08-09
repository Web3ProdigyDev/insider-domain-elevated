import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Bitcoin, Gift, ChevronRight } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SectionHeader } from "@/components/common/section-header";
import { SearchBar } from "@/components/common/search-bar";
import { CopyField } from "@/components/common/copy-field";
import { CoinLogo } from "@/components/common/coin-logo";
import { EmptyState } from "@/components/common/empty-state";
import { notify } from "@/lib/notify";
import { holdings } from "@/lib/holdings";
import { useMarkets } from "@/lib/use-markets";
import { fundingEligibility } from "@/lib/age";
import { useAuth } from "@/lib/use-auth";
import { cn } from "@/lib/utils";

const GIFT_CARDS = [
  { id: "apple", label: "Apple Gift Card", note: "Redeemed as simulated balance" },
  { id: "amazon", label: "Amazon Gift Card", note: "Redeemed as simulated balance" },
  { id: "steam", label: "Steam Wallet Code", note: "Redeemed as simulated balance" },
];

export const Route = createFileRoute("/deposit")({
  head: () => ({
    meta: [
      { title: "Deposit — Insider Domain" },
      {
        name: "description",
        content: "Deposit into your Insider Domain environment by crypto or redemption code.",
      },
      { property: "og:title", content: "Deposit — Insider Domain" },
      {
        property: "og:description",
        content: "Deposit into your Insider Domain environment by crypto or redemption code.",
      },
    ],
  }),
  component: Deposit,
});

function Deposit() {
  const { user } = useAuth();
  const { coins } = useMarkets();
  const eligibility = fundingEligibility(user?.dob ?? "1990-01-01");
  const [method, setMethod] = React.useState<"crypto" | "gift-card">("crypto");
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState("bitcoin");
  const [card, setCard] = React.useState(GIFT_CARDS[0]!.id);
  const [code, setCode] = React.useState("");

  const options = React.useMemo(() => {
    const base = coins.length ? coins : [];
    const q = query.trim().toLowerCase();
    const list = q
      ? base.filter((c) => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q))
      : base;
    return list.slice(0, 40);
  }, [coins, query]);

  const coin = coins.find((c) => c.id === selected);
  const held = holdings.find((h) => h.id === selected);
  const address =
    held?.address ?? `id1${selected.replace(/[^a-z0-9]/g, "").slice(0, 10)}9x4vqk2mzt7pd3`;
  const network = held?.network ?? coin?.name ?? "Native network";

  const methods = [
    { id: "crypto" as const, label: "Crypto deposit", note: "Network confirmation · no fee", icon: Bitcoin },
    { id: "gift-card" as const, label: "Redemption code", note: "Gift card · instant", icon: Gift },
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
            <ChevronRight className="ml-auto size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
          </button>
        ))}
      </div>

      {method === "crypto" ? (
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
                  <p className="truncate text-sm text-foreground">{coin?.name ?? "Select an asset"}</p>
                  <p className="text-xs text-muted-foreground">{network}</p>
                </div>
              </div>
              <Badge variant="gold">Simulated</Badge>
            </div>
            <div className="mt-6">
              <CopyField label="Deposit address" value={address} />
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Send only {coin?.symbol ?? "the selected asset"} on {network}. This is a simulated
              environment — no real assets can be received.
            </p>
          </Card>
        </section>
      ) : (
        <section className="mt-10">
          <SectionHeader title="Redemption code" />
          <Card padding="lg">
            <div className="mb-5 grid gap-2 sm:grid-cols-3">
              {GIFT_CARDS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setCard(g.id)}
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-left transition-colors duration-300 ease-[var(--ease-luxe)]",
                    card === g.id
                      ? "border-gold/40 bg-surface-raised"
                      : "border-border bg-card hover:border-border-strong",
                  )}
                >
                  <span className="block text-sm text-foreground">{g.label}</span>
                  <span className="block text-xs text-muted-foreground">{g.note}</span>
                </button>
              ))}
            </div>
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                if (code.trim().length < 8) {
                  notify.message("Code incomplete", "Enter the full code from the card.");
                  return;
                }
                notify.success("Code submitted", "Redemption is under review.");
                setCode("");
              }}
            >
              <Input
                label="Code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="XXXX-XXXX-XXXX"
              />
              <Button type="submit" full>
                Submit for review
              </Button>
            </form>
          </Card>
        </section>
      )}
    </AppShell>
  );
}
