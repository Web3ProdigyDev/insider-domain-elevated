import { Home, LineChart, Users, Crosshair, Wallet, Settings, Bell } from "lucide-react";

export type NavItem = {
  label: string;
  to: string;
  icon: typeof Home;
  primary?: boolean;
};

/** Single source of truth for navigation across sidebar + bottom nav. */
export const navItems: NavItem[] = [
  { label: "Overview", to: "/", icon: Home, primary: true },
  { label: "Markets", to: "/markets", icon: LineChart, primary: true },
  { label: "Trading", to: "/trading", icon: Crosshair, primary: true },
  { label: "Portfolio", to: "/portfolio", icon: Wallet, primary: true },
  { label: "Circle", to: "/circle", icon: Users, primary: true },
];

export const utilityNavItems: NavItem[] = [
  { label: "Notifications", to: "/notifications", icon: Bell },
  { label: "Settings", to: "/settings", icon: Settings },
];

export const bottomNavItems = navItems.filter((i) => i.primary);
