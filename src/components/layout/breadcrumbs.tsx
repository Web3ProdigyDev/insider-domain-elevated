import { Link, useRouterState } from "@tanstack/react-router";
import { Fragment } from "react";
import { navItems } from "./nav-items";

const labels: Record<string, string> = {
  wallet: "Wallet",
  "wallet-setup": "Wallet setup",
  deposit: "Deposit",
  withdraw: "Withdraw",
  transfer: "Transfer",
  receive: "Receive",
  markets: "Markets",
  asset: "Asset",
  trading: "Trading",
  settings: "Settings",
  notifications: "Notifications",
};

export function Breadcrumbs() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length < 2) return null;
  const parent = navItems.find((item) =>
    item.owns?.some((route) => pathname === route || pathname.startsWith(`${route}/`)),
  );
  const crumbs = parts.map((part, index) => ({
    label: labels[part] ?? (index === parts.length - 1 ? "Details" : part),
    href: `/${parts.slice(0, index + 1).join("/")}`,
  }));
  if (parent && crumbs[0]?.label !== parent.label)
    crumbs.unshift({ label: parent.label, href: parent.to });
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-3 flex items-center gap-2 text-xs text-muted-foreground"
    >
      {crumbs.map((crumb, index) => (
        <Fragment key={`${crumb.href}-${index}`}>
          {index ? <span aria-hidden="true">/</span> : null}
          {index === crumbs.length - 1 ? (
            <span className="text-foreground">{crumb.label}</span>
          ) : (
            <Link to={crumb.href as never} className="hover:text-foreground">
              {crumb.label}
            </Link>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
