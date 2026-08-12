import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Bell, Check } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { notify } from "@/lib/notify";
import { useSim } from "@/lib/use-sim";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/sim-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Insider Domain" },
      {
        name: "description",
        content: "Quiet, typeset notices: assistant reviews, invitations, funding and system notes.",
      },
      { property: "og:title", content: "Notifications — Insider Domain" },
      {
        property: "og:description",
        content: "Assistant reviews, invitations, funding and system notes in one quiet place.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://insider-domain-elevated.lovable.app/notifications" },
    ],
    links: [
      { rel: "canonical", href: "https://insider-domain-elevated.lovable.app/notifications" },
    ],
  }),
  component: Notifications,
});

function when(at: number) {
  const mins = Math.max(0, Math.round((Date.now() - at) / 60000));
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  if (mins < 1440) return `${Math.round(mins / 60)}h`;
  return `${Math.round(mins / 1440)}d`;
}

function Notifications() {
  const { notifications } = useSim();
  const navigate = useNavigate();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <AppShell
      eyebrow={unread ? `${unread} unread` : "All read"}
      title="Notifications"
      action={
        <Button
          variant="ghost"
          size="sm"
          disabled={!unread}
          onClick={() => {
            markAllNotificationsRead();
            notify.message("All notices marked read");
          }}
        >
          <Check /> Mark all read
        </Button>
      }
    >
      {notifications.length ? (
        <div className="space-y-3">
          {notifications.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => {
                markNotificationRead(n.id);
                void navigate({ to: n.to });
              }}
              className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-4 rounded-2xl border border-border bg-card px-5 py-4 text-left transition-colors duration-300 ease-[var(--ease-luxe)] hover:border-border-strong hover:bg-surface-raised"
            >
              <span
                className={cn(
                  "mt-1.5 size-1.5 shrink-0 rounded-full",
                  n.read ? "bg-border-strong" : "bg-gold",
                )}
              />
              <span className="min-w-0">
                <span className="block truncate text-sm text-foreground">{n.title}</span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                  {n.body}
                </span>
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">{when(n.createdAt)}</span>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Bell />}
          title="Nothing to report"
          description="Assistant reviews and system notes will appear here."
        />
      )}
    </AppShell>
  );
}
