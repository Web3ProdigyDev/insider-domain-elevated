import type { ReactNode } from "react";
import { AppSidebar } from "./app-sidebar";
import { BottomNav } from "./bottom-nav";
import { TopBar } from "./top-bar";
import { cn } from "@/lib/utils";

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
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar title={title} eyebrow={eyebrow} action={action} />
        <main
          className={cn(
            "mx-auto w-full max-w-5xl flex-1 px-5 pb-28 pt-6 lg:px-10 lg:pb-16 lg:pt-8",
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
