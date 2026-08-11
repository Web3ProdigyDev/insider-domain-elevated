/**
 * Insider Domain — simulated application state.
 *
 * One store, one source of truth: wallet, balances, transactions,
 * notifications, the investment assistant, the Circle and the audit log.
 * Everything is local to the browser. Nothing here touches real assets,
 * real money or real credentials.
 */

import { assetRegistry, findAsset } from "./assets";
import { holdings } from "./holdings";

/* --------------------------------------------------------------- types */

export type SimulatedWalletRecord = {
  label: string;
  address: string;
  /** DEMO material only. Cannot control any real cryptocurrency. */
  recoveryPhrase: string;
  createdAt: string;
  imported: boolean;
};

export type TxKind = "deposit" | "withdraw" | "assistant" | "adjustment";
export type TxStatus =
  | "awaiting"
  | "detected"
  | "confirming"
  | "confirmed"
  | "reviewing"
  | "processing"
  | "completed"
  | "failed";

export type Transaction = {
  id: string;
  kind: TxKind;
  assetId: string;
  symbol: string;
  amount: number;
  usd: number;
  status: TxStatus;
  network: string;
  address: string;
  note: string;
  createdAt: number;
  updatedAt: number;
};

export type NotificationCategory =
  | "account"
  | "security"
  | "transaction"
  | "assistant"
  | "circle"
  | "message"
  | "invitation"
  | "vote"
  | "market";

export type SimNotification = {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  /** Route this notification opens. */
  to: string;
  read: boolean;
  createdAt: number;
};

export type AssistantFocus = "balanced" | "growth" | "stability" | "opportunities";
export type AssistantStatus = "off" | "activating" | "active";

export type AssistantEvent = {
  id: string;
  at: number;
  label: string;
  detail: string;
};

export type AssistantState = {
  status: AssistantStatus;
  focus: AssistantFocus | null;
  activatedAt: number | null;
  lastTickAt: number | null;
  /** True once the activation sequence has run at least once. */
  hasActivatedBefore: boolean;
  events: AssistantEvent[];
  reviews: number;
  /** Cumulative simulated performance contribution, percent. */
  drift: number;
};

export type Reaction = "insight" | "agree" | "watching";

export type Comment = {
  id: string;
  author: string;
  handle: string;
  body: string;
  at: number;
};

export type Post = {
  id: string;
  author: string;
  handle: string;
  tier: string;
  body: string;
  at: number;
  pinned: boolean;
  announcement: boolean;
  likes: string[];
  comments: Comment[];
  unread: boolean;
};

export type Vote = { handle: string; choice: "approve" | "decline"; at: number };

export type Invitation = {
  id: string;
  candidate: string;
  candidateHandle: string;
  invitedBy: string;
  inviterHandle: string;
  note: string;
  at: number;
  status: "pending" | "approved" | "declined";
  votes: Vote[];
  discussion: Comment[];
};

export type ChatMessage = {
  id: string;
  from: string;
  body: string;
  at: number;
  reactions: string[];
};

export type Thread = {
  id: string;
  /** Handle of the other member. */
  with: string;
  name: string;
  online: boolean;
  messages: ChatMessage[];
  unread: number;
};

export type MemberProfile = {
  handle: string;
  name: string;
  tier: string;
  since: string;
  status: "active" | "suspended";
  achievements: string[];
  bio: string;
};

export type AuditEntry = {
  id: string;
  admin: string;
  action: string;
  target: string;
  before: string;
  after: string;
  at: number;
};

export type SimState = {
  wallet: SimulatedWalletRecord | null;
  balances: Record<string, number>;
  transactions: Transaction[];
  notifications: SimNotification[];
  assistant: AssistantState;
  posts: Post[];
  invitations: Invitation[];
  threads: Thread[];
  members: MemberProfile[];
  audit: AuditEntry[];
  /** Simulated per-asset price override, used by the admin market tools. */
  priceOverrides: Record<string, number>;
  seededAt: number;
};

/* -------------------------------------------------------------- seeding */

export const ME = "a.marchetti";
export const APPROVALS_REQUIRED = 5;

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const words = [
  "harbor", "quiet", "ember", "vault", "cedar", "atlas", "signal", "north",
  "marble", "orbit", "ledger", "cobalt",
];

