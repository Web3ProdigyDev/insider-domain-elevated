import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpFromLine, Check, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CoinLogo } from "@/components/common/coin-logo";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { notify } from "@/lib/notify";
import { useMarkets } from "@/lib/use-markets";
import { holdingsQueryOptions, holdingFor, formatTokenAmount } from "@/lib/solana-assets";
import { useVaultAddress } from "@/lib/use-vault-address";
import { useSolanaNetwork } from "@/lib/solana-network";
import { useQuery } from "@tanstack/react-query";
import { recordWalletTransaction } from "@/lib/wallet.functions";
import { hasVault } from "@/lib/wallet-vault-store";
import { unlockVault } from "@/lib/wallet-vault";

export const Route = createFileRoute("/withdraw")({
  validateSearch: (search: Record<string, unknown>): { asset?: string } =>
    typeof search["asset"] === "string" && search["asset"] ? { asset: search["asset"] } : {},
  component: Withdraw,
});
function Withdraw() {
  const { asset: presetAsset } = Route.useSearch();
  const navigate = useNavigate();
  const { coins } = useMarkets();
  const [network] = useSolanaNetwork();
  const { address: vaultAddress } = useVaultAddress();
  const holdingsQuery = useQuery({
    ...holdingsQueryOptions(vaultAddress ?? "", network),
    enabled: Boolean(vaultAddress),
  });
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [assetId, setAssetId] = useState(presetAsset ?? "bitcoin");
  const [reviewing, setReviewing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [vaultExists, setVaultExists] = useState(false);
  const [vaultPassword, setVaultPassword] = useState("");
  const [vaultError, setVaultError] = useState("");
  useEffect(() => {
    void hasVault().then(setVaultExists);
  }, []);
  const asset = coins.find((coin) => coin.id === assetId) ?? coins[0];
  const available = holdingsQuery.data && asset ? holdingFor(holdingsQuery.data, asset.id) : null;
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
    setVaultError("");
    setBusy(true);
    if (vaultExists) {
      try {
        await unlockVault(vaultPassword);
      } catch {
        setVaultError("That password did not unlock this local vault. Try again.");
        setBusy(false);
        return;
      }
    }
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
              {vaultExists ? (
                <div className="mb-5">
                  <Input
                    label="Vault password"
                    type="password"
                    autoComplete="current-password"
                    value={vaultPassword}
                    onChange={(event) => {
                      setVaultPassword(event.target.value);
                      setVaultError("");
                    }}
                    placeholder="Unlock to confirm"
                  />
                  {vaultError ? <p className="mt-2 text-xs text-negative">{vaultError}</p> : null}
                  <p className="mt-2 text-xs text-muted-foreground">
                    Local decrypt only proves control of this vault; it does not broadcast to a
                    blockchain network.
                  </p>
                </div>
              ) : null}
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
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" full disabled={busy} onClick={() => setReviewing(false)}>
                Back
              </Button>
              <Button full disabled={busy || (vaultExists && !vaultPassword)} onClick={confirm}>
                {busy ? "Submitting request…" : "Submit request"} {!busy ? <Check /> : null}
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-8 flex flex-col gap-5">
            {presetAsset && asset ? (
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface-raised p-4">
                <CoinLogo src={asset.image} symbol={asset.symbol} size={36} />
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground">{asset.name}</p>
                  <p className="text-xs text-muted-foreground">{asset.symbol}</p>
                </div>
                <button
                  type="button"
                  className="ml-auto text-xs text-gold"
                  onClick={() => {
                    setAssetId("bitcoin");
                    void navigate({ to: "/withdraw", search: {} });
                  }}
                >
                  Change asset
                </button>
              </div>
            ) : null}
            {!presetAsset ? (
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
            ) : null}
            <Input
              label={`Amount (${asset?.symbol ?? "asset"})`}
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
            {available !== null ? (
              <p className="-mt-3 text-xs text-muted-foreground">
                Available: {formatTokenAmount(available)} {asset?.symbol}
              </p>
            ) : null}
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
