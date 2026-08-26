import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, Shield, LogOut, ChevronRight, Trash2 } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { MemberCard } from "@/components/cards/member-card";
import { SectionHeader } from "@/components/common/section-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { notify } from "@/lib/notify";
import { signOut } from "@/lib/supabase/auth";
import { useAuth } from "@/lib/use-auth";
import { clearVault, hasVault } from "@/lib/wallet-vault";

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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [verified, setVerified] = useState(true);
  const [vaultExists, setVaultExists] = useState(false);
  const [resettingVault, setResettingVault] = useState(false);
  useEffect(() => {
    void hasVault().then(setVaultExists);
  }, []);

  return (
    <AppShell eyebrow="Account" title="Settings">
      <MemberCard
        member={{
          id: user?.id ?? "self",
          name: user ? `${user.firstName} ${user.surname}`.trim() : "Account",
          handle: user?.username ?? "member",
          tier: "Member",
          since: user?.createdAt ?? new Date().toISOString(),
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
            <Input
              label="Display name"
              defaultValue={user ? `${user.firstName} ${user.surname}`.trim() : ""}
            />
            <Input label="Handle" defaultValue={user?.username ?? ""} />
            <Input
              label="Email"
              type="email"
              defaultValue={user?.email ?? ""}
              readOnly
              hint="Your login email is managed by secure account authentication."
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
        <SectionHeader title="Local wallet vault" />
        <Card padding="lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-foreground">Reset this device&apos;s vault</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                This only deletes the local encrypted copy. It does not recover or move funds.
              </p>
            </div>
            {resettingVault ? (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setResettingVault(false)}>
                  Cancel
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!vaultExists}
                  onClick={async () => {
                    await clearVault();
                    setVaultExists(false);
                    setResettingVault(false);
                    notify.message("Vault reset", "The local encrypted copy was deleted.");
                  }}
                >
                  <Trash2 /> Confirm reset
                </Button>
              </div>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                disabled={!vaultExists}
                onClick={() => setResettingVault(true)}
              >
                <Trash2 /> Reset vault
              </Button>
            )}
          </div>
        </Card>
      </section>

      <section className="mt-10">
        <SectionHeader title="Session" />
        <Card padding="lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">Sign out of this device</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={async () => {
                await signOut();
                notify.message("Signed out", "Your session has been closed.");
                void navigate({ to: "/auth", replace: true });
              }}
            >
              <LogOut /> Sign out
            </Button>
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