export function demoPhrase(seed = Date.now()): string {
  const out: string[] = [];
  let h = seed % 100000;
  for (let i = 0; i < 12; i += 1) {
    h = (h * 1103515245 + 12345) % 2147483647;
    out.push(words[h % words.length]!);
  }
  return out.join(" ");
}

export function demoAddress(assetId: string, seed = 1): string {
  const chars = "abcdefghjkmnpqrstuvwxyz0123456789";
  let h = seed * 7919 + assetId.length * 131;
  let out = "";
  for (let i = 0; i < 30; i += 1) {
    h = (h * 1103515245 + 12345) % 2147483647;
    out += chars[h % chars.length];
  }
  const prefix =
    assetId === "bitcoin" ? "bc1q" : assetId === "solana" ? "" : assetId === "ripple" ? "r" : "0x";
  return prefix + out;
}

export const shortAddress = (address: string) =>
  address.length > 14 ? `${address.slice(0, 8)}…${address.slice(-6)}` : address;

function seedMembers(): MemberProfile[] {
  return [
    {
      handle: ME,
      name: "A. Marchetti",
      tier: "Founding",
      since: "2019",
      status: "active",
      achievements: ["Founding circle", "12 invitations sponsored", "Top contributor"],
      bio: "Private allocator. Long horizons, quiet positions.",
    },
    {
      handle: "l.castellane",
      name: "L. Castellane",
      tier: "Principal",
      since: "2020",
      status: "active",
      achievements: ["Circle moderator", "40 discussions"],
      bio: "Macro first, conviction second.",
    },
    {
      handle: "r.okonjo",
      name: "R. Okonjo",
      tier: "Principal",
      since: "2021",
      status: "active",
      achievements: ["8 invitations sponsored"],
      bio: "Infrastructure and settlement rails.",
    },
    {
      handle: "s.ведано",
      name: "S. Vedano",
      tier: "Member",
      since: "2023",
      status: "active",
      achievements: ["New voice"],
      bio: "Studying allocation discipline.",
    },
    {
      handle: "h.aldrin",
      name: "H. Aldrin",
      tier: "Member",
      since: "2024",
      status: "active",
      achievements: ["Invited by A. Marchetti"],
      bio: "Quiet observer.",
    },
  ];
}

function seedPosts(now: number): Post[] {
  return [
    {
      id: "post-pinned",
      author: "Insider Domain",
      handle: "domain",
      tier: "Announcement",
      body: "The Circle now votes on every invitation. Five approvals grant membership. Discussion stays private to members.",
      at: now - 2 * DAY,
      pinned: true,
      announcement: true,
      likes: ["l.castellane", "r.okonjo"],
      comments: [],
      unread: false,
    },
    {
      id: "post-1",
      author: "L. Castellane",
      handle: "l.castellane",
      tier: "Principal",
      body: "Rotated a portion of the stable book into duration this morning. Not a call — just noting the posture change.",
      at: now - 5 * HOUR,
      pinned: false,
      announcement: false,
      likes: [ME],
      comments: [
        {
          id: "c-1",
          author: "R. Okonjo",
          handle: "r.okonjo",
          body: "Same read here. Settlement volumes have been unusually flat.",
          at: now - 4 * HOUR,
        },
      ],
      unread: false,
    },
    {
      id: "post-2",
      author: "R. Okonjo",
      handle: "r.okonjo",
      tier: "Principal",
      body: "A reminder for newer members: the assistant is a simulation. Treat every number here as a study aid, not advice.",
      at: now - 26 * HOUR,
      pinned: false,
      announcement: false,
      likes: ["l.castellane", "h.aldrin"],
      comments: [],
      unread: true,
    },
  ];
}

