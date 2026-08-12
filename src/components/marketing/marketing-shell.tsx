import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

/** Quiet public chrome for the pages that live outside the member app. */
export function MarketingShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string | undefined;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-4 lg:px-10">
          <Link
            to="/membership"
            className="text-sm tracking-[0.18em] text-foreground transition-opacity hover:opacity-80"
          >
            INSIDER DOMAIN
          </Link>
          <nav className="flex items-center gap-5 text-xs text-muted-foreground">
            <Link to="/membership" hash="how" className="transition-colors hover:text-foreground">
              How it works
            </Link>
            <Link to="/membership" hash="faq" className="transition-colors hover:text-foreground">
              FAQ
            </Link>
            <Link to="/auth" className="text-gold transition-opacity hover:opacity-80">
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <main className={cn("mx-auto w-full max-w-5xl px-5 pb-28 pt-10 lg:px-10 lg:pb-24", className)}>
        {children}
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-xs text-muted-foreground lg:px-10">
          <p>© {new Date().getFullYear()} Insider Domain. A simulated environment.</p>
          <div className="flex gap-5">
            <Link to="/membership" className="transition-colors hover:text-foreground">
              Membership
            </Link>
            <Link to="/privacy" className="transition-colors hover:text-foreground">
              Privacy
            </Link>
            <Link to="/auth" className="transition-colors hover:text-foreground">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/** Minimal, typeset breadcrumbs with matching structured data. */
export function Crumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <li>
          <Link to="/membership" className="transition-colors hover:text-foreground">
            Home
          </Link>
        </li>
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2">
            <span aria-hidden className="text-border-strong">
              /
            </span>
            {item.to ? (
              <Link to={item.to} className="transition-colors hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
