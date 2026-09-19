import { rpcUrl, type SolanaNetwork } from "./solana-network";

const TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
const TOKEN_2022_PROGRAM_ID = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";

export type KnownToken = {
  symbol: string;
  name: string;
  /** CoinGecko id, used to borrow price and logo from the market feed. */
  coingeckoId?: string;
};

/** Tokens we can name without a metadata lookup. Anything else is shown by
 * its mint address. */
const KNOWN_TOKENS: Record<SolanaNetwork, Record<string, KnownToken>> = {
  mainnet: {
    So11111111111111111111111111111111111111112: {
      symbol: "wSOL",
      name: "Wrapped SOL",
      coingeckoId: "solana",
    },
    EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: {
      symbol: "USDC",
      name: "USD Coin",
      coingeckoId: "usd-coin",
    },
    Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: {
      symbol: "USDT",
      name: "Tether",
      coingeckoId: "tether",
    },
    JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN: {
      symbol: "JUP",
      name: "Jupiter",
      coingeckoId: "jupiter-exchange-solana",
    },
    DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263: {
      symbol: "BONK",
      name: "Bonk",
      coingeckoId: "bonk",
    },
    mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So: {
      symbol: "mSOL",
      name: "Marinade Staked SOL",
      coingeckoId: "msol",
    },
    J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn: {
      symbol: "JitoSOL",
      name: "Jito Staked SOL",
      coingeckoId: "jito-staked-sol",
    },
    "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R": {
      symbol: "RAY",
      name: "Raydium",
      coingeckoId: "raydium",
    },
    EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm: {
      symbol: "WIF",
      name: "dogwifhat",
      coingeckoId: "dogwifcoin",
    },
    HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3: {
      symbol: "PYTH",
      name: "Pyth Network",
      coingeckoId: "pyth-network",
    },
  },
  // Devnet tokens are test assets with no market value, so no price ids.
  devnet: {
    So11111111111111111111111111111111111111112: { symbol: "wSOL", name: "Wrapped SOL" },
    "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU": { symbol: "USDC", name: "USD Coin (devnet)" },
  },
};

export type TokenHolding = {
  mint: string;
  amount: number;
  decimals: number;
  known: KnownToken | undefined;
};

export type SolanaHoldings = {
  sol: number;
  tokens: TokenHolding[];
};

export async function fetchSolanaHoldings(
  address: string,
  network: SolanaNetwork,
): Promise<SolanaHoldings> {
  const { Connection, PublicKey } = await import("@solana/web3.js");
  const connection = new Connection(rpcUrl(network), "confirmed");
  const owner = new PublicKey(address);

  const accountsFor = async (programId: string) =>
    (await connection.getParsedTokenAccountsByOwner(owner, { programId: new PublicKey(programId) }))
      .value;

  const [lamports, legacy, extended] = await Promise.all([
    connection.getBalance(owner),
    accountsFor(TOKEN_PROGRAM_ID),
    // Token-2022 lookups are optional; some RPC providers reject them.
    accountsFor(TOKEN_2022_PROGRAM_ID).catch(() => []),
  ]);

  const byMint = new Map<string, { amount: number; decimals: number }>();
  for (const { account } of [...legacy, ...extended]) {
    const data = account.data;
    if (!("parsed" in data)) continue;
    const info = data.parsed?.info;
    const mint: unknown = info?.mint;
    const tokenAmount = info?.tokenAmount;
    const amount = Number(tokenAmount?.uiAmountString ?? tokenAmount?.uiAmount ?? 0);
    if (typeof mint !== "string" || !Number.isFinite(amount) || amount <= 0) continue;
    const previous = byMint.get(mint);
    byMint.set(mint, {
      amount: (previous?.amount ?? 0) + amount,
      decimals: Number(tokenAmount?.decimals ?? 0),
    });
  }

  const registry = KNOWN_TOKENS[network];
  const tokens: TokenHolding[] = [...byMint.entries()]
    .map(([mint, value]) => ({ mint, ...value, known: registry[mint] }))
    .sort((a, b) => {
      if (Boolean(a.known) !== Boolean(b.known)) return a.known ? -1 : 1;
      return b.amount - a.amount;
    });

  return { sol: lamports / 1_000_000_000, tokens };
}
