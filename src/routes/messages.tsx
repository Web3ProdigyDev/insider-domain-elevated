import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Send } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSim } from "@/lib/use-sim";
import { markThreadRead, sendMessage } from "@/lib/sim-store";

export const Route = createFileRoute("/messages")({ component: Messages });
function Messages() {
  const { threads } = useSim();
  const [selected, setSelected] = useState(threads[0]?.id ?? "");
  const [draft, setDraft] = useState("");
  const thread = threads.find((item) => item.id === selected) ?? threads[0];
  return (
    <AppShell eyebrow="Private correspondence" title="Messages">
      <div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <Card padding="sm">
          <div className="flex items-center gap-2 px-3 py-3">
            <MessageCircle className="size-4 text-gold" />
            <p className="text-sm text-foreground">Inbox</p>
          </div>
          <div className="flex flex-col gap-1">
            {threads.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelected(item.id);
                  markThreadRead(item.id);
                }}
                className={`rounded-xl px-3 py-3 text-left ${item.id === thread?.id ? "bg-surface-raised" : "hover:bg-surface-raised/60"}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-foreground">{item.name}</span>
                  {item.online && <span className="size-1.5 rounded-full bg-positive" />}
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {item.messages.at(-1)?.body ?? "Start a conversation"}
                </p>
              </button>
            ))}
          </div>
        </Card>
        <Card padding="lg" className="flex min-h-[28rem] flex-col">
          {thread ? (
            <>
              <div className="border-b border-border pb-4">
                <p className="text-sm text-foreground">{thread.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {thread.online ? "Online now" : "Away"}
                </p>
              </div>
              <div className="flex flex-1 flex-col justify-end gap-3 py-5">
                {thread.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${message.from === "a.marchetti" ? "ml-auto bg-gold-muted text-foreground" : "bg-surface-raised text-foreground"}`}
                  >
                    <p>{message.body}</p>
                  </div>
                ))}
              </div>
              <form
                className="flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!draft.trim()) return;
                  sendMessage(thread.id, draft);
                  setDraft("");
                }}
              >
                <Input
                  aria-label="Message"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Write a message"
                />
                <Button type="submit" size="icon" aria-label="Send message">
                  <Send />
                </Button>
              </form>
            </>
          ) : (
            <div className="m-auto text-center text-sm text-muted-foreground">
              No conversations yet.
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
