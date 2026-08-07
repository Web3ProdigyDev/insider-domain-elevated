import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/app-shell";
import { MemberCard } from "@/components/cards/member-card";
import { PostCard } from "@/components/cards/post-card";
import { SectionHeader } from "@/components/common/section-header";
import { Modal } from "@/components/common/modal";
import {
  SegmentedTabs,
  SegmentedTabsContent,
  SegmentedTabsList,
  SegmentedTabsTrigger,
} from "@/components/common/segmented-tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { members, demoMember } from "@/lib/placeholder-data";
import { feedPosts, type FeedPost } from "@/lib/feed-data";
import { notify } from "@/lib/notify";

export const Route = createFileRoute("/circle")({
  head: () => ({
    meta: [
      { title: "Circle — Insider Domain" },
      {
        name: "description",
        content: "A members-only feed. Considered notes, quiet replies, invitation-only company.",
      },
      { property: "og:title", content: "Circle — Insider Domain" },
      {
        property: "og:description",
        content: "A members-only feed. Considered notes, quiet replies, invitation-only company.",
      },
    ],
  }),
  component: Circle,
});

function Circle() {
  const [open, setOpen] = useState(false);
  const [posts, setPosts] = useState<FeedPost[]>(feedPosts);
  const [draft, setDraft] = useState("");

  const toggleLike = (id: string) =>
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p,
      ),
    );

  const addComment = (id: string, body: string) =>
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              comments: [
                ...p.comments,
                {
                  id: `${id}-${Date.now()}`,
                  author: demoMember.name,
                  handle: demoMember.handle,
                  body,
                  date: "Just now",
                },
              ],
            }
          : p,
      ),
    );

  const publish = () => {
    const body = draft.trim();
    if (!body) return;
    setPosts((prev) => [
      {
        id: `p-${Date.now()}`,
        author: demoMember.name,
        handle: demoMember.handle,
        tier: demoMember.tier,
        date: "Just now",
        body,
        likes: 0,
        liked: false,
        comments: [],
      },
      ...prev,
    ]);
    setDraft("");
  };

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
      <SegmentedTabs defaultValue="feed">
        <SegmentedTabsList>
          <SegmentedTabsTrigger value="feed">Feed</SegmentedTabsTrigger>
          <SegmentedTabsTrigger value="members">Members</SegmentedTabsTrigger>
        </SegmentedTabsList>

        <SegmentedTabsContent value="feed">
          <Card variant="quiet" padding="lg">
            <p className="text-eyebrow">Post to the circle</p>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              placeholder="Say something worth the room's attention."
              aria-label="Write a post"
              className="mt-4 w-full resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-muted-foreground/70"
            />
            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Visible to members only</p>
              <Button size="sm" disabled={!draft.trim()} onClick={publish}>
                Publish
              </Button>
            </div>
          </Card>

          <div className="mt-8 space-y-3">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onToggleLike={toggleLike}
                onComment={addComment}
              />
            ))}
          </div>
        </SegmentedTabsContent>

        <SegmentedTabsContent value="members">
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
        </SegmentedTabsContent>
      </SegmentedTabs>

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
