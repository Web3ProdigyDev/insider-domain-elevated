import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpFromLine, Check, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CoinLogo } from "@/components/common/coin-logo";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { notify } from "@/lib/notify";
import { useMarkets } from "@/lib/use-markets";
import { recordWalletTransaction } from "@/lib/wallet.functions";

export const Route = createFileRoute("/withdraw")({ component: Withdraw });
function Withdraw() {
  const { coins } = useMarkets();
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [assetId, setAssetId] = useState("bitcoin");
  const [reviewing, setReviewing] = useState(false);
  const [busy, setBusy] = useState(false);
  const asset = coins.find((coin) => coin.id === assetId) ?? coins[0];
  const validate = () => {
    if (!(Number(amount) > 0)) {
      notify.error("Enter an amount", "Withdrawals need a positive amount.");
      return false;
    }
    if (address.trim().length < 8) {
      notify.error("Add a destination", "Enter a valid destination address.");
      return false;
    }
    return true;
  };
  const confirm = async () => {
    if (!validate()) return;
    setBusy(true);
    try {
      await recordWalletTransaction({
        type: "withdrawal",
        assetId: asset?.id ?? assetId,
        amount,
        metadata: { destination: address.trim() },
      });
      notify.success("Withdrawal queued", "Your withdrawal is under review.");
      setAmount("");
      setAddress("");
      setReviewing(false);
    } catch {
      notify.error("Withdrawal unavailable", "Could not save this withdrawal.");
    } finally {
      setBusy(false);
    }
  };
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
            <p className="text-sm text-foreground">Withdraw funds</p>
            <p className="text-xs text-muted-foreground">
              Enter an amount and verified destination for review.
            </p>
          </div>
        </div>
        {reviewing ? (
          <div className="mt-8 flex flex-col gap-5">
            <div className="rounded-2xl border border-border bg-surface-raised p-5">
              <p className="text-eyebrow">Review withdrawal</p>
              <div className="mt-4 flex items-center gap-3">
                <CoinLogo src={asset?.image} symbol={asset?.symbol ?? "—"} size={36} />
                <div>
                  <p className="text-sm text-foreground">
                    {amount} {asset?.symbol}
                  </p>
                  <p className="text-xs text-muted-foreground">{address}</p>
                </div>
              </div>
              <p className="mt-5 text-sm text-negative">This can&apos;t be undone.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" full disabled={busy} onClick={() => setReviewing(false)}>
                Back
              </Button>
              <Button full disabled={busy} onClick={confirm}>
                {busy ? "Sending withdrawal…" : "Confirm withdrawal"} {!busy ? <Check /> : null}
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <span className="text-sm text-foreground">Asset</span>
              <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
                {coins.map((coin) => (
                  <button
                    key={coin.id}
                    type="button"
                    onClick={() => setAssetId(coin.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border px-4 py-3 text-left",
                      asset?.id === coin.id
                        ? "border-gold/40 bg-surface-raised"
                        : "border-border bg-card hover:border-border-strong",
                    )}
                  >
                    <CoinLogo src={coin.image} symbol={coin.symbol} size={28} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-foreground">{coin.name}</span>
                      <span className="text-xs text-muted-foreground">{coin.symbol}</span>
                    </span>
                    <ChevronRight className="ml-auto size-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
            <Input
              label={`Amount (${asset?.symbol ?? "asset"})`}
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
            <Input
              label="Destination address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Paste destination address"
            />
            <Button
              full
              onClick={() => {
                if (validate()) setReviewing(true);
              }}
            >
              Review withdrawal
            </Button>
          </div>
        )}
      </Card>
    </AppShell>
  );
}
