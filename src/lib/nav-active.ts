import type { NavItem } from "@/components/layout/nav-items";

export function isNavActive(pathname: string, item: NavItem) {
  const routes = item.owns ?? [item.to];
  return routes.some((route) => {
    if (route === "/") return pathname === "/";
    return pathname === route || pathname.startsWith(`${route}/`);
  });
}
