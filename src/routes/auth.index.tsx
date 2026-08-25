import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { AuthShell } from "@/components/layout/auth-shell";
import { Card } from "@/components/ui/card";
import { OtpForm } from "@/components/auth/otp-form";
import { notify } from "@/lib/notify";

export const Route = createFileRoute("/auth/")({
  head: () => ({
    meta: [
      { title: "Entrance — Insider Domain" },
      {
        name: "description",
        content: "Sign in to your private Insider Domain membership.",
      },
      { property: "og:title", content: "Entrance — Insider Domain" },
      {
        property: "og:description",
        content: "Sign in to your private Insider Domain membership.",
      },
    ],
  }),
  component: SignIn,
});

function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const onSuccess = () => {
    notify.success("Welcome back", "Your secure session is active.");
    void navigate({ to: "/" });
  };

  return (
    <AuthShell
      eyebrow="Members only"
      title="Enter Insider Domain"
      description="Access is by invitation. Sign in with the credentials tied to your membership."
      footer={
        <>
          Hold an invitation?{" "}
          <Link to="/auth/signup" className="text-gold underline-offset-4 hover:underline">
            Create your membership
          </Link>
        </>
      }
    >
      <Card padding="lg">
        <OtpForm mode="sign-in" email={email} onEmailChange={setEmail} onSuccess={onSuccess} />
      </Card>
    </AuthShell>
  );
}
