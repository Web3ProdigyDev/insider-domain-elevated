import * as React from "react";
import { cn } from "@/lib/utils";

/** Solana mark on a dark disc, sized like the other coin logos. Inline so it
 * never depends on a remote image. */
export function SolanaLogo({
  size = 32,
  className,
}: {
  size?: number;
  className?: string | undefined;
}) {
  const gradientId = `sol-${React.useId().replace(/:/g, "")}`;
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-black",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 397.7 311.7"
        width={size * 0.56}
        role="img"
        aria-label="Solana logo"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id={gradientId}
            gradientUnits="userSpaceOnUse"
            x1="360.879"
            y1="351.455"
            x2="141.213"
            y2="-69.294"
          >
            <stop offset="0" stopColor="#00FFA3" />
            <stop offset="1" stopColor="#DC1FFF" />
          </linearGradient>
        </defs>
        <path
          fill={`url(#${gradientId})`}
          d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z"
        />
        <path
          fill={`url(#${gradientId})`}
          d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z"
        />
        <path
          fill={`url(#${gradientId})`}
          d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z"
        />
      </svg>
    </span>
  );
}
