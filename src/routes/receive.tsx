import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { SectionHeader } from "@/components/common/section-header";
import { CopyField } from "@/components/common/copy-field";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/receive")({
  head: () => ({
    meta: [
      { title: "Receive — Insider Domain" },
      { name: "description", content: "Your simulated deposit addresses across networks." },
      { property: "og:title", content: "Receive — Insider Domain" },
      {
        property: "og:description",
        content: "Your simulated deposit addresses across networks.",
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

      <SectionHeader title="Addresses" />
      <div className="space-y-3">
        {holdings.map((h) => (
          <CopyField key={h.id} label={`${h.symbol} · ${h.network}`} value={h.address} />
        ))}
      </div>

      <Card padding="lg" className="mt-6">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Send only the matching asset on the stated network. Deposits credit after network
          confirmation. All balances in Insider Domain are simulated.
        </p>
      </Card>
    </AppShell>
  );
}
