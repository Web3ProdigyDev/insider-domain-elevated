import { createFileRoute } from "@tanstack/react-router";
import { Bell } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { NotificationCard } from "@/components/cards/notification-card";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { notifications } from "@/lib/placeholder-data";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts — Insider Domain" },
      {
        name: "description",
        content: "Quiet, typeset notifications: allocation insights, invitations and system notes.",
      },
      { property: "og:title", content: "Alerts — Insider Domain" },
      {
        property: "og:description",
        content: "Quiet, typeset notifications: allocation insights, invitations and system notes.",
      },
    ],
  }),
  component: Alerts,
});

function Alerts() {
  return (
    <AppShell
      eyebrow="Private"
      title="Alerts"
      action={
        <Button variant="ghost" size="sm">
          Mark all read
        </Button>
      }
    >
      {notifications.length ? (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Bell />}
          title="Nothing to report"
          description="Insights and system notes will appear here."
        />
      )}
    </AppShell>
  );
}
