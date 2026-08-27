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
    .select("id,first_name,surname,username,role,onboarding_completed,created_at")
    .order("created_at", { ascending: false });
  const term = query?.trim();
  if (term) {
    const escaped = term.replace(/[%,]/g, "").replace(/'/g, "''");
    request = request.or(
      `username.ilike.%${escaped}%,first_name.ilike.%${escaped}%,surname.ilike.%${escaped}%`,
    );
  }
  const { data, error } = await request;
  if (error) throw error;
  return data ?? [];
}

export async function getMemberDetail(userId: string) {
  const { supabase } = await requireAdmin();
  const [profile, balances, transactions] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,first_name,surname,username,role,onboarding_completed,dob,created_at,updated_at")
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
  ]);
  if (profile.error) throw profile.error;
  if (balances.error) throw balances.error;
  if (transactions.error) throw transactions.error;
  if (!profile.data) throw new Error("Member not found");
  return {
    profile: profile.data,
    balances: balances.data ?? [],
    transactions: transactions.data ?? [],
  };
}
