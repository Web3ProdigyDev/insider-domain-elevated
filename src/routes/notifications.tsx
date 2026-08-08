import { createFileRoute } from "@tanstack/react-router";
import { Bell, Check } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { NotificationCard } from "@/components/cards/notification-card";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { notifications as seed } from "@/lib/placeholder-data";
import { notify } from "@/lib/notify";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Insider Domain" },
      {
        name: "description",
        content: "Quiet, typeset notices: allocation insight, invitations and system notes.",
      },
      { property: "og:title", content: "Notifications — Insider Domain" },
      {
        property: "og:description",
        content: "Quiet, typeset notices: allocation insight, invitations and system notes.",
      },
    ],
  }),
  component: Notifications,
});

function Notifications() {
  const [items, setItems] = useState(seed);
  const unread = items.filter((n) => n.unread).length;

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
            setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
            notify.message("All notices marked read");
          }}
        >
          <Check /> Mark all read
        </Button>
      }
    >
      {items.length ? (
        <div className="space-y-3">
          {items.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Bell />}
          title="Nothing to report"
          description="Insight and system notes will appear here."
        />
      )}
    </AppShell>
  );
}
