import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
  if (!client) {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!url) throw new Error("Missing VITE_SUPABASE_URL.");
    if (!key) throw new Error("Missing VITE_SUPABASE_PUBLISHABLE_KEY.");
    client = createBrowserClient(url, key);
  }
  return client;
}
