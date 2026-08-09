/**
 * Simulated authentication + membership store.
 *
 * Everything here is local to the browser. No real accounts, no real
 * credentials, no financial settlement. It exists so the Insider Domain
 * simulator can demonstrate a complete membership lifecycle.
 */

export const MIN_ADULT_AGE = 18;

export type ExperienceLevel =
  | "new"
  | "some"
  | "wallets"
  | "advanced";

export type CommunicationChannel =
  | "account"
  | "security"
  | "messages"
  | "market"
  | "community"
  | "product";

export type OnboardingAnswers = {
  identityConfirmed: boolean;
  ageConfirmed: boolean;
  invitationConfirmed: boolean;
  privacyAccepted: boolean;
  securityAccepted: boolean;
  communications: CommunicationChannel[];
  experience: ExperienceLevel | null;
};

export type SimulatedWallet = {
  label: string;
  address: string;
  /** Clearly simulated demo material. Cannot control real assets. */
  recoveryPhrase: string;
  createdAt: string;
  imported: boolean;
};

export type MemberRecord = {
  id: string;
  surname: string;
  firstName: string;
  middleName: string;
  username: string;
  email: string;
  /** Simulated only — never a real credential store. */
  password: string;
  dob: string;
  invitationCode: string;
  invitedBy: string;
  role: "member" | "admin";
  emailVerified: boolean;
  onboardingCompleted: boolean;
  onboarding: OnboardingAnswers;
  wallet: SimulatedWallet | null;
  createdAt: string;
};

export type AuthState = {
  users: MemberRecord[];
  sessionId: string | null;
  /** Onboarding step index, persisted so a refresh keeps progress. */
  onboardingStep: number;
  splashSeen: boolean;
};

const KEY = "insider-domain.auth.v1";

export const emptyOnboarding = (): OnboardingAnswers => ({
  identityConfirmed: false,
  ageConfirmed: false,
  invitationConfirmed: false,
  privacyAccepted: false,
  securityAccepted: false,
  communications: ["account", "security"],
  experience: null,
});

const demoAdmin = (): MemberRecord => ({
  id: "member-marchetti",
  surname: "Marchetti",
  firstName: "Alessandro",
  middleName: "",
  username: "a.marchetti",
  email: "a.marchetti@insiderdomain.com",
  password: "insider",
  dob: "1984-03-14",
  invitationCode: "ID-0001-MARCH",
  invitedBy: "Founding circle",
  role: "admin",
  emailVerified: true,
  onboardingCompleted: true,
  onboarding: {
    ...emptyOnboarding(),
    identityConfirmed: true,
    ageConfirmed: true,
    invitationConfirmed: true,
    privacyAccepted: true,
    securityAccepted: true,
    communications: ["account", "security", "messages", "market"],
    experience: "advanced",
  },
  wallet: null,
  createdAt: "2019-04-02T09:00:00.000Z",
});

const initial = (): AuthState => ({
  users: [demoAdmin()],
  sessionId: null,
  onboardingStep: 0,
  splashSeen: false,
});

let state: AuthState = initial();
let hydrated = false;
const listeners = new Set<() => void>();

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable — session stays in memory */
  }
}

export function hydrateAuth() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AuthState>;
      state = {
        ...initial(),
        ...parsed,
        users: parsed.users?.length ? parsed.users : initial().users,
      };
    }
  } catch {
    state = initial();
  }
  emit();
}

function emit() {
  for (const listener of listeners) listener();
}

function set(next: Partial<AuthState>) {
  state = { ...state, ...next };
  persist();
  emit();
}

export const authStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  get: () => state,
};

export function currentUser(): MemberRecord | null {
  return state.users.find((u) => u.id === state.sessionId) ?? null;
}

/* ---------------------------------------------------------------- actions */

export type SignUpInput = {
  surname: string;
  firstName: string;
  middleName: string;
  username: string;
  email: string;
  password: string;
  dob: string;
  invitationCode: string;
};

