import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpFromLine } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { notify } from "@/lib/notify";

export const Route = createFileRoute("/withdraw")({ component: Withdraw });
function Withdraw() {
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  return (
    <AppShell eyebrow="Funding" title="Withdraw">
      <Link
        to="/wallet"
        className="mb-6 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Wallet
      </Link>
      <Card variant="raised" padding="lg">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-gold-muted text-gold">
            <ArrowUpFromLine className="size-5" />
          </span>
          <div>
            <p className="text-sm text-foreground">Withdraw simulated funds</p>
            <p className="text-xs text-muted-foreground">
              Choose an amount and destination for the demo.
            </p>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-5">
          <Input label="Asset" value="Bitcoin (BTC)" readOnly />
          <Input
            label="Amount (BTC)"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
          <Input
            label="Destination address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Paste demo address"
          />
          <Button
            full
            onClick={() => {
              if (!(Number(amount) > 0))
                return notify.error("Enter an amount", "Withdrawals need a positive amount.");
              if (address.length < 8)
                return notify.error(
                  "Add a destination",
                  "Use at least 8 characters for this demo.",
                );
              notify.success("Withdrawal queued", "The simulated withdrawal is now under review.");
              setAmount("");
              setAddress("");
            }}
          >
            Review withdrawal
          </Button>
        </div>
      </Card>
    </AppShell>
  );
}
