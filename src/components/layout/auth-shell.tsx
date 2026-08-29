import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import mark from "@/assets/insider-domain-mark.png.asset.json";

/** The Insider Domain monogram. One implementation, used everywhere. */
export function BrandMark({
  size = 40,
  className,
}: {
  size?: number;
  className?: string | undefined;
}) {
  return (
    <img
      src={mark.url}
      alt="Insider Domain"
      width={size}
      height={size}
      className={cn("shrink-0 rounded-xl object-contain", className)}
      style={{ width: size, height: size }}
    />
  );
}

/** Quiet, centred frame shared by every entrance screen. */
export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow?: string | undefined;
  title: string;
  description?: string | undefined;
  children: ReactNode;
  footer?: ReactNode | undefined;
}) {
  return (
    <div
      className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-4 py-8 sm:px-5 sm:py-12"
      style={{
        paddingTop: "max(3rem, env(safe-area-inset-top))",
        paddingBottom: "max(3rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="w-full max-w-md">
        <div className="mb-10 flex flex-col items-center text-center">
          <BrandMark size={56} />
          <p className="text-eyebrow mt-5">{eyebrow ?? "Insider Domain"}</p>
          <h1 className="mt-2 text-2xl font-medium tracking-[var(--tracking-tightest)] text-foreground">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>

        {children}

        {footer ? (
          <div className="mt-8 text-center text-sm text-muted-foreground">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
