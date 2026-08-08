// Simulated wallet holdings, keyed by CoinGecko id so every price shown in the
// product comes from the live tape rather than a hardcoded number.

export type Holding = {
  /** CoinGecko id */
  id: string;
  symbol: string;
  name: string;
  amount: number;
  /** Simulated on-chain receive address */
  address: string;
  network: string;
};

export const holdings: Holding[] = [
  {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    amount: 12.4,
    address: "bc1q7x4m2v0hs3d9pk2r6ue8lqz5ynv3g4t0waq8zk",
    network: "Bitcoin",
  },
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    amount: 84.2,
    address: "0x8Ae3F1c204Bd77E9b52a1f0C7D3a6E5B419c8D22",
    network: "Ethereum",
  },
  {
    id: "solana",
    symbol: "SOL",
    name: "Solana",
    amount: 540,
    address: "7QxV2mJp9dNc4WgYt1sKuA3RbZfE6HnLqXv8TdPmC5Ry",
    network: "Solana",
  },
  {
    id: "chainlink",
    symbol: "LINK",
    name: "Chainlink",
    amount: 3200,
    address: "0x41B9d7C0aE52fD8613c9A7E0b4d5F26aC831e70F",
    network: "Ethereum",
  },
  {
    id: "usd-coin",
    symbol: "USDC",
    name: "USD Coin",
    amount: 178484.9,
    address: "0x8Ae3F1c204Bd77E9b52a1f0C7D3a6E5B419c8D22",
    network: "Ethereum",
  },
  {
    id: "ripple",
    symbol: "XRP",
    name: "XRP",
    amount: 24000,
    address: "rP9jK2sVn4XqLb7HcTdM6EuZgY3wFa8QRs",
    network: "XRP Ledger",
  },
];

export const shortAddress = (address: string) =>
  `${address.slice(0, 6)}…${address.slice(-4)}`;
