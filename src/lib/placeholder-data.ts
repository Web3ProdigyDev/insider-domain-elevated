// Placeholder data only — no business logic. One demo identity, one balance.

export type Asset = {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  holdings: number;
  value: number;
};

export type Transaction = {
  id: string;
  type: "buy" | "sell" | "deposit" | "withdrawal";
  asset: string;
  amount: number;
  value: number;
  date: string;
  status: "settled" | "pending" | "failed";
};

export type Notification = {
  id: string;
  title: string;
  body: string;
  date: string;
  unread: boolean;
  kind: "insight" | "system" | "invitation";
};

export type Member = {
  id: string;
  name: string;
  handle: string;
  tier: "Founding" | "Private" | "Invited";
  since: string;
};

export const demoMember = {
  name: "A. Marchetti",
  handle: "@marchetti",
  tier: "Founding" as const,
  memberSince: "2024",
};

export const portfolio = {
  balance: 1284920.42,
  currency: "USD",
  change24h: 1.84,
  changeValue: 23204.11,
  allocationLabel: "6 positions",
};

export const assets: Asset[] = [
  {
    id: "btc",
    symbol: "BTC",
    name: "Bitcoin",
    price: 68420.1,
    change24h: 2.14,
    holdings: 12.4,
    value: 848409.24,
  },
  {
    id: "eth",
    symbol: "ETH",
    name: "Ethereum",
    price: 3521.88,
    change24h: -0.86,
    holdings: 84.2,
    value: 296542.29,
  },
  {
    id: "sol",
    symbol: "SOL",
    name: "Solana",
    price: 172.4,
    change24h: 4.02,
    holdings: 540,
    value: 93096.0,
  },
  {
    id: "xau",
    symbol: "XAU",
    name: "Tokenised Gold",
    price: 2418.7,
    change24h: 0.21,
    holdings: 12,
    value: 29024.4,
  },
  {
    id: "usdc",
    symbol: "USDC",
    name: "USD Coin",
    price: 1.0,
    change24h: 0.0,
    holdings: 17848.49,
    value: 17848.49,
  },
];

export const transactions: Transaction[] = [
  {
    id: "t1",
    type: "buy",
    asset: "BTC",
    amount: 0.85,
    value: 58157.09,
    date: "Today, 09:24",
    status: "settled",
  },
  {
    id: "t2",
    type: "deposit",
    asset: "USDC",
    amount: 25000,
    value: 25000,
    date: "Yesterday, 18:02",
    status: "settled",
  },
  {
    id: "t3",
    type: "sell",
    asset: "ETH",
    amount: 4.2,
    value: 14791.9,
    date: "12 Mar",
    status: "pending",
  },
  {
    id: "t4",
    type: "withdrawal",
    asset: "USDC",
    amount: 8000,
    value: 8000,
    date: "09 Mar",
    status: "failed",
  },
];

export const notifications: Notification[] = [
  {
    id: "n1",
    kind: "insight",
    title: "Allocation drift detected",
    body: "BTC now represents 66% of your simulated portfolio.",
    date: "2h ago",
    unread: true,
  },
  {
    id: "n2",
    kind: "invitation",
    title: "One invitation remaining",
    body: "Your membership includes a single unused invitation.",
    date: "Yesterday",
    unread: true,
  },
  {
    id: "n3",
    kind: "system",
    title: "Encrypted environment verified",
    body: "Your keys remain private. Session integrity confirmed.",
    date: "12 Mar",
    unread: false,
  },
];

export const members: Member[] = [
  { id: "m1", name: "E. Sørensen", handle: "@sorensen", tier: "Founding", since: "2023" },
  { id: "m2", name: "K. Nakamura", handle: "@nakamura", tier: "Private", since: "2024" },
  { id: "m3", name: "R. Adeyemi", handle: "@adeyemi", tier: "Invited", since: "2025" },
];

export const formatCurrency = (value: number, maximumFractionDigits = 2) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits,
  }).format(value);

export const formatSigned = (value: number) =>
  `${value > 0 ? "+" : value < 0 ? "−" : ""}${Math.abs(value).toFixed(2)}%`;