function seedInvitations(now: number): Invitation[] {
  return [
    {
      id: "inv-1",
      candidate: "M. Bergström",
      candidateHandle: "m.bergstrom",
      invitedBy: "L. Castellane",
      inviterHandle: "l.castellane",
      note: "Twelve years in private credit. Discreet, unhurried, and a genuinely good reader of liquidity.",
      at: now - 3 * DAY,
      status: "pending",
      votes: [
        { handle: "l.castellane", choice: "approve", at: now - 3 * DAY },
        { handle: "r.okonjo", choice: "approve", at: now - 2 * DAY },
        { handle: "h.aldrin", choice: "approve", at: now - 30 * HOUR },
      ],
      discussion: [
        {
          id: "d-1",
          author: "R. Okonjo",
          handle: "r.okonjo",
          body: "I've sat across the table from M. twice. No theatre. Supportive.",
          at: now - 2 * DAY,
        },
      ],
    },
    {
      id: "inv-2",
      candidate: "T. Reyes",
      candidateHandle: "t.reyes",
      invitedBy: "A. Marchetti",
      inviterHandle: ME,
      note: "Systems background. Would add depth on custody and settlement.",
      at: now - 9 * HOUR,
      status: "pending",
      votes: [{ handle: ME, choice: "approve", at: now - 9 * HOUR }],
      discussion: [],
    },
  ];
}

function seedThreads(now: number): Thread[] {
  return [
    {
      id: "th-1",
      with: "l.castellane",
      name: "L. Castellane",
      online: true,
      unread: 1,
      messages: [
        { id: "m-1", from: "l.castellane", body: "Did you read the invitation note for M.?", at: now - 3 * HOUR, reactions: [] },
        { id: "m-2", from: ME, body: "Reading it now. Leaning approve.", at: now - 2.6 * HOUR, reactions: [] },
        { id: "m-3", from: "l.castellane", body: "Good. We're at three of five.", at: now - 40 * MINUTE, reactions: [] },
      ],
    },
    {
      id: "th-2",
      with: "r.okonjo",
      name: "R. Okonjo",
      online: false,
      unread: 0,
      messages: [
        { id: "m-4", from: "r.okonjo", body: "Assistant flagged an allocation drift on my book overnight. Elegant.", at: now - 2 * DAY, reactions: ["insight"] },
      ],
    },
  ];
}

function seedNotifications(now: number): SimNotification[] {
  return [
    {
      id: "n-1",
      category: "invitation",
      title: "Invitation open for discussion",
      body: "M. Bergström is under review by the Circle.",
      to: "/circle",
      read: false,
      createdAt: now - 3 * HOUR,
    },
    {
      id: "n-2",
      category: "security",
      title: "New session recognised",
      body: "A session was opened on this device.",
      to: "/settings/security",
      read: false,
      createdAt: now - 8 * HOUR,
    },
    {
      id: "n-3",
      category: "market",
      title: "Market conditions updated",
      body: "Volatility across majors eased overnight.",
      to: "/markets",
      read: true,
      createdAt: now - 20 * HOUR,
    },
  ];
}

function seedTransactions(now: number): Transaction[] {
  return [
    {
      id: "tx-1",
      kind: "deposit",
      assetId: "bitcoin",
      symbol: "BTC",
      amount: 0.75,
      usd: 0,
      status: "confirmed",
      network: "Bitcoin",
      address: demoAddress("bitcoin", 3),
      note: "Deposit confirmed",
      createdAt: now - 4 * DAY,
      updatedAt: now - 4 * DAY,
    },
    {
      id: "tx-2",
      kind: "withdraw",
      assetId: "usd-coin",
      symbol: "USDC",
      amount: 12000,
      usd: 12000,
      status: "completed",
      network: "Ethereum",
      address: demoAddress("usd-coin", 9),
      note: "Withdrawal completed",
      createdAt: now - 2 * DAY,
      updatedAt: now - 2 * DAY,
    },
  ];
}

export function initialSim(now = Date.now()): SimState {
  const balances: Record<string, number> = {};
  for (const h of holdings) balances[h.id] = h.amount;

  return {
    wallet: {
      label: "Primary vault",
      address: demoAddress("bitcoin", 1),
      recoveryPhrase: demoPhrase(42),
      createdAt: new Date(now - 400 * DAY).toISOString(),
      imported: false,
    },
    balances,
    transactions: seedTransactions(now),
    notifications: seedNotifications(now),
    assistant: {
      status: "off",
      focus: null,
      activatedAt: null,
      lastTickAt: null,
      hasActivatedBefore: false,
      events: [],
      reviews: 0,
      drift: 0,
    },
    posts: seedPosts(now),
    invitations: seedInvitations(now),
    threads: seedThreads(now),
    members: seedMembers(),
    audit: [],
    priceOverrides: {},
    seededAt: now,
  };
}

