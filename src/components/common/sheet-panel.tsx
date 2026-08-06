import type { ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

/**
 * Sheet: bottom drawer on mobile, right-side panel on desktop.
 */
export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  trigger,
  className,
}: {
  open?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  title: string;
  description?: string | undefined;
  children?: ReactNode | undefined;
  footer?: ReactNode | undefined;
  trigger?: ReactNode | undefined;
  className?: string | undefined;
}) {
  return (
    <DialogPrimitive.Root
      {...(open !== undefined ? { open } : {})}
      {...(onOpenChange ? { onOpenChange } : {})}
    >
      {trigger ? <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger> : null}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 max-h-[88vh] overflow-y-auto rounded-t-3xl border border-border bg-popover p-6 shadow-[var(--shadow-lifted)] duration-300",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
            "sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[420px] sm:rounded-none sm:rounded-l-3xl sm:data-[state=open]:slide-in-from-right sm:data-[state=closed]:slide-out-to-right",
            className,
          )}
        >
          <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-border-strong sm:hidden" />
          <DialogPrimitive.Title className="text-base font-medium tracking-tight text-foreground">
            {title}
          </DialogPrimitive.Title>
          {description ? (
            <DialogPrimitive.Description className="mt-1.5 text-sm text-muted-foreground">
              {description}
            </DialogPrimitive.Description>
          ) : null}
          <div className="mt-6">{children}</div>
          {footer ? <div className="mt-6 flex gap-3">{footer}</div> : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
