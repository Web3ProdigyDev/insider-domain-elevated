import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium tracking-tight transition-all duration-300 ease-[var(--ease-luxe)] outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.985]",
  {
    variants: {
      variant: {
        // 1. Primary — solid light on obsidian
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        // 2. Secondary — hairline outline
        secondary:
          "border border-border-strong bg-transparent text-foreground hover:bg-surface-raised",
        // 3. Ghost — text only
        ghost: "bg-transparent text-muted-foreground hover:text-foreground hover:bg-surface",
        // Restrained accent, used once per screen at most
        gold: "bg-gold-muted text-gold border border-gold/25 hover:bg-gold/20",
        destructive: "bg-transparent border border-destructive/40 text-destructive hover:bg-destructive/10",
      },
      size: {
        sm: "h-8 px-3.5 text-[0.8125rem]",
        default: "h-10 px-5",
        lg: "h-12 px-7 text-[0.9375rem]",
        icon: "size-10 rounded-full",
        "icon-sm": "size-8 rounded-full",
      },
      full: { true: "w-full", false: "" },
    },
    defaultVariants: { variant: "primary", size: "default", full: false },
  },
);

function Button({
  className,
  variant,
  size,
  full,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, full, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
