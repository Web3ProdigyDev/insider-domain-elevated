import { createClient } from "./supabase/client";

export type MessageContact = {
  id: string;
  name: string;
  email: string | null;
  avatar_url: string | null;
};
export type MessageRow = {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

async function currentUser() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Unauthorized");
  return { supabase, user };
}

export async function listMessageContacts() {
  const { supabase, user } = await currentUser();
  const { data, error } = await supabase
    .from("profiles")
    .select("id,first_name,surname,username,email,avatar_url")
    .neq("id", user.id)
    .order("created_at", { ascending: true })
    .limit(100);
  if (error) throw error;
  return (data ?? []).map((profile) => ({
    id: profile.id,
    name:
      [profile.first_name, profile.surname].filter(Boolean).join(" ") ||
      profile.username ||
      "Member",
    email: profile.email,
    avatar_url: profile.avatar_url,
  }));
}

export async function listMessages(contactId: string) {
  const { supabase, user } = await currentUser();
  const { data, error } = await supabase
    .from("messages")
    .select("id,sender_id,recipient_id,body,created_at,read_at")
    .or(
      `and(sender_id.eq.${user.id},recipient_id.eq.${contactId}),and(sender_id.eq.${contactId},recipient_id.eq.${user.id})`,
    )
    .order("created_at", { ascending: true })
    .limit(200);
  if (error) throw error;
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("sender_id", contactId)
    .eq("recipient_id", user.id)
    .is("read_at", null);
  return (data ?? []) as MessageRow[];
}

export async function sendMessage(recipientId: string, body: string) {
  const { supabase, user } = await currentUser();
  const clean = body.trim();
  if (!clean) throw new Error("Message cannot be empty");
  const { data, error } = await supabase
    .from("messages")
    .insert({ sender_id: user.id, recipient_id: recipientId, body: clean })
    .select("id,sender_id,recipient_id,body,created_at,read_at")
    .single();
  if (error) throw error;
  return data as MessageRow;
}
