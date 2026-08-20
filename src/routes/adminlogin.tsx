import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CandlestickChart, EyeOff, RotateCcw, ShieldCheck, Users, Wallet } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSim } from "@/lib/use-sim";
import { adminSetBalance, resetSim, seedDemoData, setMemberStatus } from "@/lib/sim-store";
import { notify } from "@/lib/notify";

export const Route = createFileRoute("/adminlogin")({ component: AdminLogin });

function AdminLogin() {
  const { members, transactions, assistant, audit, balances } = useSim();
  const [assetId, setAssetId] = React.useState("bitcoin");
  const [amount, setAmount] = React.useState(String(balances.bitcoin ?? 0));
  const [query, setQuery] = React.useState("");
  const visibleMembers = members.filter((member) =>
    `${member.name} ${member.handle}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <AppShell eyebrow="Simulation controls" title="Admin Control Center">
      <div className="flex flex-col gap-6">
        <Card padding="lg" variant="raised">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gold-muted text-gold">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <p className="text-sm text-foreground">Admin simulation portal</p>
              <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">
                Full control over the educational sandbox: seed data, adjust simulated balances,
                moderate members, and inspect the audit trail. Nothing here connects to real funds.
              </p>
            </div>
            <Badge className="ml-auto" variant="secondary">
              Admin
            </Badge>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button
              onClick={() => {
                seedDemoData();
                notify.success("Demo data seeded", "The sandbox is ready for review.");
              }}
            >
              Seed demo data
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                resetSim();
                notify.message("Simulation reset", "Seed state restored.");
              }}
            >
              <RotateCcw /> Reset
            </Button>
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex items-start gap-3">
            <CandlestickChart className="size-5 text-gold" />
            <div>
              <p className="text-sm text-foreground">Simulated wallet controls</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Set a demo balance for lessons and scenario testing. Changes are local and audited.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-[0.8fr_1fr_auto] sm:items-end">
            <Input
              label="Asset"
              value={assetId}
              onChange={(event) => setAssetId(event.target.value)}
            />
            <Input
              label="Demo amount"
              type="number"
              min="0"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
            <Button
              onClick={() => {
                adminSetBalance(assetId.trim() || "bitcoin", Number(amount) || 0);
                notify.success("Balance updated", "The simulated wallet was adjusted.");
              }}
            >
              Apply balance
            </Button>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            <EyeOff className="size-4 shrink-0" />
            Recovery phrases and private keys are never collected, stored, displayed, or
            exported—even in this demo.
          </div>
        </Card>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric icon={<Users />} label="Members" value={members.length} />
          <Metric icon={<Wallet />} label="Transactions" value={transactions.length} />
          <Metric icon={<CandlestickChart />} label="AI reviews" value={assistant.reviews} />
          <Metric icon={<RotateCcw />} label="Audit entries" value={audit.length} />
        </div>

        <section>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-eyebrow">Member controls</p>
            <Input
              aria-label="Search members"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search members"
              className="max-w-xs"
            />
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {visibleMembers.length ? (
              visibleMembers.map((member) => (
                <div
                  key={member.handle}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3"
                >
                  <div>
                    <p className="text-sm text-foreground">{member.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      @{member.handle} · {member.tier}
                    </p>
                  </div>
                  <Badge
                    className="ml-auto"
                    variant={member.status === "active" ? "secondary" : "destructive"}
                  >
                    {member.status}
                  </Badge>
                  {member.handle !== "a.marchetti" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setMemberStatus(
                          member.handle,
                          member.status === "active" ? "suspended" : "active",
                        )
                      }
                    >
                      {member.status === "active" ? "Suspend" : "Restore"}
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-border px-3 py-4 text-sm text-muted-foreground">
                No members match that search.
              </p>
            )}
          </div>
        </section>

        <section>
          <p className="text-eyebrow">Audit trail</p>
          <div className="mt-3 flex flex-col gap-2">
            {audit.length ? (
              audit.slice(0, 8).map((entry) => (
                <div
                  key={entry.id}
                  className="flex flex-wrap items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs"
                >
                  <Badge variant="outline">{entry.action}</Badge>
                  <span className="text-muted-foreground">{entry.target}</span>
                  <span className="ml-auto text-muted-foreground">
                    {new Date(entry.at).toLocaleTimeString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No admin actions recorded yet.</p>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card padding="md">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-eyebrow">{label}</span>
      </div>
      <p className="numeric mt-3 text-2xl text-foreground">{value}</p>
    </Card>
  );
}
