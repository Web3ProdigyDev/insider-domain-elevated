import { Link, useRouterState } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { useAuth } from "@/lib/use-auth";
import { cn } from "@/lib/utils";
import { navItems, utilityNavItems } from "./nav-items";

export function AppSidebar({ className }: { className?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <aside
      className={cn(
        "hidden w-64 shrink-0 flex-col justify-between border-r border-border bg-sidebar px-4 py-6 lg:flex",
        className,
      )}
    >
      <div>
        <Link to="/" className="mb-10 flex items-center gap-3 px-2">
          <span className="grid size-8 shrink-0 place-items-center rounded-full border border-gold/30 text-[0.7rem] font-medium tracking-tight text-gold">
            ID
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium tracking-tight text-foreground">
              Insider Domain
            </span>
            <span className="text-eyebrow">Private</span>
          </span>
        </Link>

        <nav className="flex flex-col gap-0.5" aria-label="Primary">
          {navItems.map((item) => (
            <SidebarLink key={item.to} item={item} active={isActive(item.to)} />
          ))}
        </nav>

        <p className="text-eyebrow mb-2 mt-8 px-3">Account</p>
        <nav className="flex flex-col gap-0.5" aria-label="Account">
          {utilityNavItems.map((item) => (
            <SidebarLink key={item.to} item={item} active={isActive(item.to)} />
          ))}
        </nav>
        {user?.role === "admin" ? (
          <div className="mt-8">
            <p className="text-eyebrow mb-2 px-3">Oversight</p>
            <SidebarLink
              item={{ label: "Members", to: "/admin", icon: Shield }}
              active={isActive("/admin")}
            />
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function SidebarLink({
  item,
  active,
}: {
  item: { label: string; to: string; icon: React.ElementType };
  active: boolean;
}) {
  return (
    <Link
      to={item.to}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-300 ease-[var(--ease-luxe)]",
        active
          ? "bg-sidebar-accent text-foreground"
          : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
      )}
    >
      <item.icon
        className={cn("size-4 shrink-0", active ? "text-gold" : "text-current")}
        strokeWidth={1.75}
      />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}
