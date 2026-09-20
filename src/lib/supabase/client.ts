import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient> | undefined;

function resolveConfig() {
  const url =
    import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://uivnnclvkrrupyospaax.supabase.co";
  const key =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    (typeof process !== "undefined" && process.env.VITE_SUPABASE_PUBLISHABLE_KEY) ||
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  return { url, key };
}

/** True when the publishable key is available, so callers can degrade instead of throwing. */
export function isSupabaseConfigured(): boolean {
  return Boolean(resolveConfig().key);
}

export function createClient() {
  if (!client) {
    const { url, key } = resolveConfig();
    if (!key) {
      console.warn(
        "[v0] Supabase client unavailable: publishable key is not exposed to this runtime",
      );
      throw new Error("Missing Supabase publishable key configuration.");
    }
    client = createBrowserClient(url, key);
  }
  return client;
}