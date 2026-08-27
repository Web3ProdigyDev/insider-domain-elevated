import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient> | undefined;

function cleanEnv(value: string | undefined) {
  if (!value) return "";
  return value.replace(/^[A-Z0-9_]+=/, "").trim();
}

export function createClient() {
  if (!client) {
    const runtimeEnv = typeof process !== "undefined" ? process.env : undefined;
    const url = cleanEnv(
      import.meta.env.VITE_SUPABASE_URL ||
        import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
        import.meta.env.SUPABASE_URL ||
        runtimeEnv?.VITE_SUPABASE_URL ||
        runtimeEnv?.NEXT_PUBLIC_SUPABASE_URL ||
        runtimeEnv?.SUPABASE_URL,
    );
    const key = cleanEnv(
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
        import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        import.meta.env.SUPABASE_PUBLISHABLE_KEY ||
        import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        runtimeEnv?.VITE_SUPABASE_PUBLISHABLE_KEY ||
        runtimeEnv?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        runtimeEnv?.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        runtimeEnv?.SUPABASE_PUBLISHABLE_KEY ||
        runtimeEnv?.SUPABASE_ANON_KEY,
    );
    if (!url || !key) throw new Error("Supabase client configuration is unavailable.");
    client = createBrowserClient(url, key);
  }
  return client;
}
