import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, Settings } from "lucide-react";

import { useQuery } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { getNotifications } from "@/lib/notification.functions";
import { useAuth } from "@/lib/use-auth";

export function TopBar({
  title,
  eyebrow,
  action,
  className,
}: {
  title: string;
  eyebrow?: string | undefined;
  action?: ReactNode | undefined;
  className?: string | undefined;
}) {
  const { user } = useAuth();
  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications(),
    retry: false,
    enabled: Boolean(user),
  });
  const unread = notificationsQuery.data?.filter((n) => !n.read).length ?? 0;
  const initials = (user?.firstName || user?.surname || user?.email || "U")
    .split(/[\s.]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-background/80 px-5 py-4 backdrop-blur-xl lg:px-10 lg:py-6",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow ? <p className="text-eyebrow mb-1.5">{eyebrow}</p> : null}
        <h1 className="truncate text-xl font-medium tracking-[var(--tracking-tightest)] text-foreground lg:text-2xl">
          {title}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {action ? <div className="hidden items-center gap-2 sm:flex">{action}</div> : null}

        <Link
          to="/notifications"
          aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
          className="relative grid size-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors duration-300 ease-[var(--ease-luxe)] hover:border-border-strong hover:text-foreground"
        >
          <Bell className="size-4" strokeWidth={1.75} />
          {unread ? (
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-gold" />
          ) : null}
        </Link>

        <Link
          to="/settings"
          aria-label="Settings and profile"
          className="grid size-9 place-items-center rounded-full border border-gold/30 bg-gold-muted text-[0.6875rem] tracking-tight text-gold transition-colors duration-300 ease-[var(--ease-luxe)] hover:bg-gold/20"
        >
          {initials}
        </Link>

        <Link
          to="/settings"
          aria-label="Settings"
          className="hidden size-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors duration-300 ease-[var(--ease-luxe)] hover:border-border-strong hover:text-foreground lg:grid"
        >
          <Settings className="size-4" strokeWidth={1.75} />
        </Link>
      </div>
    </header>
  );
}
