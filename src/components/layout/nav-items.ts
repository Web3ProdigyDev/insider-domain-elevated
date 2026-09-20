import {
  Home,
  LineChart,
  Users,
  Sparkles,
  Wallet,
  Settings,
  Bell,
  MessageCircle,
  CandlestickChart,
} from "lucide-react";

export type NavItem = {
  label: string;
  to: string;
  icon: typeof Home;
  primary?: boolean;
  owns?: string[];
};

/** Single source of truth for navigation across sidebar + bottom nav. */
export const navItems: NavItem[] = [
  { label: "Overview", to: "/", icon: Home, primary: true },
  {
    label: "Wallet",
    to: "/wallet",
    icon: Wallet,
    primary: true,
    owns: ["/wallet", "/wallet-setup", "/deposit", "/withdraw", "/transfer", "/receive"],
  },
  {
    label: "Markets",
    to: "/markets",
    icon: LineChart,
    primary: true,
    owns: ["/markets", "/asset", "/trading"],
  },
  { label: "AI Investment", to: "/assistant", icon: CandlestickChart, primary: true },
  { label: "Circle", to: "/circle", icon: Users, primary: true },
];

export const utilityNavItems: NavItem[] = [
  { label: "Messages", to: "/messages", icon: MessageCircle },
  { label: "Notifications", to: "/notifications", icon: Bell },
  { label: "Settings", to: "/settings", icon: Settings },
];

export const bottomNavItems = navItems.filter((i) => i.primary);
