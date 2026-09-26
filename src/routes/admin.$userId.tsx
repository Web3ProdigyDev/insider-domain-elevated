import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, WalletCards } from "lucide-react";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/common/empty-state";
import { SkeletonCard, SkeletonList } from "@/components/common/skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  adjustMemberBalance,
  getMemberDetail,
  setMemberSuspended,
  updateMemberRole,
} from "@/lib/admin.functions";
import { useRequireMember } from "@/lib/use-auth";

export const Route = createFileRoute("/admin/$userId")({ component: AdminMemberDetail });

function AdminMemberDetail() {
  const { userId } = Route.useParams();
  const { ready, allowed } = useRequireMember({ adminOnly: true });
  const detailQuery = useQuery({
    queryKey: ["admin-member", userId],
    queryFn: () => getMemberDetail(userId),
    enabled: ready && allowed,
    retry: false,
  });
  const [role, setRole] = React.useState<"member" | "admin">("member");
  const [assetId, setAssetId] = React.useState("");
  const [delta, setDelta] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [expandedTransaction, setExpandedTransaction] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (detailQuery.data?.profile.role)
      setRole(detailQuery.data.profile.role as "member" | "admin");
  }, [detailQuery.data?.profile.role]);
  if (!ready || !allowed) return null;
  if (detailQuery.isLoading)
    return (
      <AppShell eyebrow="Admin" title="Member detail">
        <SkeletonCard />
        <div className="mt-6">
          <SkeletonList rows={4} />
        </div>
      </AppShell>
    );
  if (detailQuery.isError || !detailQuery.data)
    return (
      <AppShell eyebrow="Admin" title="Member unavailable">
        <EmptyState
          icon={<WalletCards />}
          title="Member unavailable"
          description="This member could not be loaded."
        />
      </AppShell>
    );
  const { profile, balances, transactions } = detailQuery.data;
  const name = [profile.first_name, profile.surname].filter(Boolean).join(" ") || "Unnamed member";
  return (
    <AppShell
      eyebrow="Admin"
      title={name}
      description={profile.email || (profile.username ? `@${profile.username}` : "Member detail")}
      action={
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin">
            <ArrowLeft /> Back to members
          </Link>
        </Button>
      }
    >
      <div className="flex flex-col gap-8">
        <section className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-eyebrow">Email</p>
            <p className="mt-3 truncate text-sm text-foreground">
              {profile.email || "Not available"}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-eyebrow">Role</p>
            <div className="mt-3 flex items-center gap-2">
              <select
                aria-label="Member role"
                value={role}
                onChange={(event) => setRole(event.target.value as "member" | "admin")}
                className="h-9 rounded-lg border border-border bg-card px-2 text-sm text-foreground"
              >
                <option value="member">member</option>
                <option value="admin">admin</option>
              </select>
              <Button
                size="sm"
                disabled={busy || role === profile.role}
                onClick={async () => {
                  if (role === "admin" && !window.confirm("Grant admin access to this member?"))
                    return;
                  setBusy(true);
                  try {
                    await updateMemberRole(userId, role);
                    void detailQuery.refetch();
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Save
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-eyebrow">Onboarding</p>
            <p className="mt-3 text-sm text-foreground">
              {profile.onboarding_completed ? "Completed" : "Pending"}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-eyebrow">Status</p>
            <Button
              className="mt-3"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await setMemberSuspended(userId, !profile.suspended);
                  void detailQuery.refetch();
                } finally {
                  setBusy(false);
                }
              }}
            >
              {profile.suspended ? "Reinstate member" : "Suspend member"}
            </Button>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-eyebrow">Joined</p>
            <p className="mt-3 text-sm text-foreground">
              {new Date(profile.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-eyebrow">Member ID</p>
            <code className="mt-3 block truncate text-xs text-muted-foreground">{profile.id}</code>
          </div>
        </section>
        <section>
          <h2 className="text-lg font-medium text-foreground">Wallet balances</h2>
          {balances.length ? (
            <div className="mt-4 flex flex-col gap-3">
              {balances.map((balance) => (
                <div
                  key={balance.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-4 sm:px-5"
                >
                  <span className="text-sm text-foreground">{balance.asset_id}</span>
                  <span className="numeric text-sm text-foreground">{balance.amount}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState
                icon={<WalletCards />}
                title="No balances yet"
                description="This member has no recorded wallet balances."
              />
            </div>
          )}
        </section>
        <section className="rounded-2xl border border-border bg-card p-5">
          <p className="text-eyebrow">Adjust balance</p>
          <form
            className="mt-4 grid gap-3 sm:grid-cols-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setBusy(true);
              try {
                await adjustMemberBalance(userId, assetId, Number(delta), reason);
                setDelta("");
                setReason("");
                void detailQuery.refetch();
              } finally {
                setBusy(false);
              }
            }}
          >
            <input
              aria-label="Asset id"
              placeholder="Asset id"
              value={assetId}
              onChange={(event) => setAssetId(event.target.value)}
              className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground"
              required
            />
            <input
              aria-label="Amount"
              type="number"
              step="any"
              placeholder="Amount"
              value={delta}
              onChange={(event) => setDelta(event.target.value)}
              className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground"
              required
            />
            <input
              aria-label="Reason"
              placeholder="Reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground sm:col-span-2"
              required
            />
            <Button type="submit" disabled={busy}>
              Apply adjustment
            </Button>
          </form>
        </section>
        <section>
          <h2 className="text-lg font-medium text-foreground">Transaction history</h2>
          {transactions.length ? (
            <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-border bg-surface">
                  <tr>
                    <th className="px-5 py-3 font-medium text-muted-foreground">Type</th>
                    <th className="px-5 py-3 font-medium text-muted-foreground">Asset</th>
                    <th className="px-5 py-3 font-medium text-muted-foreground">Amount</th>
                    <th className="px-5 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="px-5 py-3 font-medium text-muted-foreground">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <React.Fragment key={transaction.id}>
                      <tr className="border-b border-border last:border-0">
                        <td className="px-5 py-4 text-foreground">
                          <button
                            type="button"
                            className="text-left hover:text-gold"
                            onClick={() =>
                              setExpandedTransaction((current) =>
                                current === transaction.id ? null : transaction.id,
                              )
                            }
                          >
                            {transaction.type}
                          </button>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">{transaction.asset_id}</td>
                        <td className="px-5 py-4 numeric text-foreground">{transaction.amount}</td>
                        <td className="px-5 py-4">
                          <Badge variant="outline">{transaction.status}</Badge>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleString()}
                        </td>
                      </tr>
                      {expandedTransaction === transaction.id ? (
                        <tr className="border-b border-border bg-surface/50">
                          <td colSpan={5} className="px-5 py-4 text-xs text-muted-foreground">
                            <pre className="whitespace-pre-wrap font-sans">
                              {JSON.stringify(transaction.metadata ?? {}, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      ) : null}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState
                icon={<WalletCards />}
                title="No transactions yet"
                description="This member has no recorded transaction history."
              />
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}