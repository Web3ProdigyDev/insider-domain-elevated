import { createClient } from "./supabase/client";

async function requireAdmin() {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Unauthorized");
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", auth.user.id)
    .maybeSingle();
  if (error || profile?.role !== "admin") throw new Error("Forbidden");
  return { supabase, user: auth.user };
}

export async function listMembers(query?: string) {
  const { supabase } = await requireAdmin();
  let request = supabase
    .from("profiles")
    .select(
      "id,email,first_name,surname,username,avatar_url,role,suspended,onboarding_completed,created_at",
    )
    .order("created_at", { ascending: false });
  const term = query?.trim();
  if (term)
    request = request.or(
      `username.ilike.%${term.replace(/[%,]/g, "")}%,first_name.ilike.%${term.replace(/[%,]/g, "")}%,surname.ilike.%${term.replace(/[%,]/g, "")}%,email.ilike.%${term.replace(/[%,]/g, "")}%`,
    );
  const { data, error } = await request;
  if (!error) return data ?? [];
  // Keep member search usable while an older Supabase schema is being migrated.
  if (error.message.includes("avatar_url")) {
    let fallbackRequest = supabase
      .from("profiles")
      .select("id,email,first_name,surname,username,role,suspended,onboarding_completed,created_at")
      .order("created_at", { ascending: false });
    if (term) {
      const safeTerm = term.replace(/[%,]/g, "");
      fallbackRequest = fallbackRequest.or(
        `username.ilike.%${safeTerm}%,first_name.ilike.%${safeTerm}%,surname.ilike.%${safeTerm}%,email.ilike.%${safeTerm}%`,
      );
    }
    const { data: fallbackData, error: fallbackError } = await fallbackRequest;
    if (fallbackError) throw fallbackError;
    return (fallbackData ?? []).map((member) => ({ ...member, avatar_url: null }));
  }
  throw error;
}

export async function listInviteCodes() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("invite_codes")
    .select("id,code,role,max_uses,uses,expires_at,created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createInviteCode(input: {
  code: string;
  role: "member" | "admin";
  maxUses: number;
  expiresAt?: string;
}) {
  const { supabase, user } = await requireAdmin();
  const { data, error } = await supabase
    .from("invite_codes")
    .insert({
      code: input.code,
      role: input.role,
      max_uses: input.maxUses,
      expires_at: input.expiresAt || null,
      created_by: user.id,
    })
    .select("id,code,role,max_uses,uses,expires_at,created_at")
    .single();
  if (error) throw error;
  return data;
}

export async function updateMemberRole(userId: string, role: "member" | "admin") {
  const { supabase, user } = await requireAdmin();
  if (userId === user.id) throw new Error("Admins cannot change their own role");
  const { error } = await supabase
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) throw error;
  await supabase.from("admin_actions").insert({
    admin_id: user.id,
    target_user_id: userId,
    action: "role_changed",
    detail: { role },
  });
}

