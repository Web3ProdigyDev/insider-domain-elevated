import { createClient } from "./client";

export async function signUpWithPassword(input: { email: string; password: string; name: string }) {
  const supabase = createClient();
  return supabase.auth.signUp({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    options: {
      data: { full_name: input.name.trim() },
      emailRedirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
        `${window.location.origin}/auth/callback`,
    },
  });
}

export async function signInWithPassword(email: string, password: string) {
  return createClient().auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
}

export async function resendConfirmation(email: string) {
  return createClient().auth.resend({
    type: "signup",
    email: email.trim().toLowerCase(),
    options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
  });
}

export async function sendOtp(email: string) {
  const supabase = createClient();
  return supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: { shouldCreateUser: false },
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
