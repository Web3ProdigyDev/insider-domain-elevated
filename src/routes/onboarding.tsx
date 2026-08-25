import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSession } from "@/lib/auth-client";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Set up your wallet — Insider Domain" }] }),
  component: OnboardingRedirect,
});

function OnboardingRedirect() {
  const navigate = useNavigate();
  const { data: session, isPending } = useSession();
  React.useEffect(() => {
    if (!isPending) void navigate({ to: session?.user ? "/wallet-setup" : "/auth", replace: true });
  }, [isPending, navigate, session?.user]);
  return (
    <main className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">
      Preparing your private setup…
    </main>
  );
}
