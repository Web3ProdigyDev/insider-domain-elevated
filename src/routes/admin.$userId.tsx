import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, WalletCards } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/common/empty-state";
import { SkeletonCard, SkeletonList } from "@/components/common/skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMemberDetail } from "@/lib/admin.functions";
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
            <div className="mt-3">
              <Badge variant={profile.role === "admin" ? "default" : "secondary"}>
                {profile.role}
              </Badge>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-eyebrow">Onboarding</p>
            <p className="mt-3 text-sm text-foreground">
              {profile.onboarding_completed ? "Completed" : "Pending"}
            </p>
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
                    <tr key={transaction.id} className="border-b border-border last:border-0">
                      <td className="px-5 py-4 text-foreground">{transaction.type}</td>
                      <td className="px-5 py-4 text-muted-foreground">{transaction.asset_id}</td>
                      <td className="px-5 py-4 numeric text-foreground">{transaction.amount}</td>
                      <td className="px-5 py-4">
                        <Badge variant="secondary">{transaction.status}</Badge>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleString()}
                      </td>
                    </tr>
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