export async function setMemberSuspended(userId: string, suspended: boolean) {
  const { supabase, user } = await requireAdmin();
  if (userId === user.id) throw new Error("Admins cannot suspend themselves");
  const { error } = await supabase
    .from("profiles")
    .update({ suspended, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) throw error;
  await supabase.from("admin_actions").insert({
    admin_id: user.id,
    target_user_id: userId,
    action: suspended ? "member_suspended" : "member_reinstated",
    detail: { suspended },
  });
}

export async function adjustMemberBalance(
  userId: string,
  assetId: string,
  delta: number,
  reason: string,
) {
  const { supabase, user } = await requireAdmin();
  if (!Number.isFinite(delta) || delta === 0 || !reason.trim())
    throw new Error("A non-zero amount and reason are required");
  const { data: current, error: readError } = await supabase
    .from("wallet_balances")
    .select("amount")
    .eq("user_id", userId)
    .eq("asset_id", assetId)
    .maybeSingle();
  if (readError) throw readError;
  const amount = Number(current?.amount ?? 0) + delta;
  if (amount < 0) throw new Error("Balance cannot become negative");
  const { error: balanceError } = await supabase
    .from("wallet_balances")
    .upsert(
      { user_id: userId, asset_id: assetId, amount, updated_at: new Date().toISOString() },
      { onConflict: "user_id,asset_id" },
    );
  if (balanceError) throw balanceError;
  const { error: transactionError } = await supabase.from("transactions").insert({
    id: crypto.randomUUID(),
    user_id: userId,
    type: "admin_adjustment",
    asset_id: assetId,
    amount: delta,
    status: "completed",
    metadata: { reason: reason.trim(), admin_id: user.id },
  });
  if (transactionError) throw transactionError;
  await supabase.from("admin_actions").insert({
    admin_id: user.id,
    target_user_id: userId,
    action: "balance_adjusted",
    detail: { asset_id: assetId, delta, reason: reason.trim() },
  });
  return { amount };
}

export async function revokeInviteCode(id: string) {
  const { supabase, user } = await requireAdmin();
  const { error } = await supabase.from("invite_codes").update({ max_uses: 0 }).eq("id", id);
  if (error) throw error;
  await supabase
    .from("admin_actions")
    .insert({ admin_id: user.id, action: "invite_revoked", detail: { invite_id: id } });
}

export async function getMemberDetail(userId: string) {
  const { supabase } = await requireAdmin();
  const [profile, balances, transactions, spikes] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id,email,first_name,surname,username,avatar_url,role,suspended,onboarding_completed,dob,created_at,updated_at",
      )
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("wallet_balances")
      .select("id,user_id,asset_id,amount,created_at,updated_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("transactions")
      .select("id,user_id,type,asset_id,amount,status,metadata,created_at,updated_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("member_price_spikes")
      .select("id,user_id,coin_id,spike_percent,active,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  ]);
  if (profile.error) throw profile.error;
  if (balances.error) throw balances.error;
  if (transactions.error) throw transactions.error;
  if (spikes.error) throw spikes.error;
  if (!profile.data) throw new Error("Member not found");
  return {
    profile: profile.data,
    balances: balances.data ?? [],
    transactions: transactions.data ?? [],
    spikes: spikes.data ?? [],
  };
}

async function notifyMember(userId: string, title: string, body: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("notifications")
    .insert({ user_id: userId, title, body, message: body });
  if (error) throw error;
}

export async function createMemberSpike(userId: string, coinId: string, spikePercent: number) {
  const { supabase, user } = await requireAdmin();
  if (!coinId.trim() || !Number.isFinite(spikePercent) || spikePercent <= 0)
    throw new Error("Choose a coin and positive spike percentage");
  const { data, error } = await supabase
    .from("member_price_spikes")
    .insert({
      user_id: userId,
      coin_id: coinId.trim(),
      spike_percent: spikePercent,
      created_by: user.id,
    })
    .select()
    .single();
  if (error) throw error;
  await notifyMember(
    userId,
    "A market spike was applied",
    `${coinId.toUpperCase()} received a ${spikePercent}% simulated spike in your portfolio.`,
  );
  return data;
}

export async function deactivateMemberSpike(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("member_price_spikes")
    .update({ active: false })
    .eq("id", id);
  if (error) throw error;
}

export async function awardBotReturns(userId: string, amount: number, reason: string) {
  const { supabase, user } = await requireAdmin();
  if (!Number.isFinite(amount) || amount <= 0 || !reason.trim())
    throw new Error("Enter a positive return and reason");
  const { data: current, error: readError } = await supabase
    .from("wallet_balances")
    .select("amount")
    .eq("user_id", userId)
    .eq("asset_id", "usd")
    .maybeSingle();
  if (readError) throw readError;
  const next = Number(current?.amount ?? 0) + amount;
  const { error } = await supabase
    .from("wallet_balances")
    .upsert(
      { user_id: userId, asset_id: "usd", amount: next, updated_at: new Date().toISOString() },
      { onConflict: "user_id,asset_id" },
    );
  if (error) throw error;
  const { error: transactionError } = await supabase.from("transactions").insert({
    id: crypto.randomUUID(),
    user_id: userId,
    type: "bot_return",
    asset_id: "usd",
    amount,
    status: "completed",
    metadata: { reason: reason.trim(), admin_id: user.id },
  });
  if (transactionError) throw transactionError;
  await notifyMember(
    userId,
    "Your bot returns are ready",
    `$${amount.toLocaleString()} in simulated bot earnings was added to your wallet.`,
  );
}
