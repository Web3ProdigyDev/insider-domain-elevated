import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Set up your wallet — Insider Domain" }] }),
  component: OnboardingRedirect,
});

function OnboardingRedirect() {
  const navigate = useNavigate();
  React.useEffect(() => {
    void createClient()
      .auth.getSession()
      .then(({ data }) => {
        void navigate({ to: data.session ? "/wallet-setup" : "/auth", replace: true });
      });
  }, [navigate]);
  return (
    <main className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">
      Preparing your private setup…
    </main>
  );
}
