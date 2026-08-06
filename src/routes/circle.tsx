import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/app-shell";
import { MemberCard } from "@/components/cards/member-card";
import { SectionHeader } from "@/components/common/section-header";
import { Modal } from "@/components/common/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { members } from "@/lib/placeholder-data";
import { notify } from "@/lib/notify";

export const Route = createFileRoute("/circle")({
  head: () => ({
    meta: [
      { title: "Circle — Insider Domain" },
      {
        name: "description",
        content: "The members you introduced. Invitations are limited and permanent.",
      },
      { property: "og:title", content: "Circle — Insider Domain" },
      {
        property: "og:description",
        content: "The members you introduced. Invitations are limited and permanent.",
      },
    ],
  }),
  component: Circle,
});

function Circle() {
  const [open, setOpen] = useState(false);

  return (
    <AppShell
      eyebrow="Invitation only"
      title="Circle"
      action={
        <Button variant="gold" size="sm" onClick={() => setOpen(true)}>
          Invite
        </Button>
      }
    >
      <Card variant="quiet" padding="lg">
        <p className="text-eyebrow">Invitations remaining</p>
        <p className="numeric mt-3 text-3xl tracking-[var(--tracking-tightest)]">01</p>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Your membership includes a single unused invitation. It cannot be reissued.
        </p>
      </Card>

      <section className="mt-10">
        <SectionHeader title="Introduced by you" />
        <div className="space-y-3">
          {members.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      </section>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Extend an invitation"
        description="One invitation. Choose carefully."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setOpen(false);
                notify.success("Invitation sent", "You have no invitations remaining.");
              }}
            >
              Send
            </Button>
          </>
        }
      >
        <Input label="Email address" placeholder="name@domain.com" type="email" />
      </Modal>
    </AppShell>
  );
}
