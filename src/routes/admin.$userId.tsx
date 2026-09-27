import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Bot, ChartNoAxesCombined, WalletCards } from "lucide-react";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/common/empty-state";
import { CoinLogo } from "@/components/common/coin-logo";
import { SkeletonCard, SkeletonList } from "@/components/common/skeletons";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  adjustMemberBalance,
  awardBotReturns,
  createMemberSpike,
  deactivateMemberSpike,
  getMemberDetail,
  setMemberSuspended,
  updateMemberRole,
} from "@/lib/admin.functions";
import { useRequireMember } from "@/lib/use-auth";
import { useMarkets } from "@/lib/use-markets";

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
  const [spikeCoin, setSpikeCoin] = React.useState("solana");
  const [spikePercent, setSpikePercent] = React.useState("10");
  const [returnAmount, setReturnAmount] = React.useState("");
  const [returnReason, setReturnReason] = React.useState("Bot earnings ready");
  const { coins } = useMarkets();
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
        <section className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-4">
              <Avatar className="size-16 border border-border shadow-sm">
                <AvatarImage
                  src={profile.avatar_url ?? undefined}
                  alt={`${name} profile picture`}
                />
                <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-eyebrow">Member profile</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-medium tracking-tight text-foreground">{name}</h2>
                  <Badge variant={profile.suspended ? "destructive" : "secondary"}>
                    {profile.suspended ? "Suspended" : "Active"}
                  </Badge>
                  <Badge variant="outline">{profile.role}</Badge>
                </div>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  {profile.email || "No email on file"} · Review identity, access, wallet balances,
                  and activity.
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-background/50 px-4 py-3 text-left sm:min-w-44">
            <p className="text-eyebrow">Member since</p>
            <p className="mt-1 text-sm text-foreground">
              {new Date(profile.created_at).toLocaleDateString()}
            </p>
          </div>
        </section>
        <section className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-eyebrow">Email</p>
            <p className="mt-3 truncate text-sm text-foreground">
              {profile.email || "Not available"}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-eyebrow">Access role</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Controls what this member can access.
            </p>
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
                {busy ? "Saving…" : "Save role"}
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
            <p className="text-eyebrow">Account status</p>
            <p className="mt-1 text-xs text-muted-foreground">Pause or restore member access.</p>
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
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-gold/25 bg-gold-muted/10 p-6">
            <div className="flex items-start gap-3">
              <span className="grid size-10 place-items-center rounded-2xl bg-gold-muted text-gold">
                <ChartNoAxesCombined />
              </span>
              <div>
                <p className="text-eyebrow">Member market action</p>
                <h2 className="mt-1 text-xl font-medium text-foreground">Apply a price spike</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Adds a clearly labelled simulated move for this member and sends them a
                  notification.
                </p>
              </div>
            </div>
            <form
              className="mt-5 flex flex-col gap-3"
              onSubmit={async (event) => {
                event.preventDefault();
                setBusy(true);
                try {
                  await createMemberSpike(userId, spikeCoin, Number(spikePercent));
                  setSpikePercent("10");
                  void detailQuery.refetch();
                } finally {
                  setBusy(false);
                }
              }}
            >
              <select
                aria-label="Spike asset"
                value={spikeCoin}
                onChange={(event) => setSpikeCoin(event.target.value)}
                className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground"
              >
                {coins.slice(0, 60).map((coin) => (
                  <option key={coin.id} value={coin.id}>
                    {coin.symbol} · {coin.name}
                  </option>
                ))}
              </select>
              <div className="flex gap-3">
                <input
                  aria-label="Spike percentage"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={spikePercent}
                  onChange={(event) => setSpikePercent(event.target.value)}
                  className="h-10 min-w-0 flex-1 rounded-xl border border-border bg-background px-3 text-sm text-foreground"
                />
                <span className="-ml-14 flex items-center pr-3 text-sm text-muted-foreground">
                  %
                </span>
                <Button type="submit" disabled={busy}>
                  Notify & apply
                </Button>
              </div>
            </form>
            <div className="mt-4 flex flex-col gap-2">
              {spikes
                .filter((spike) => spike.active)
                .map((spike) => (
                  <div
                    key={spike.id}
                    className="flex items-center gap-2 rounded-xl border border-border bg-background/50 px-3 py-2 text-xs"
                  >
                    <span className="font-medium text-foreground">{spike.coin_id}</span>
                    <Badge variant="secondary">+{spike.spike_percent}%</Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-auto"
                      onClick={async () => {
                        await deactivateMemberSpike(spike.id);
                        void detailQuery.refetch();
                      }}
                    >
                      Deactivate
                    </Button>
                  </div>
                ))}
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6">
            <div className="flex items-start gap-3">
              <span className="grid size-10 place-items-center rounded-2xl bg-surface text-gold">
                <Bot />
              </span>
              <div>
                <p className="text-eyebrow">Bot earnings</p>
                <h2 className="mt-1 text-xl font-medium text-foreground">Mark returns ready</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Credits simulated USD earnings and sends “your returns are ready” to the member.
                </p>
              </div>
            </div>
            <form
              className="mt-5 flex flex-col gap-3"
              onSubmit={async (event) => {
                event.preventDefault();
                setBusy(true);
                try {
                  await awardBotReturns(userId, Number(returnAmount), returnReason);
                  setReturnAmount("");
                  void detailQuery.refetch();
                } finally {
                  setBusy(false);
                }
              }}
            >
              <input
                aria-label="Bot return amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="$10,000"
                value={returnAmount}
                onChange={(event) => setReturnAmount(event.target.value)}
                className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground"
                required
              />
              <input
                aria-label="Bot return reason"
                value={returnReason}
                onChange={(event) => setReturnReason(event.target.value)}
                className="h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground"
                required
              />
              <Button type="submit" disabled={busy}>
                Credit & notify
              </Button>
            </form>
          </div>
        </section>
        <section>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-eyebrow">Wallet overview</p>
              <h2 className="mt-1 text-xl font-medium text-foreground">Recorded balances</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Simulated ledger balances currently attached to this member.
              </p>
            </div>
            <Badge variant="outline">
              {balances.length} asset{balances.length === 1 ? "" : "s"}
            </Badge>
          </div>
          {balances.length ? (
            <div className="mt-4 flex flex-col gap-3">
              {balances.map((balance) => (
                <div
                  key={balance.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-4 sm:px-5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <CoinLogo
                      src={coins.find((coin) => coin.id === balance.asset_id)?.image ?? ""}
                      symbol={
                        coins.find((coin) => coin.id === balance.asset_id)?.symbol ??
                        balance.asset_id
                      }
                      size={36}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {coins.find((coin) => coin.id === balance.asset_id)?.name ??
                          balance.asset_id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {coins.find((coin) => coin.id === balance.asset_id)?.symbol ??
                          balance.asset_id.toUpperCase()}{" "}
                        · $
                        {coins
                          .find((coin) => coin.id === balance.asset_id)
                          ?.price?.toLocaleString() ?? "price unavailable"}
                      </p>
                    </div>
                  </div>
                  <span className="numeric text-sm text-foreground">
                    {Number(balance.amount).toLocaleString(undefined, { maximumFractionDigits: 6 })}
                  </span>
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
        <section className="rounded-3xl border border-border bg-card p-6">
          <p className="text-eyebrow">Wallet action</p>
          <h2 className="mt-1 text-xl font-medium text-foreground">Adjust simulated balance</h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Use a positive amount to credit or a negative amount to debit. Every change requires a
            reason and is recorded in the audit trail.
          </p>
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
          <p className="text-eyebrow">Audit trail</p>
          <h2 className="mt-1 text-xl font-medium text-foreground">Transaction history</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Select a transaction type to inspect its recorded metadata.
          </p>
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
