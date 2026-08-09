import * as React from "react";
import { BrandMark } from "@/components/layout/auth-shell";

const KEY = "insider-domain.splash.v1";

/**
 * Entrance splash. Shown once per browser session while the shell settles.
 */
export function SplashGate({ children }: { children: React.ReactNode }) {
  const [showing, setShowing] = React.useState(false);

  React.useEffect(() => {
    let seen = true;
    try {
      seen = window.sessionStorage.getItem(KEY) === "1";
    } catch {
      seen = true;
    }
    if (seen) return;
    setShowing(true);
    const timer = window.setTimeout(() => {
      try {
        window.sessionStorage.setItem(KEY, "1");
      } catch {
        /* ignore */
      }
      setShowing(false);
    }, 1500);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      {children}
      {showing ? (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-background">
          <div className="flex flex-col items-center">
            <BrandMark size={72} className="animate-in fade-in zoom-in-95 duration-700" />
            <p className="text-eyebrow mt-6 animate-in fade-in duration-1000">Insider Domain</p>
            <span className="mt-8 h-px w-24 overflow-hidden bg-border">
              <span className="block h-px w-1/2 bg-gold" />
            </span>
          </div>
        </div>
      ) : null}
    </>
  );
}
