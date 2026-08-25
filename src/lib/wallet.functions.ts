import { createClient } from "./supabase/client";

export async function getWalletData() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const [balances, activity] = await Promise.all([
    supabase.from("wallet_balances").select("*").eq("user_id", user.id),
    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(25),
  ]);
  if (balances.error) throw balances.error;
  if (activity.error) throw activity.error;
  return { balances: balances.data ?? [], activity: activity.data ?? [] };
}

export async function recordWalletTransaction(input: {
  type: string;
  assetId: string;
  amount: string;
  metadata?: Record<string, unknown>;
}) {
  if (
    !["buy", "sell", "deposit", "withdrawal"].includes(input.type) ||
    !input.assetId.trim() ||
    !/^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(input.amount) ||
    Number(input.amount) <= 0
  )
    throw new Error("Invalid transaction");
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data, error } = await supabase
    .from("transactions")
    .insert({
      id: crypto.randomUUID(),
      user_id: user.id,
      type: input.type,
      asset_id: input.assetId.trim(),
      amount: input.amount,
      metadata: input.metadata ?? {},
      status: "pending",
    })
    .select("id")
    .single();
  if (error) throw error;
  return data;
}
