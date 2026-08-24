import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { and, desc, eq, isNull } from "drizzle-orm";

import { auth } from "./auth";
import { db } from "./db";
import { notifications } from "./wallet-schema";

async function getUserId() {
  const session = await auth.api.getSession({ headers: getRequestHeaders() });
  if (!session?.user) throw new Error("Unauthorized");
  return session.user.id;
}

export const getNotifications = createServerFn({ method: "GET" }).handler(async () => {
  const userId = await getUserId();
  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(50);
  return rows.map((row) => ({
    ...row,
    read: row.readAt !== null,
    createdAt: row.createdAt.getTime(),
  }));
});

export const markAllNotificationsRead = createServerFn({ method: "POST" }).handler(async () => {
  const userId = await getUserId();
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
  return { ok: true };
});
