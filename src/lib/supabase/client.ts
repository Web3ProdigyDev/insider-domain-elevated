import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
  if (!client) {
    const url = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url) throw new Error("Missing Supabase URL configuration.");
    if (!key) throw new Error("Missing Supabase publishable key configuration.");
    client = createBrowserClient(url, key);
  }
  return client;
}