/* ---------------------------------------------------------------- store */

const KEY = "insider-domain.sim.v1";

let state: SimState = initialSim();
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable */
  }
}

function set(next: Partial<SimState>) {
  state = { ...state, ...next };
  persist();
  emit();
}

export function hydrateSim() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SimState>;
      state = { ...initialSim(), ...parsed };
    }
  } catch {
    state = initialSim();
  }
  emit();
}

export const simStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  get: () => state,
};

export const getSim = () => state;

const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

/* -------------------------------------------------------------- wallet */

export function createWallet(label: string) {
  const wallet: SimulatedWalletRecord = {
    label: label.trim() || "Primary vault",
    address: demoAddress("bitcoin", Date.now() % 9999),
    recoveryPhrase: demoPhrase(Date.now()),
    createdAt: new Date().toISOString(),
    imported: false,
  };
  set({ wallet });
  pushNotification({
    category: "account",
    title: "Wallet created",
    body: `${wallet.label} is ready. Recovery material is simulated.`,
    to: "/wallet",
  });
  return wallet;
}

export function importWallet(label: string, phrase: string) {
  const wallet: SimulatedWalletRecord = {
    label: label.trim() || "Imported vault",
    address: demoAddress("ethereum", phrase.length + 17),
    recoveryPhrase: phrase.trim(),
    createdAt: new Date().toISOString(),
    imported: true,
  };
  set({ wallet });
  pushNotification({
    category: "account",
    title: "Wallet imported",
    body: `${wallet.label} was imported into the simulation.`,
    to: "/wallet",
  });
  return wallet;
}

export function removeWallet() {
  set({ wallet: null });
}

export function depositAddressFor(assetId: string) {
  const seed = assetId.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  return demoAddress(assetId, seed);
}

/* ------------------------------------------------------------ balances */

export function adjustBalance(assetId: string, delta: number) {
  const next = Math.max(0, (state.balances[assetId] ?? 0) + delta);
  set({ balances: { ...state.balances, [assetId]: next } });
}

export function setBalance(assetId: string, amount: number) {
  set({ balances: { ...state.balances, [assetId]: Math.max(0, amount) } });
}

/* -------------------------------------------------------- transactions */

export function createTransaction(
  input: Omit<Transaction, "id" | "createdAt" | "updatedAt">,
): Transaction {
  const now = Date.now();
  const tx: Transaction = { ...input, id: uid("tx"), createdAt: now, updatedAt: now };
  set({ transactions: [tx, ...state.transactions] });
  return tx;
}

export function updateTransaction(id: string, patch: Partial<Transaction>) {
  set({
    transactions: state.transactions.map((t) =>
      t.id === id ? { ...t, ...patch, updatedAt: Date.now() } : t,
    ),
  });
}

/* ------------------------------------------------------- notifications */

export function pushNotification(
  input: Omit<SimNotification, "id" | "read" | "createdAt"> & { createdAt?: number },
) {
  const notification: SimNotification = {
    ...input,
    id: uid("n"),
    read: false,
    createdAt: input.createdAt ?? Date.now(),
  };
  set({ notifications: [notification, ...state.notifications].slice(0, 60) });
  return notification;
}

export function markNotificationRead(id: string) {
  set({ notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) });
}

export function markAllNotificationsRead() {
  set({ notifications: state.notifications.map((n) => ({ ...n, read: true })) });
}

/* ----------------------------------------------------------- assistant */

const FOCUS_COPY: Record<AssistantFocus, { label: string; note: string }> = {
  balanced: { label: "Balanced", note: "Steady allocation across the book." },
  growth: { label: "Growth", note: "Leans into strength when conditions allow." },
  stability: { label: "Stability", note: "Protects the base. Moves rarely." },
  opportunities: { label: "Opportunities", note: "Watches for dislocations." },
};

export const focusCopy = FOCUS_COPY;

export function configureAssistant(focus: AssistantFocus) {
  set({ assistant: { ...state.assistant, focus } });
}

