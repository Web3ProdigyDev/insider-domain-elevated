import { createFileRoute } from "@tanstack/react-router";
import { RotateCcw, Sparkles, Users, Wallet } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSim } from "@/lib/use-sim";
import { resetSim, seedDemoData, setMemberStatus } from "@/lib/sim-store";
import { notify } from "@/lib/notify";

export const Route = createFileRoute("/admin")({ component: Admin });
function Admin() {
  const { members, transactions, assistant, audit } = useSim();
  return (
    <AppShell eyebrow="Simulation controls" title="Admin Control Center">
      <div className="flex flex-col gap-6">
        <Card padding="lg" variant="raised">
          <div className="flex items-center gap-3">
            <Sparkles className="size-5 text-gold" />
            <div>
              <p className="text-sm text-foreground">Demo environment</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Every control is local, reversible, and non-custodial.
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
                notify.success("Demo data seeded", "The simulation is ready for review.");
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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric icon={<Users />} label="Members" value={members.length} />
          <Metric icon={<Wallet />} label="Transactions" value={transactions.length} />
          <Metric icon={<Sparkles />} label="AI reviews" value={assistant.reviews} />
          <Metric icon={<RotateCcw />} label="Audit entries" value={audit.length} />
        </div>
        <section>
          <p className="text-eyebrow">Member controls</p>
          <div className="mt-3 flex flex-col gap-2">
            {members.map((member) => (
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
            ))}
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
