import type { ReactNode } from "react";
import { AppSidebar } from "./app-sidebar";
import { BottomNav } from "./bottom-nav";
import { TopBar } from "./top-bar";
import { cn } from "@/lib/utils";
import { useRequireMember } from "@/lib/use-auth";

export function AppShell({
  title,
  eyebrow,
  action,
  children,
  className,
}: {
  title: string;
  eyebrow?: string | undefined;
  action?: ReactNode | undefined;
  children: ReactNode;
  className?: string | undefined;
}) {
  const { allowed } = useRequireMember();
  if (!allowed) return null;

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar title={title} eyebrow={eyebrow} action={action} />
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
