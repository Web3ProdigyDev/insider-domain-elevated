import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
  if (!client) {
    const url =
      import.meta.env.VITE_SUPABASE_URL ||
      import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
      "https://uivnnclvkrrupyospaax.supabase.co";
    const key =
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!key) throw new Error("Missing Supabase publishable key configuration.");
    client = createBrowserClient(url, key);
  }
  return client;
}
