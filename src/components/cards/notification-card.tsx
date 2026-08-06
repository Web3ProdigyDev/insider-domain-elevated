import { cn } from "@/lib/utils";
import type { Notification } from "@/lib/placeholder-data";

export function NotificationCard({
  notification,
  onSelect,
  className,
}: {
  notification: Notification;
  onSelect?: ((notification: Notification) => void) | undefined;
  className?: string | undefined;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(notification)}
      className={cn(
        "grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-4 rounded-2xl border border-border bg-card px-5 py-4 text-left transition-colors duration-300 ease-[var(--ease-luxe)] hover:border-border-strong hover:bg-surface-raised",
        className,
      )}
    >
      <span
        className={cn(
          "mt-1.5 size-1.5 shrink-0 rounded-full",
          notification.unread ? "bg-gold" : "bg-border-strong",
        )}
      />
      <span className="min-w-0">
        <span className="block truncate text-sm text-foreground">{notification.title}</span>
        <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
          {notification.body}
        </span>
      </span>
      <span className="shrink-0 text-xs text-muted-foreground">{notification.date}</span>
    </button>
  );
}
