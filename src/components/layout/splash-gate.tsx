import * as React from "react";
import { BrandMark } from "@/components/layout/auth-shell";
import { useAuth } from "@/lib/use-auth";

const KEY = "insider-domain.splash.v1";

/**
 * Entrance splash. Shown once per browser session while the shell settles.
 */
export function SplashGate({ children }: { children: React.ReactNode }) {
  const [showing, setShowing] = React.useState(false);
  const { ready } = useAuth();

  React.useEffect(() => {
    let seen = true;
    try {
      seen = window.sessionStorage.getItem(KEY) === "1";
    } catch {
      seen = true;
    }
    if (seen) return;
    setShowing(true);
    const startedAt = Date.now();
    let timer: number | undefined;
    const endSplash = () => {
      try {
        window.sessionStorage.setItem(KEY, "1");
      } catch {
        /* ignore */
      }
      setShowing(false);
    };
    const scheduleEnd = () => {
      const remaining = Math.max(0, 600 - (Date.now() - startedAt));
      timer = window.setTimeout(endSplash, remaining);
    };
    if (ready) scheduleEnd();
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [ready]);

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
