import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/common/empty-state";
import { SkeletonList } from "@/components/common/skeletons";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { listMembers } from "@/lib/admin.functions";
import { useRequireMember } from "@/lib/use-auth";

export const Route = createFileRoute("/admin")({ component: AdminMembers });

function AdminMembers() {
  const { ready, allowed } = useRequireMember({ adminOnly: true });
  const [value, setValue] = React.useState("");
  const [query, setQuery] = React.useState("");
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
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4 transition-colors hover:border-border-strong hover:bg-surface-raised"
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
