import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { bottomNavItems } from "./nav-items";

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/85 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {bottomNavItems.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className="flex flex-col items-center gap-1.5 py-3 transition-colors duration-300 ease-[var(--ease-luxe)]"
              >
                <item.icon
                  className={cn("size-5", active ? "text-gold" : "text-muted-foreground")}
                  strokeWidth={1.75}
                />
                <span
                  className={cn(
                    "text-[0.625rem] tracking-tight",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
