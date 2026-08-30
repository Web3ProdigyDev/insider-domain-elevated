import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/common/empty-state";
import { SkeletonList } from "@/components/common/skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createInviteCode, listInviteCodes, listMembers } from "@/lib/admin.functions";
import { useRequireMember } from "@/lib/use-auth";

export const Route = createFileRoute("/admin")({ component: AdminMembers });

function AdminMembers() {
  const { ready, allowed } = useRequireMember({ adminOnly: true });
  const [value, setValue] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState<"member" | "admin">("member");
  const [maxUses, setMaxUses] = React.useState("1");
  const [inviteBusy, setInviteBusy] = React.useState(false);
  const inviteQuery = useQuery({
    queryKey: ["admin-invites"],
    queryFn: listInviteCodes,
    enabled: ready && allowed,
    retry: false,
  });
  React.useEffect(() => {
    const timer = window.setTimeout(() => setQuery(value), 300);
    return () => window.clearTimeout(timer);
  }, [value]);
  const membersQuery = useQuery({
    queryKey: ["admin-members", query],
    queryFn: () => listMembers(query),
    enabled: ready && allowed,
    retry: false,
  });
  if (!ready || !allowed) return null;
  return (
    <AppShell eyebrow="Admin" title="Members" description="Read-only account oversight.">
      <div className="flex flex-col gap-6">
        <Card padding="lg">
          <form
            className="flex flex-wrap items-end gap-3"
            onSubmit={async (event) => {
              event.preventDefault();
              const uses = Number(maxUses);
              if (!Number.isInteger(uses) || uses < 1) return;
              setInviteBusy(true);
              try {
                const code = `ID-${Math.floor(1000 + Math.random() * 9000)}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
                await createInviteCode({ code, role: inviteRole, maxUses: uses });
                void inviteQuery.refetch();
              } finally {
                setInviteBusy(false);
              }
            }}
          >
            <div className="min-w-0 flex-1">
              <p className="text-eyebrow">Generate invite code</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Codes are created for admin distribution.
              </p>
            </div>
            <select
              aria-label="Invite role"
              className="h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground"
              value={inviteRole}
              onChange={(event) => setInviteRole(event.target.value as "member" | "admin")}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <Input
              label="Max uses"
              className="w-24"
              value={maxUses}
              onChange={(event) => setMaxUses(event.target.value)}
            />
            <Button type="submit" disabled={inviteBusy}>
              {inviteBusy ? "Generating…" : "Generate"}
            </Button>
          </form>
        </Card>
        {inviteQuery.isLoading ? (
          <SkeletonList rows={3} />
        ) : inviteQuery.data?.length ? (
          <div className="flex flex-col gap-3">
            {inviteQuery.data.map((invite) => (
              <Card key={invite.id} padding="md">
                <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                  <code className="text-sm text-foreground">{invite.code}</code>
                  <Badge variant={invite.role === "admin" ? "gold" : "secondary"}>
                    {invite.role}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {invite.uses}/{invite.max_uses} uses
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {invite.expires_at
                      ? `Expires ${new Date(invite.expires_at).toLocaleDateString()}`
                      : "No expiry"}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        ) : null}
        <Input
          label="Search members"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Name or username"
          icon={<Search />}
        />
        {membersQuery.isLoading ? (
          <SkeletonList rows={6} />
        ) : membersQuery.data?.length ? (
          <div className="flex flex-col gap-3">
            {membersQuery.data.map((member) => (
              <Link
                key={member.id}
                to="/admin/$userId"
                params={{ userId: member.id }}
                className="flex flex-col items-stretch gap-3 rounded-2xl border border-border bg-card px-4 py-4 transition-colors hover:border-border-strong hover:bg-surface-raised sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 sm:px-5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground">
                    {[member.first_name, member.surname].filter(Boolean).join(" ") ||
                      "Unnamed member"}
                  </p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {member.username ? `@${member.username}` : member.id}
                  </p>
                </div>
                <Badge variant={member.role === "admin" ? "default" : "secondary"}>
                  {member.role}
                </Badge>
                <Badge variant={member.onboarding_completed ? "secondary" : "outline"}>
                  {member.onboarding_completed ? "Onboarded" : "Pending"}
                </Badge>
                <time className="text-xs text-muted-foreground" dateTime={member.created_at}>
                  {new Date(member.created_at).toLocaleDateString()}
                </time>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Shield />}
            title="No members match"
            description="Try a different name or username."
          />
        )}
      </div>
    </AppShell>
  );
}