export type Result<T = void> = { ok: true; value: T } | { ok: false; error: string };

const normalise = (value: string) => value.trim().toLowerCase();

export function signUp(input: SignUpInput): Result<MemberRecord> {
  if (state.users.some((u) => normalise(u.email) === normalise(input.email))) {
    return { ok: false, error: "An account already exists for this email." };
  }
  if (state.users.some((u) => normalise(u.username) === normalise(input.username))) {
    return { ok: false, error: "That username is taken." };
  }

  const record: MemberRecord = {
    id: `member-${Date.now().toString(36)}`,
    surname: input.surname.trim(),
    firstName: input.firstName.trim(),
    middleName: input.middleName.trim(),
    username: input.username.trim(),
    email: input.email.trim(),
    password: input.password,
    dob: input.dob,
    invitationCode: input.invitationCode.trim().toUpperCase(),
    invitedBy: referrerFor(input.invitationCode),
    role: "member",
    emailVerified: false,
    onboardingCompleted: false,
    onboarding: emptyOnboarding(),
    wallet: null,
    createdAt: new Date().toISOString(),
  };

  set({ users: [...state.users, record], sessionId: record.id, onboardingStep: 0 });
  return { ok: true, value: record };
}

export function signIn(identifier: string, password: string): Result<MemberRecord> {
  const user = state.users.find(
    (u) =>
      normalise(u.email) === normalise(identifier) ||
      normalise(u.username) === normalise(identifier),
  );
  if (!user || user.password !== password) {
    return { ok: false, error: "Those credentials were not recognised." };
  }
  set({ sessionId: user.id });
  return { ok: true, value: user };
}

export function signOut() {
  set({ sessionId: null });
}

export function updateUser(id: string, patch: Partial<MemberRecord>) {
  set({ users: state.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) });
}

export function verifyEmail(id: string) {
  updateUser(id, { emailVerified: true });
}

export function resetPassword(email: string, password: string): Result {
  const user = state.users.find((u) => normalise(u.email) === normalise(email));
  if (!user) return { ok: false, error: "No membership is registered to that address." };
  updateUser(user.id, { password });
  return { ok: true, value: undefined };
}

export function setOnboardingStep(step: number) {
  set({ onboardingStep: step });
}

export function patchOnboarding(id: string, patch: Partial<OnboardingAnswers>) {
  const user = state.users.find((u) => u.id === id);
  if (!user) return;
  updateUser(id, { onboarding: { ...user.onboarding, ...patch } });
}

export function completeOnboarding(id: string) {
  updateUser(id, { onboardingCompleted: true });
  set({ onboardingStep: 0 });
}

export function markSplashSeen() {
  set({ splashSeen: true });
}

export function setWallet(id: string, wallet: SimulatedWallet | null) {
  updateUser(id, { wallet });
}

/* ------------------------------------------------------------- invitation */

export const invitationCodes: { code: string; member: string; status: "active" | "revoked" }[] = [
  { code: "ID-2291-VELA", member: "A. Marchetti", status: "active" },
  { code: "ID-4417-ORSO", member: "L. Castellane", status: "active" },
  { code: "ID-8830-NERO", member: "R. Okonjo", status: "active" },
];

export function referrerFor(code: string): string {
  const match = invitationCodes.find(
    (c) => normalise(c.code) === normalise(code) && c.status === "active",
  );
  return match?.member ?? "A. Marchetti";
}

export function isValidInvitation(code: string): boolean {
  return /^ID-\d{4}-[A-Z]{4}$/i.test(code.trim());
}

/** Deterministic six-digit code so the simulated verification step is testable. */
export function verificationCodeFor(email: string): string {
  let hash = 7;
  for (const char of email.trim().toLowerCase()) hash = (hash * 31 + char.charCodeAt(0)) % 1_000_000;
  return String(hash).padStart(6, "0");
}
