import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CircleDollarSign, Play, Sparkles, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { notify } from "@/lib/notify";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Investment — Insider Domain" },
      { name: "description", content: "A private investment assistant awaiting configuration." },
    ],
  }),
  component: Assistant,
});

function Assistant() {
  return (
    <AppShell eyebrow="Private intelligence" title="AI Investment">
      <SetupAssistant
        onActivate={() =>
          notify.message("AI Investment unavailable", "Assistant execution is not configured yet.")
        }
      />
    </AppShell>
  );
}

function SetupAssistant({ onActivate }: { onActivate: () => void }) {
  const { user } = useAuth();
  const [tradeCode, setTradeCode] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState<{ code: string; amount: string } | null>(null);
  const [trades, setTrades] = useState<
    Array<{ id: string; trade_code: string; amount: number; created_at: string }>
  >([]);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!user) return;
    void supabase
      .from("copied_trades")
      .select("id,trade_code,amount,created_at")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setTrades((data ?? []) as typeof trades);
      });
  }, [supabase, user]);

  async function copyTrade(event: FormEvent) {
    event.preventDefault();
    if (
      !user ||
      busy ||
      !tradeCode.trim() ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0
    )
      return;
    setBusy(true);
    setSuccess(null);
    await new Promise((resolve) => window.setTimeout(resolve, 650));
    const row = { user_id: user.id, trade_code: tradeCode.trim(), amount: Number(amount) };
    const { data, error } = await supabase
      .from("copied_trades")
      .insert(row)
      .select("id,trade_code,amount,created_at")
      .single();
    if (!error && data) {
      setTrades((current) => [data as (typeof trades)[number], ...current]);
      setSuccess({ code: row.trade_code, amount: amount });
      setTradeCode("");
      setAmount("");
    } else notify.message("Copy failed", "The simulated trade could not be recorded.");
    setBusy(false);
  }

  return (
    <section className="flex flex-col gap-6">
      <Card padding="lg" variant="raised">
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_220px] md:items-center">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-gold-muted text-gold">
              <Sparkles className="size-4" />
            </span>
            <div>
              <p className="text-sm text-foreground">AI Investment is off</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Assistant execution is not connected.
              </p>
            </div>
          </div>
          <AICompanion state="idle" />
        </div>
        <div className="mt-6 flex items-start gap-3 border-t border-border pt-5">
          <Badge variant="secondary">Simulation only</Badge>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Copying records a simulated position only. No real funds or trades move.
          </p>
        </div>
      </Card>
      <form
        onSubmit={copyTrade}
        className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5"
      >
        <div>
          <h2 className="text-sm text-foreground">Copy a trade</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Use any simulated trade code and amount.
          </p>
        </div>
        <label className="text-xs text-muted-foreground">
          Trade code
          <input
            className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
            value={tradeCode}
            onChange={(event) => setTradeCode(event.target.value)}
            placeholder="e.g. INSIDER-ALPHA"
          />
        </label>
        <label className="text-xs text-muted-foreground">
          Amount
          <input
            className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            inputMode="decimal"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
          />
        </label>
        <Button type="submit" disabled={busy || !tradeCode.trim() || Number(amount) <= 0}>
          {busy ? "Copying trade…" : "Copy a trade"}
        </Button>
        {success && (
          <p className="text-sm text-gold" role="status">
            Trade copied — {success.code} · {success.amount}
          </p>
        )}
      </form>
      <Card padding="lg">
        <div className="flex items-center justify-between">
          <h2 className="text-sm text-foreground">Active simulated positions</h2>
          <Badge variant="secondary">{trades.length}</Badge>
        </div>
        {trades.length === 0 ? (
          <p className="mt-4 text-xs text-muted-foreground">No simulated positions yet.</p>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {trades.map((trade) => (
              <div
                key={trade.id}
                className="flex items-center justify-between rounded-xl border border-border px-4 py-3"
              >
                <div>
                  <p className="text-sm text-foreground">{trade.trade_code}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Simulated position</p>
                </div>
                <p className="numeric text-sm text-foreground">{Number(trade.amount).toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Button full variant="outline" onClick={onActivate}>
        <Play /> Configure AI Investment
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        You can pause at any time.{" "}
        <Link to="/privacy" className="text-gold hover:underline">
          Read the privacy policy
        </Link>
        .
      </p>
    </section>
  );
}

function AICompanion({ state }: { state: "active" | "idle" }) {
  const active = state === "active";
  return (
    <div
      className={cn("ai-companion", active && "ai-companion-active")}
      role="img"
      aria-label={active ? "AI companion is working" : "AI companion is idle"}
    >
      <div className="ai-companion-face">
        <span className="ai-companion-eye" />
        <span className="ai-companion-eye" />
        <span className="ai-companion-mouth" />
      </div>
      <span className="ai-companion-signal">{active ? <TrendingUp /> : <CircleDollarSign />}</span>
      <span className="ai-companion-label">{active ? "scanning" : "standby"}</span>
    </div>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-eyebrow">{label}</dt>
      <dd className="numeric mt-1.5 text-sm text-foreground">{children}</dd>
    </div>
  );
}

export default Assistant;

export { Assistant };