export function setAssistantStatus(status: AssistantStatus) {
  const now = Date.now();
  set({
    assistant: {
      ...state.assistant,
      status,
      activatedAt: status === "active" ? (state.assistant.activatedAt ?? now) : null,
      lastTickAt: status === "active" ? now : null,
      hasActivatedBefore: state.assistant.hasActivatedBefore || status === "active",
    },
  });
}

export function activateAssistant() {
  setAssistantStatus("active");
  pushAssistantEvent("Assistant activated", "Monitoring your portfolio continuously.");
  pushNotification({
    category: "assistant",
    title: "Investment assistant activated",
    body: "Your strategy is now running in the background.",
    to: "/assistant",
  });
}

export function deactivateAssistant() {
  set({
    assistant: { ...state.assistant, status: "off", activatedAt: null, lastTickAt: null },
  });
  pushNotification({
    category: "assistant",
    title: "Investment assistant paused",
    body: "Simulated activity has stopped.",
    to: "/assistant",
  });
}

export function pushAssistantEvent(label: string, detail: string, at = Date.now()) {
  const event: AssistantEvent = { id: uid("ae"), at, label, detail };
  set({
    assistant: {
      ...state.assistant,
      events: [event, ...state.assistant.events].slice(0, 60),
      lastTickAt: at,
    },
  });
  return event;
}

const ACTIVITY_POOL: { label: string; detail: (symbol: string) => string }[] = [
  { label: "Portfolio reviewed", detail: () => "Allocation checked against your focus." },
  { label: "Allocation analyzed", detail: (s) => `${s} weighting evaluated against the book.` },
  { label: "Market conditions updated", detail: () => "Liquidity and volatility re-read." },
  { label: "Opportunity evaluated", detail: (s) => `A simulated ${s} setup was assessed.` },
  { label: "Strategy recalculated", detail: () => "Positioning refreshed for current conditions." },
  { label: "Risk posture reviewed", detail: () => "Concentration and drawdown checked." },
  { label: "Monitoring continues", detail: () => "No action required at this time." },
];

/** One simulated assistant step. Also nudges balances and records activity. */
export function assistantTick(at = Date.now()) {
  const a = state.assistant;
  if (a.status !== "active") return;

  const symbols = Object.keys(state.balances);
  const assetId = symbols[Math.floor(Math.random() * symbols.length)] ?? "bitcoin";
  const symbol = findAsset(assetId)?.symbol ?? assetId.toUpperCase();
  const entry = ACTIVITY_POOL[Math.floor(Math.random() * ACTIVITY_POOL.length)]!;

  const event: AssistantEvent = {
    id: uid("ae"),
    at,
    label: entry.label,
    detail: entry.detail(symbol),
  };

  // Occasionally the assistant rebalances, which shows up as a transaction.
  const rebalances = Math.random() > 0.72;
  const nextBalances = { ...state.balances };
  let transactions = state.transactions;
  if (rebalances) {
    const current = nextBalances[assetId] ?? 0;
    const delta = current * (Math.random() - 0.45) * 0.012;
    nextBalances[assetId] = Math.max(0, current + delta);
    const tx: Transaction = {
      id: uid("tx"),
      kind: "assistant",
      assetId,
      symbol,
      amount: Math.abs(delta),
      usd: 0,
      status: "completed",
      network: findAsset(assetId)?.network ?? "Simulated",
      address: "Internal rebalance",
      note: `Assistant ${delta >= 0 ? "increased" : "trimmed"} ${symbol} allocation`,
      createdAt: at,
      updatedAt: at,
    };
    transactions = [tx, ...transactions];
  }

  const reviews = a.reviews + 1;
  set({
    balances: nextBalances,
    transactions,
    assistant: {
      ...a,
      events: [event, ...a.events].slice(0, 60),
      lastTickAt: at,
      reviews,
      drift: a.drift + (Math.random() - 0.4) * 0.03,
    },
  });

  // Understated notifications, only on milestones.
  if (reviews % 8 === 0) {
    pushNotification({
      category: "assistant",
      title: "Investment assistant completed a portfolio review",
      body: "Allocation and market conditions were reassessed.",
      to: "/assistant",
      createdAt: at,
    });
  }
}

