import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";

import { AuthShell } from "@/components/layout/auth-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/supabase/auth";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/auth/suspended")({
  head: () => ({
    meta: [
      { title: "Account suspended — Insider Domain" },
      { name: "description", content: "This membership has been suspended." },
    ],
  }),
  component: Suspended,
});

function Suspended() {
  const navigate = useNavigate();
  const { user, ready } = useAuth();

  // If an admin lifts the suspension while this tab is open, move on.
  if (ready && user && !user.suspended) void navigate({ to: "/", replace: true });
  if (ready && !user) void navigate({ to: "/auth", replace: true });

  return (
    <AuthShell
      eyebrow="Membership"
      title="Account suspended"
      description="This membership has been suspended. Contact your Insider Domain admin if you believe this is a mistake."
    >
      <Card padding="lg">
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-3">
          <ShieldAlert className="size-4 shrink-0 text-destructive" strokeWidth={1.75} />
          <p className="text-sm text-destructive">Access to this account is currently paused.</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          full
          onClick={() => {
            void signOut();
            void navigate({ to: "/auth" });
          }}
        >
          Sign out
        </Button>
      </Card>
    </AuthShell>
  );
}