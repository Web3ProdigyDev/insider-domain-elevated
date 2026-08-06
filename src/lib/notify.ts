import { toast as sonner } from "sonner";

/** Quiet, typeset notifications. No emoji, no color explosions. */
export const notify = {
  message: (title: string, description?: string) =>
    sonner(title, description ? { description } : undefined),
  success: (title: string, description?: string) =>
    sonner.success(title, description ? { description } : undefined),
  error: (title: string, description?: string) =>
    sonner.error(title, description ? { description } : undefined),
};