/** Fills in what happened while the member was away. */
export function catchUpAssistant(now = Date.now()) {
  const a = state.assistant;
  if (a.status !== "active" || !a.lastTickAt) return 0;
  const elapsed = now - a.lastTickAt;
  const steps = Math.min(12, Math.floor(elapsed / (4 * MINUTE)));
  for (let i = steps; i > 0; i -= 1) assistantTick(now - i * 4 * MINUTE);
  return steps;
}

/* -------------------------------------------------------------- circle */

export function addPost(body: string, author = "A. Marchetti", handle = ME) {
  const post: Post = {
    id: uid("post"),
    author,
    handle,
    tier: "Founding",
    body: body.trim(),
    at: Date.now(),
    pinned: false,
    announcement: false,
    likes: [],
    comments: [],
    unread: false,
  };
  set({ posts: [post, ...state.posts] });
  return post;
}

export function addAnnouncement(body: string) {
  const post: Post = {
    id: uid("post"),
    author: "Insider Domain",
    handle: "domain",
    tier: "Announcement",
    body: body.trim(),
    at: Date.now(),
    pinned: true,
    announcement: true,
    likes: [],
    comments: [],
    unread: true,
  };
  set({ posts: [post, ...state.posts] });
  pushNotification({
    category: "circle",
    title: "New announcement",
    body: body.slice(0, 90),
    to: "/circle",
  });
}

export function toggleLike(postId: string, handle = ME) {
  set({
    posts: state.posts.map((p) =>
      p.id === postId
        ? {
            ...p,
            likes: p.likes.includes(handle)
              ? p.likes.filter((h) => h !== handle)
              : [...p.likes, handle],
          }
        : p,
    ),
  });
}

export function addComment(postId: string, body: string, author = "A. Marchetti", handle = ME) {
  set({
    posts: state.posts.map((p) =>
      p.id === postId
        ? {
            ...p,
            comments: [
              ...p.comments,
              { id: uid("c"), author, handle, body: body.trim(), at: Date.now() },
            ],
          }
        : p,
    ),
  });
}

export function markPostRead(postId: string) {
  set({ posts: state.posts.map((p) => (p.id === postId ? { ...p, unread: false } : p)) });
}

export function togglePin(postId: string) {
  set({ posts: state.posts.map((p) => (p.id === postId ? { ...p, pinned: !p.pinned } : p)) });
}

export function removePost(postId: string) {
  set({ posts: state.posts.filter((p) => p.id !== postId) });
}

/* ---------------------------------------------------------- invitations */

export function createInvitation(input: {
  candidate: string;
  note: string;
  invitedBy?: string;
  inviterHandle?: string;
}) {
  const invitation: Invitation = {
    id: uid("inv"),
    candidate: input.candidate.trim(),
    candidateHandle: input.candidate.trim().toLowerCase().replace(/[^a-z]+/g, "."),
    invitedBy: input.invitedBy ?? "A. Marchetti",
    inviterHandle: input.inviterHandle ?? ME,
    note: input.note.trim(),
    at: Date.now(),
    status: "pending",
    votes: [],
    discussion: [],
  };
  set({ invitations: [invitation, ...state.invitations] });
  pushNotification({
    category: "invitation",
    title: "Invitation opened for discussion",
    body: `${invitation.candidate} is now under review by the Circle.`,
    to: "/circle",
  });
  return invitation;
}

export function castVote(invitationId: string, choice: "approve" | "decline", handle = ME) {
  const invitation = state.invitations.find((i) => i.id === invitationId);
  if (!invitation || invitation.status !== "pending") return;
  if (invitation.votes.some((v) => v.handle === handle)) return; // no duplicate votes

  const votes = [...invitation.votes, { handle, choice, at: Date.now() }];
  const approvals = votes.filter((v) => v.choice === "approve").length;
  const status: Invitation["status"] = approvals >= APPROVALS_REQUIRED ? "approved" : "pending";

  set({
    invitations: state.invitations.map((i) =>
      i.id === invitationId ? { ...i, votes, status } : i,
    ),
  });

  pushNotification({
    category: "vote",
    title: status === "approved" ? "Membership granted" : "Vote recorded",
    body:
      status === "approved"
        ? `${invitation.candidate} received ${APPROVALS_REQUIRED} approvals.`
        : `${approvals} of ${APPROVALS_REQUIRED} approvals for ${invitation.candidate}.`,
    to: "/circle",
  });
}

