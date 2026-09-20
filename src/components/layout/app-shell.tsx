import type { ReactNode } from "react";
import { AppSidebar } from "./app-sidebar";
import { BottomNav } from "./bottom-nav";
import { TopBar } from "./top-bar";
import { cn } from "@/lib/utils";
import { useRequireMember } from "@/lib/use-auth";
import { Skeleton } from "@/components/common/skeletons";

export function AppShell({
  title,
  eyebrow,
  description,
  action,
  children,
  className,
}: {
  title: string;
  eyebrow?: string | undefined;
  description?: string | undefined;
  action?: ReactNode | undefined;
  children: ReactNode;
  className?: string | undefined;
}) {
  const { allowed, ready } = useRequireMember();
  if (!ready) {
    return (
      <div className="flex min-h-screen w-full bg-background">
        <aside className="hidden w-64 border-r border-border p-6 lg:block">
          <Skeleton className="h-8 w-32" />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="h-16 border-b border-border p-5">
            <Skeleton className="h-4 w-28" />
          </header>
          <main className="p-6">
            <Skeleton className="h-8 w-48" />
          </main>
        </div>
      </div>
    );
  }
  if (!allowed) return null;

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        <TopBar title={title} eyebrow={eyebrow} action={action} />
        {description ? (
          <p className="mx-auto w-full max-w-5xl px-4 pt-3 text-xs leading-relaxed text-muted-foreground sm:px-5 lg:px-10">
            {description}
          </p>
        ) : null}
        <main
          className={cn(
            "mx-auto w-full max-w-5xl flex-1 px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-5 sm:px-5 sm:pt-6 lg:px-10 lg:pb-16 lg:pt-8",
            className,
          )}
        >
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
