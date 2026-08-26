import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CoinLogo } from "@/components/common/coin-logo";
import { formatPrice } from "@/components/cards/coin-card";
import { SectionHeader } from "@/components/common/section-header";
import { notify } from "@/lib/notify";
import { usePortfolio } from "@/lib/use-markets";
import { recordWalletTransaction } from "@/lib/wallet.functions";

export const Route = createFileRoute("/transfer/$assetId")({ component: TransferDetails });
function TransferDetails() {
  const { assetId } = Route.useParams();
  const { positions } = usePortfolio();
  const asset = positions.find((p) => p.id === assetId);
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [destination, setDestination] = useState("");
  const numeric = Number(amount) || 0;
  if (!asset)
    return (
      <AppShell eyebrow="Movement" title="Asset not found">
        <Button asChild>
          <Link to="/transfer">Choose another asset</Link>
        </Button>
      </AppShell>
    );
  return (
    <AppShell eyebrow="Movement / Transfer" title={`Transfer ${asset.symbol}`}>
      <Link
        to="/transfer"
        className="mb-6 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Choose another asset
      </Link>
      <Card variant="raised" padding="lg">
        <div className="flex items-center gap-3">
          <CoinLogo src={asset.image} symbol={asset.symbol} size={40} />
          <div>
            <p className="text-sm text-foreground">{asset.name}</p>
            <p className="text-xs text-muted-foreground">
              {asset.amount.toLocaleString()} {asset.symbol} available
            </p>
          </div>
        </div>
      </Card>
      <section className="mt-8">
        <SectionHeader
          title="Transfer details"
          description="Transfers are recorded for review against your account."
        />
        <Card padding="lg">
          <div className="flex flex-col gap-5">
            <Input
              label={`Amount (${asset.symbol})`}
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
            <Input
              label="Destination address"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Paste destination address"
            />
            <div className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3 text-sm">
              <span className="text-muted-foreground">Estimated value</span>
              <span className="numeric text-foreground">{formatPrice(numeric * asset.price)}</span>
            </div>
            <Button
              full
              onClick={() => {
                if (numeric <= 0 || numeric > asset.amount)
                  return notify.error(
                    "Check the amount",
                    `Available: ${asset.amount} ${asset.symbol}.`,
                  );
                if (destination.trim().length < 8)
                  return notify.error("Add a destination", "Enter a valid destination address.");
                void recordWalletTransaction({
                  type: "transfer",
                  assetId: asset.id,
                  amount: String(numeric),
                  metadata: { destination: destination.trim() },
                })
                  .then(() => {
                    notify.success(
                      "Transfer submitted",
                      `${numeric} ${asset.symbol} is pending review.`,
                    );
                    void navigate({ to: "/wallet" });
                  })
                  .catch(() =>
                    notify.error("Transfer unavailable", "Could not save this transfer."),
                  );
              }}
            >
              Review and send
            </Button>
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
