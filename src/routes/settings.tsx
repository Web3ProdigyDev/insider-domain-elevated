import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/app-shell";
import { MemberCard } from "@/components/cards/member-card";
import { SectionHeader } from "@/components/common/section-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { demoMember } from "@/lib/placeholder-data";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Insider Domain" },
      {
        name: "description",
        content: "Membership, privacy and session preferences for your Insider Domain account.",
      },
      { property: "og:title", content: "Settings — Insider Domain" },
      {
        property: "og:description",
        content: "Membership, privacy and session preferences for your Insider Domain account.",
      },
    ],
  }),
  component: Settings,
});

function Settings() {
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
        <SectionHeader title="Environment" />
        <Card padding="lg">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <p className="text-sm text-foreground">Encrypted environment</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                Your keys remain private. Sessions are verified on every entry.
              </p>
            </div>
            <Badge variant="gold">Verified</Badge>
          </div>
        </Card>
      </section>

      <section className="mt-10">
        <SectionHeader title="Session" />
        <Card padding="lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">Sign out of this device</p>
            <Button variant="secondary" size="sm">
              Sign out
            </Button>
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
