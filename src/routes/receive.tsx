import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { SectionHeader } from "@/components/common/section-header";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/receive")({
  head: () => ({
    meta: [
      { title: "Receive — Insider Domain" },
      { name: "description", content: "Manage verified deposit addresses across networks." },
      { property: "og:title", content: "Receive — Insider Domain" },
      {
        property: "og:description",
        content: "Manage verified deposit addresses across networks.",
      },
    ],
  }),
  component: Receive,
});

function Receive() {
  return (
    <AppShell eyebrow="Inbound" title="Receive">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" strokeWidth={1.75} /> Back to overview
      </Link>

      <SectionHeader title="Deposit addresses" />
      <Card padding="lg">
        <p className="text-sm leading-relaxed text-muted-foreground">
          No deposit addresses are configured yet. Add a supported wallet network before receiving
          funds.
        </p>
      </Card>

      <Card padding="lg" className="mt-6">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Only use an address generated for the matching asset and network. Never send funds to an
          address you cannot verify.
        </p>
      </Card>
    </AppShell>
  );
}
