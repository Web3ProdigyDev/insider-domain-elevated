import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Copy, Gift, QrCode } from "lucide-react";
import QRCode from "qrcode";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AppShell } from "@/components/layout/app-shell";
import { useRequireMember } from "@/lib/use-auth";
import { createClient } from "@/lib/supabase/client";
import { notify } from "@/lib/notify";

export const Route = createFileRoute("/invites")({ component: InvitesPage });

function InvitesPage() {
  const navigate = useNavigate();
  const { ready } = useRequireMember({ allowIncomplete: true });
  const [code, setCode] = React.useState("");
  const [redeemCode, setRedeemCode] = React.useState("");
  const [qr, setQr] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState("");

  const createInvite = async () => {
    setBusy(true);
    setMessage("");
    try {
      const { data, error } = await createClient().rpc("create_member_invite");
      if (error || !data) throw error ?? new Error("No invite code returned.");
      setCode(data);
      const url = `${window.location.origin}/onboarding?invite=${encodeURIComponent(data)}`;
      setQr(await QRCode.toDataURL(url, { margin: 1, width: 240 }));
      setMessage("Invite ready to share.");
    } catch (error) {
      console.error("[v0] invite creation failed", error);
      setMessage("We could not create an invite right now.");
    } finally {
      setBusy(false);
    }
  };

  const redeemInvite = async () => {
    setBusy(true);
    setMessage("");
    try {
      const { data, error } = await createClient().rpc("redeem_member_invite", {
        invite_code: redeemCode.trim(),
      });
      if (error) throw error;
      setMessage(data ? "Invite redeemed." : "That invite is unavailable.");
      if (data) setRedeemCode("");
    } catch (error) {
      console.error("[v0] invite redemption failed", error);
      setMessage("We could not redeem that invite.");
    } finally {
      setBusy(false);
    }
  };

  if (!ready) return null;
  return (
    <AppShell eyebrow="Member network" title="Invite someone you trust">
      <div className="space-y-4">
        <Card className="space-y-4 p-5">
          <div className="flex items-center gap-3">
            <Gift className="size-5 text-gold" />
            <div>
              <p className="font-medium">Create an invite</p>
              <p className="text-sm text-muted-foreground">Generate a one-time member code.</p>
            </div>
          </div>
          <Button onClick={() => void createInvite()} disabled={busy}>
            Create invite
          </Button>
          {code && (
            <div className="space-y-3">
              <Input readOnly value={code} />
              <Button variant="outline" onClick={() => void navigator.clipboard.writeText(code)}>
                <Copy className="size-4" />
                Copy code
              </Button>
              {qr && (
                <img
                  src={qr}
                  alt="QR code for member invite"
                  className="mx-auto size-48 rounded-lg"
                />
              )}
            </div>
          )}
        </Card>
        <Card className="space-y-4 p-5">
          <div className="flex items-center gap-3">
            <QrCode className="size-5 text-gold" />
            <div>
              <p className="font-medium">Redeem an invite</p>
              <p className="text-sm text-muted-foreground">Enter a code shared with you.</p>
            </div>
          </div>
          <Input
            value={redeemCode}
            onChange={(event) => setRedeemCode(event.target.value)}
            placeholder="MEMBER-001"
          />
          <Button
            variant="outline"
            onClick={() => void redeemInvite()}
            disabled={busy || !redeemCode.trim()}
          >
            Redeem code
          </Button>
        </Card>
        {message && <p className="text-center text-sm text-muted-foreground">{message}</p>}
        <button
          type="button"
          className="block w-full text-center text-sm text-muted-foreground hover:text-foreground"
          onClick={() => void navigate({ to: "/" })}
        >
          Back to overview
        </button>
      </div>
    </AppShell>
  );
}