export function addInvitationComment(invitationId: string, body: string, author = "A. Marchetti", handle = ME) {
  set({
    invitations: state.invitations.map((i) =>
      i.id === invitationId
        ? {
            ...i,
            discussion: [
              ...i.discussion,
              { id: uid("d"), author, handle, body: body.trim(), at: Date.now() },
            ],
          }
        : i,
    ),
  });
}

export function revokeInvitation(invitationId: string) {
  set({
    invitations: state.invitations.map((i) =>
      i.id === invitationId ? { ...i, status: "declined" } : i,
    ),
  });
}

/* ------------------------------------------------------------ messages */

export function sendMessage(threadId: string, body: string) {
  const message: ChatMessage = { id: uid("m"), from: ME, body: body.trim(), at: Date.now(), reactions: [] };
  set({
    threads: state.threads.map((t) =>
      t.id === threadId ? { ...t, messages: [...t.messages, message] } : t,
    ),
  });
  return message;
}

export function receiveMessage(threadId: string, body: string) {
  const thread = state.threads.find((t) => t.id === threadId);
  if (!thread) return;
  const message: ChatMessage = {
    id: uid("m"),
    from: thread.with,
    body,
    at: Date.now(),
    reactions: [],
  };
  set({
    threads: state.threads.map((t) =>
      t.id === threadId ? { ...t, messages: [...t.messages, message], unread: t.unread + 1 } : t,
    ),
  });
  pushNotification({
    category: "message",
    title: `Message from ${thread.name}`,
    body,
    to: `/messages/${threadId}`,
  });
}

export function openThread(handle: string) {
  const existing = state.threads.find((t) => t.with === handle);
  if (existing) {
    markThreadRead(existing.id);
    return existing.id;
  }
  const member = state.members.find((m) => m.handle === handle);
  const thread: Thread = {
    id: uid("th"),
    with: handle,
    name: member?.name ?? handle,
    online: false,
    unread: 0,
    messages: [],
  };
  set({ threads: [thread, ...state.threads] });
  return thread.id;
}

export function markThreadRead(threadId: string) {
  set({ threads: state.threads.map((t) => (t.id === threadId ? { ...t, unread: 0 } : t)) });
}

export function reactToMessage(threadId: string, messageId: string, reaction: string) {
  set({
    threads: state.threads.map((t) =>
      t.id === threadId
        ? {
            ...t,
            messages: t.messages.map((m) =>
              m.id === messageId
                ? {
                    ...m,
                    reactions: m.reactions.includes(reaction)
                      ? m.reactions.filter((r) => r !== reaction)
                      : [...m.reactions, reaction],
                  }
                : m,
            ),
          }
        : t,
    ),
  });
}

/* --------------------------------------------------------------- admin */

export function recordAudit(entry: Omit<AuditEntry, "id" | "at">) {
  const audit: AuditEntry = { ...entry, id: uid("a"), at: Date.now() };
  set({ audit: [audit, ...state.audit].slice(0, 200) });
}

export function setMemberStatus(handle: string, status: MemberProfile["status"]) {
  const before = state.members.find((m) => m.handle === handle)?.status ?? "active";
  set({
    members: state.members.map((m) => (m.handle === handle ? { ...m, status } : m)),
  });
  recordAudit({
    admin: "A. Marchetti",
    action: status === "suspended" ? "Suspend account" : "Restore account",
    target: handle,
    before,
    after: status,
  });
}

export function setPriceOverride(assetId: string, price: number | null) {
  const next = { ...state.priceOverrides };
  if (price === null) delete next[assetId];
  else next[assetId] = price;
  set({ priceOverrides: next });
}

export function resetSim() {
  state = initialSim();
  persist();
  emit();
}

export function seedDemoData() {
  const now = Date.now();
  state = {
    ...initialSim(now),
    wallet: state.wallet,
    assistant: state.assistant,
  };
  persist();
  emit();
}

/* -------------------------------------------------- simulation control */

export const supportedAssets = assetRegistry;
