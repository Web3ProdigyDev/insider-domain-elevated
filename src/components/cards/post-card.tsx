import { useState } from "react";
import { Heart, MessageCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { FeedPost } from "@/lib/feed-data";

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export function PostCard({
  post,
  onToggleLike,
  onComment,
  className,
}: {
  post: FeedPost;
  onToggleLike: (id: string) => void;
  onComment: (id: string, body: string) => void;
  className?: string | undefined;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  const submit = () => {
    const body = draft.trim();
    if (!body) return;
    onComment(post.id, body);
    setDraft("");
  };

  return (
    <article className={cn("rounded-2xl border border-border bg-card px-5 py-5", className)}>
      <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-full border border-border text-xs tracking-tight text-muted-foreground">
          {initials(post.author)}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm text-foreground">{post.author}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {post.handle} · {post.date}
          </span>
        </span>
        <Badge variant={post.tier === "Founding" ? "gold" : "default"}>{post.tier}</Badge>
      </header>

      <p className="mt-4 text-sm leading-relaxed text-foreground/90">{post.body}</p>

      <footer className="mt-5 flex items-center gap-5 border-t border-border pt-4">
        <button
          type="button"
          onClick={() => onToggleLike(post.id)}
          aria-pressed={post.liked}
          className={cn(
            "inline-flex items-center gap-2 text-xs transition-colors duration-300 ease-[var(--ease-luxe)]",
            post.liked ? "text-gold" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Heart className={cn("size-4", post.liked && "fill-current")} strokeWidth={1.75} />
          <span className="numeric">{post.likes}</span>
        </button>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <MessageCircle className="size-4" strokeWidth={1.75} />
          <span className="numeric">{post.comments.length}</span>
        </button>
      </footer>

      {open ? (
        <div className="mt-4 space-y-4">
          {post.comments.map((comment) => (
            <div key={comment.id} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full border border-border text-[0.625rem] text-muted-foreground">
                {initials(comment.author)}
              </span>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  {comment.author} · {comment.date}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-foreground/90">{comment.body}</p>
              </div>
            </div>
          ))}

          <div className="flex items-center gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
              placeholder="Add a considered reply"
              aria-label="Add a comment"
              className="h-10 w-full min-w-0 rounded-full border border-border bg-surface px-4 text-sm outline-none transition-colors duration-300 ease-[var(--ease-luxe)] placeholder:text-muted-foreground/70 focus:border-border-strong"
            />
            <button
              type="button"
              onClick={submit}
              disabled={!draft.trim()}
              className="shrink-0 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
            >
              Post
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
