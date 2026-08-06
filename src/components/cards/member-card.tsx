import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Member } from "@/lib/placeholder-data";

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export function MemberCard({
  member,
  action,
  className,
}: {
  member: Member;
  action?: ReactNode | undefined;
  className?: string | undefined;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4",
        className,
      )}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-full border border-border text-xs tracking-tight text-muted-foreground">
        {initials(member.name)}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm text-foreground">{member.name}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {member.handle} · since {member.since}
        </span>
      </span>
      <span className="shrink-0">
        {action ?? (
          <Badge variant={member.tier === "Founding" ? "gold" : "default"}>{member.tier}</Badge>
        )}
      </span>
    </div>
  );
}
