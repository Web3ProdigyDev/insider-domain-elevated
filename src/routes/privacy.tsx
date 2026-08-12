import { createFileRoute, Link } from "@tanstack/react-router";

import { MarketingShell, Crumbs } from "@/components/marketing/marketing-shell";

const URL = "https://insider-domain-elevated.lovable.app/privacy";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Insider Domain" },
      {
        name: "description",
        content:
          "How Insider Domain handles membership enquiries, simulated account data and device storage. No real funds, no third-party sale of data.",
      },
      { property: "og:title", content: "Privacy Policy — Insider Domain" },
      {
        property: "og:description",
        content: "How Insider Domain handles enquiries, simulated account data and device storage.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: Privacy,
});

const SECTIONS = [
  {
    h: "What this platform is",
    p: "Insider Domain is a private simulator. No real funds are held, transmitted or invested. Balances, transactions and assistant activity are simulated for demonstration.",
  },
  {
    h: "What we collect",
    p: "Membership enquiries: the name, email and note you submit. Application use: your simulated profile, preferences and activity, stored locally in your browser.",
  },
  {
    h: "How it is used",
    p: "Enquiry details are used solely to respond to you about membership. We do not sell, rent or share personal data with third parties for marketing.",
  },
  {
    h: "Analytics",
    p: "If analytics is enabled for this deployment, we collect aggregate, non-identifying usage data (pages viewed, device class) to improve the product.",
  },
  {
    h: "Storage on your device",
    p: "Session, onboarding and simulation state are kept in your browser's local storage. Clearing site data removes them permanently.",
  },
  {
    h: "Your choices",
    p: "You can request deletion of an enquiry record, or clear all local data from Settings at any time.",
  },
];

function Privacy() {
  return (
    <MarketingShell>
      <Crumbs items={[{ label: "Privacy" }]} />
      <h1 className="mt-6 text-3xl font-medium tracking-[var(--tracking-tightest)] text-foreground sm:text-4xl">
        Privacy Policy
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">Last reviewed 12 August 2026.</p>

      <div className="mt-10 space-y-8">
        {SECTIONS.map((s) => (
          <section key={s.h}>
            <h2 className="text-sm text-foreground">{s.h}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.p}</p>
          </section>
        ))}
      </div>

      <p className="mt-12 text-sm text-muted-foreground">
        Questions? Write to us from the{" "}
        <Link to="/membership" className="text-gold hover:underline">
          membership page
        </Link>{" "}
        — we reply within one business day.
      </p>
    </MarketingShell>
  );
}
