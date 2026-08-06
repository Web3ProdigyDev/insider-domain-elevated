import * as React from "react";
import { cn } from "@/lib/utils";

type InputProps = React.ComponentProps<"input"> & {
  label?: string;
  hint?: string;
  error?: string;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
};

function Input({ className, type, label, hint, error, icon, trailing, id, ...props }: InputProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;

  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={inputId} className="text-eyebrow mb-2 block">
          {label}
        </label>
      ) : null}
      <div
        className={cn(
          "flex h-11 items-center gap-2.5 rounded-xl border border-border bg-surface px-3.5 transition-colors duration-300 ease-[var(--ease-luxe)] focus-within:border-border-strong focus-within:ring-2 focus-within:ring-ring",
          error && "border-destructive/50 focus-within:ring-destructive/30",
          className,
        )}
      >
        {icon ? <span className="text-muted-foreground [&_svg]:size-4">{icon}</span> : null}
        <input
          id={inputId}
          type={type}
          data-slot="input"
          className="h-full w-full min-w-0 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70 disabled:opacity-40"
          aria-invalid={error ? true : undefined}
          {...props}
        />
        {trailing ? <span className="shrink-0 text-muted-foreground">{trailing}</span> : null}
      </div>
      {error ? (
        <p className="mt-2 text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export { Input };
