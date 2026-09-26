import { createClient } from "./supabase/client";

async function requireAdmin() {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Unauthorized");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", auth.user.id)
    .maybeSingle();
  if (profile?.role !== "admin") throw new Error("Forbidden");
  return { supabase, user: auth.user };
}

export async function listPriceSimulations() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("price_simulations")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function savePriceSimulation(input: {
  id?: string;
  coin_id: string;
  spike_percent: number;
  range_min: number;
  range_max: number;
  capture_fraction: number;
  target_user_id?: string | null;
}) {
  const { supabase, user } = await requireAdmin();
  if (
    !input.coin_id ||
    !Number.isFinite(input.spike_percent) ||
    !Number.isFinite(input.range_min) ||
    !Number.isFinite(input.range_max) ||
    input.range_min > input.range_max ||
    input.capture_fraction < 0 ||
    input.capture_fraction > 1
  )
    throw new Error("Enter valid simulation bounds");
  const payload = {
    coin_id: input.coin_id,
    spike_percent: input.spike_percent,
    range_min: input.range_min,
    range_max: input.range_max,
    capture_fraction: input.capture_fraction,
    target_user_id: input.target_user_id || null,
    active: true,
    created_by: user.id,
  };
  const request = input.id
    ? supabase.from("price_simulations").update(payload).eq("id", input.id)
    : supabase.from("price_simulations").insert(payload);
  const { error } = await request;
  if (error) throw error;
}

export async function deactivatePriceSimulation(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("price_simulations").update({ active: false }).eq("id", id);
  if (error) throw error;
}
