import * as React from "react";
import { cn } from "@/lib/utils";
import { calculateAge, formatDob } from "@/lib/age";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const pad = (value: number) => String(value).padStart(2, "0");

function daysIn(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Wheel-style date of birth selector. Three coupled columns, no typing,
 * touch-friendly on mobile and keyboard navigable on desktop.
 */
export function DateOfBirthPicker({
  value,
  onChange,
  label = "Date of birth",
}: {
  /** ISO yyyy-mm-dd */
  value: string;
  onChange: (iso: string) => void;
  label?: string;
}) {
  const now = new Date();
  const parsed = value ? new Date(value) : null;
  const valid = parsed && !Number.isNaN(parsed.getTime());

  const year = valid ? parsed.getFullYear() : now.getFullYear() - 25;
  const month = valid ? parsed.getMonth() : 0;
  const day = valid ? parsed.getDate() : 1;

  const years = React.useMemo(() => {
    const first = now.getFullYear();
    return Array.from({ length: 96 }, (_, i) => first - i);
  }, [now]);

  const emit = (y: number, m: number, d: number) => {
    const clamped = Math.min(d, daysIn(y, m));
    onChange(`${y}-${pad(m + 1)}-${pad(clamped)}`);
  };

  const age = valid ? calculateAge(value) : null;

  return (
    <div className="w-full">
      <span className="text-eyebrow mb-2 block">{label}</span>
      <div className="rounded-2xl border border-border bg-surface p-2">
        <div className="grid grid-cols-3 gap-2">
          <Wheel
            ariaLabel="Day"
            items={Array.from({ length: daysIn(year, month) }, (_, i) => ({
              value: i + 1,
              label: pad(i + 1),
            }))}
            selected={day}
            onSelect={(d) => emit(year, month, d)}
          />
          <Wheel
            ariaLabel="Month"
            items={MONTHS.map((m, i) => ({ value: i, label: m.slice(0, 3) }))}
            selected={month}
            onSelect={(m) => emit(year, m, day)}
          />
          <Wheel
            ariaLabel="Year"
            items={years.map((y) => ({ value: y, label: String(y) }))}
            selected={year}
            onSelect={(y) => emit(y, month, day)}
          />
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {valid ? `${formatDob(value)} · ${age} years` : "Select your date of birth"}
      </p>
    </div>
  );
}

function Wheel({
  items,
  selected,
  onSelect,
  ariaLabel,
}: {
  items: { value: number; label: string }[];
  selected: number;
  onSelect: (value: number) => void;
  ariaLabel: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const node = ref.current?.querySelector<HTMLElement>('[data-selected="true"]');
    node?.scrollIntoView({ block: "center" });
  }, [selected]);

  return (
    <div
      ref={ref}
      role="listbox"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={(e) => {
        const index = items.findIndex((i) => i.value === selected);
        if (e.key === "ArrowDown" || e.key === "ArrowRight") {
          e.preventDefault();
          onSelect(items[Math.min(items.length - 1, index + 1)]!.value);
        }
        if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
          e.preventDefault();
          onSelect(items[Math.max(0, index - 1)]!.value);
        }
      }}
      className="h-40 overflow-y-auto rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{ scrollbarWidth: "none" }}
    >
      <ul className="py-14">
        {items.map((item) => {
          const active = item.value === selected;
          return (
            <li key={item.value}>
              <button
                type="button"
                role="option"
                aria-selected={active}
                data-selected={active}
                onClick={() => onSelect(item.value)}
                className={cn(
                  "numeric block w-full rounded-lg py-1.5 text-center text-sm transition-colors duration-200 ease-[var(--ease-luxe)]",
                  active
                    ? "bg-gold-muted text-gold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
