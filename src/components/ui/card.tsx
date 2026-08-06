import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-2xl transition-colors duration-300 ease-[var(--ease-luxe)]",
  {
    variants: {
      variant: {
        default: "border border-border bg-card",
        raised: "border border-border bg-surface-raised shadow-[var(--shadow-soft)]",
        quiet: "border border-transparent bg-surface",
        outline: "border border-border bg-transparent",
      },
      interactive: {
        true: "cursor-pointer hover:border-border-strong hover:bg-surface-raised",
        false: "",
      },
      padding: {
        none: "",
        sm: "p-4",
        default: "p-5",
        lg: "p-6 sm:p-8",
      },
    },
    defaultVariants: { variant: "default", interactive: false, padding: "default" },
  },
);

function Card({
  className,
  variant,
  interactive,
  padding,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  return (
    <div
      data-slot="card"
      className={cn(cardVariants({ variant, interactive, padding, className }))}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mb-4 flex items-start justify-between gap-4", className)} {...props} />;
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      className={cn("text-base font-medium tracking-tight text-foreground", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mt-5 flex items-center gap-3 border-t border-border pt-4", className)}
      {...props}
    />
  );
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants };
