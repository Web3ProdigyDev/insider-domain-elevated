import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Shield, LogOut, ChevronRight } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { MemberCard } from "@/components/cards/member-card";
import { SectionHeader } from "@/components/common/section-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { notify } from "@/lib/notify";
import { demoMember } from "@/lib/placeholder-data";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Insider Domain" },
      {
        name: "description",
        content: "Profile, membership, privacy and session preferences for your account.",
      },
      { property: "og:title", content: "Settings — Insider Domain" },
      {
        property: "og:description",
        content: "Profile, membership, privacy and session preferences for your account.",
      },
    ],
  }),
  component: Settings,
});

function Settings() {
  const [verified, setVerified] = useState(true);

  return (
    <AppShell eyebrow="Account" title="Settings">
      <MemberCard
        member={{
          id: "self",
          name: demoMember.name,
          handle: demoMember.handle,
          tier: demoMember.tier,
          since: demoMember.memberSince,
        }}
      />

      <section className="mt-10">
        <SectionHeader title="Profile" />
        <Card padding="lg">
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              notify.success("Profile saved", "Your details are updated.");
            }}
          >
            <Input label="Display name" defaultValue={demoMember.name} />
            <Input label="Handle" defaultValue={demoMember.handle} />
            <Input
              label="Email"
              type="email"
              defaultValue="a.marchetti@insiderdomain.com"
              hint="Used only for entry verification."
            />
            <Button type="submit">Save profile</Button>
          </form>
        </Card>
      </section>

      <section className="mt-10">
        <SectionHeader title="Preferences" />
        <div className="space-y-3">
          <Link
            to="/notifications"
            className="flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4 transition-colors duration-300 ease-[var(--ease-luxe)] hover:border-border-strong hover:bg-surface-raised"
          >
            <Bell className="size-4 text-muted-foreground" strokeWidth={1.75} />
            <span className="text-sm text-foreground">Notifications</span>
            <ChevronRight className="ml-auto size-4 text-muted-foreground" strokeWidth={1.75} />
          </Link>
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4">
            <Shield className="size-4 text-gold" strokeWidth={1.75} />
            <span className="min-w-0">
              <span className="block text-sm text-foreground">Encrypted environment</span>
              <span className="block text-xs text-muted-foreground">
                Sessions are verified on every entry.
              </span>
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => {
                setVerified((value) => !value);
                notify.message(verified ? "Verification paused" : "Verification enabled");
              }}
            >
              <Badge variant="gold">{verified ? "Verified" : "Review"}</Badge>
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <SectionHeader title="Session" />
        <Card padding="lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">Sign out of this device</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => notify.message("Signed out", "This is a simulated session.")}
            >
              <LogOut /> Sign out
            </Button>
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
