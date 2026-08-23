import {
  Home,
  LineChart,
  Users,
  Sparkles,
  Wallet,
  Settings,
  Bell,
  MessageCircle,
  ShieldCheck,
  CandlestickChart,
} from "lucide-react";

export type NavItem = {
  label: string;
  to: string;
  icon: typeof Home;
  primary?: boolean;
};

/** Single source of truth for navigation across sidebar + bottom nav. */
export const navItems: NavItem[] = [
  { label: "Overview", to: "/", icon: Home, primary: true },
  { label: "Wallet", to: "/wallet", icon: Wallet, primary: true },
  { label: "Markets", to: "/markets", icon: LineChart, primary: true },
  { label: "AI Investment", to: "/assistant", icon: CandlestickChart, primary: true },
  { label: "Circle", to: "/circle", icon: Users, primary: true },
];

export const utilityNavItems: NavItem[] = [
  { label: "Markets", to: "/markets", icon: LineChart },
  { label: "Messages", to: "/messages", icon: MessageCircle },
  { label: "Notifications", to: "/notifications", icon: Bell },
  { label: "Admin", to: "/adminlogin", icon: ShieldCheck },
  { label: "Settings", to: "/settings", icon: Settings },
];

export const bottomNavItems = navItems.filter((i) => i.primary);
