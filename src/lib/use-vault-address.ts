import * as React from "react";
import { hasVault, loadVault } from "./wallet-vault";

/** Public address of the local wallet vault, or null when none is set up. */
export function useVaultAddress() {
    const [address, setAddress] = React.useState<string | null>(null);
    const [checked, setChecked] = React.useState(false);

    React.useEffect(() => {
        let active = true;
        void (async () => {
            try {
                const exists = await hasVault();
                const next = exists ? ((await loadVault())?.address ?? null) : null;
                if (active) setAddress(next);
            } catch (error: unknown) {
                console.error("[v0] vault address lookup failed", error);
            } finally {
                if (active) setChecked(true);
            }
        })();
        return () => {
            active = false;
        };
    }, []);

    return { address, checked };
}