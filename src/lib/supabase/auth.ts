import { createClient } from "./client";

export async function sendOtp(email: string) {
  const supabase = createClient();
  return supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: { shouldCreateUser: true },
  });
}

export async function verifyOtp(email: string, token: string) {
  const supabase = createClient();
  return supabase.auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token: token.trim(),
    type: "email",
  });
}

export async function signOut() {
  return createClient().auth.signOut();
}
