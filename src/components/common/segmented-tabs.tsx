import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export const SegmentedTabs = TabsPrimitive.Root;

export function SegmentedTabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-surface p-1",
        className,
      )}
      {...props}
    />
  );
}

export function SegmentedTabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "rounded-full px-4 py-1.5 text-[0.8125rem] text-muted-foreground transition-colors duration-300 ease-[var(--ease-luxe)] outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "data-[state=active]:bg-surface-raised data-[state=active]:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function SegmentedTabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn("mt-6 animate-[var(--animate-fade)] outline-none", className)}
      {...props}
    />
  );
}
