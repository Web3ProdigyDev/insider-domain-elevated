import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Send } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { EmptyState } from "@/components/common/empty-state";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { notify } from "@/lib/notify";
import { listMessageContacts, listMessages, sendMessage } from "@/lib/message.functions";

export const Route = createFileRoute("/messages")({ component: Messages });
function Messages() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = React.useState("");
  const [draft, setDraft] = React.useState("");
  const contactsQuery = useQuery({
    queryKey: ["message-contacts"],
    queryFn: listMessageContacts,
    retry: false,
  });
  const contacts = contactsQuery.data ?? [];
  const contact = contacts.find((item) => item.id === selected);
  const messagesQuery = useQuery({
    queryKey: ["messages", selected],
    queryFn: () => listMessages(selected),
    enabled: Boolean(selected),
    retry: false,
    refetchInterval: 10000,
  });
  const messages = messagesQuery.data ?? [];
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!selected || !draft.trim()) return;
    try {
      await sendMessage(selected, draft);
      setDraft("");
      await queryClient.invalidateQueries({ queryKey: ["messages", selected] });
    } catch (error) {
      notify.error("Message failed", error instanceof Error ? error.message : "Please try again.");
    }
  }
  return (
    <AppShell
      eyebrow="Private correspondence"
      title="Messages"
      description="Send direct messages to members from one reliable, server-backed inbox."
    >
      <div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <Card padding="sm">
          <div className="flex items-center gap-2 px-3 py-3">
            <MessageCircle className="size-4 text-gold" />
            <p className="text-sm text-foreground">Members</p>
          </div>
          <div className="flex max-h-[28rem] flex-col gap-1 overflow-y-auto">
            {contacts.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelected(item.id)}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left ${item.id === selected ? "bg-surface-raised" : "hover:bg-surface-raised/60"}`}
              >
                <Avatar className="size-9">
                  <AvatarImage src={item.avatar_url ?? undefined} alt="" />
                  <AvatarFallback>{item.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="min-w-0">
                  <span className="block truncate text-sm text-foreground">{item.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {item.email ?? "Member"}
                  </span>
                </span>
              </button>
            ))}
          </div>
          {!contacts.length && !contactsQuery.isLoading ? (
            <EmptyState
              title="No members available"
              description="Members will appear here when they join."
            />
          ) : null}
        </Card>
        <Card padding="lg" className="flex min-h-[28rem] flex-col">
          {contact ? (
            <>
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <Avatar className="size-10">
                  <AvatarImage src={contact.avatar_url ?? undefined} alt="" />
                  <AvatarFallback>{contact.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-foreground">{contact.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{contact.email ?? "Member"}</p>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-3 overflow-y-auto py-5">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${message.sender_id === contact.id ? "bg-surface-raised" : "ml-auto bg-gold-muted text-foreground"}`}
                  >
                    <p>{message.body}</p>
                  </div>
                ))}
                {!messages.length && !messagesQuery.isLoading ? (
                  <EmptyState
                    icon={<MessageCircle />}
                    title="Start the conversation"
                    description={`Send a message to ${contact.name}.`}
                    className="m-auto border-none py-0"
                  />
                ) : null}
              </div>
              <form className="flex gap-2 border-t border-border pt-4" onSubmit={submit}>
                <Input
                  aria-label="Message"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={`Message ${contact.name}`}
                />
                <Button
                  type="submit"
                  size="icon"
                  aria-label="Send message"
                  disabled={!draft.trim()}
                >
                  <Send />
                </Button>
              </form>
            </>
          ) : (
            <EmptyState
              icon={<MessageCircle />}
              title="Choose a member"
              description="Select a member to view the conversation and send a message."
              className="m-auto border-none py-0"
            />
          )}
        </Card>
      </div>
    </AppShell>
  );
}
