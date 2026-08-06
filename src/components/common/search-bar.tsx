import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function SearchBar({
  value,
  onValueChange,
  placeholder = "Search",
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "value" | "onChange"> & {
  value?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
  className?: string | undefined;
}) {
  const [internal, setInternal] = React.useState("");
  const current = value ?? internal;

  const set = (next: string) => {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  };

  return (
    <div
      className={cn(
        "flex h-11 w-full items-center gap-2.5 rounded-full border border-border bg-surface px-4 transition-colors duration-300 ease-[var(--ease-luxe)] focus-within:border-border-strong",
        className,
      )}
    >
      <Search className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
      <input
        type="search"
        role="searchbox"
        value={current}
        onChange={(e) => set(e.target.value)}
        placeholder={placeholder}
        className="h-full w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70 [&::-webkit-search-cancel-button]:hidden"
        {...props}
      />
      {current ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => set("")}
          className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-4" strokeWidth={1.75} />
        </button>
      ) : null}
    </div>
  );
}
