/**
 * Age eligibility. Configurable so the threshold can move without touching UI.
 */
export const AGE_CONFIG = {
  /** Minimum age for unrestricted funding methods. */
  adultAge: 18,
  /** Minimum age to hold a membership at all. */
  minimumAge: 13,
} as const;

export function calculateAge(dob: string, now: Date = new Date()): number {
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return 0;
  let age = now.getFullYear() - birth.getFullYear();
  const month = now.getMonth() - birth.getMonth();
  if (month < 0 || (month === 0 && now.getDate() < birth.getDate())) age -= 1;
  return Math.max(0, age);
}

export function formatDob(dob: string): string {
  const date = new Date(dob);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export type FundingEligibility = {
  age: number;
  isAdult: boolean;
  /** Funding methods this member may see. Ineligible methods are hidden. */
  methods: ("crypto" | "gift-card")[];
};

export function fundingEligibility(dob: string): FundingEligibility {
  const age = calculateAge(dob);
  const isAdult = age >= AGE_CONFIG.adultAge;
  return {
    age,
    isAdult,
    methods: isAdult ? ["crypto"] : ["crypto", "gift-card"],
  };
}
