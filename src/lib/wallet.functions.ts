import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { desc, eq } from "drizzle-orm";
import { auth } from "./auth";
import { db } from "./db";
import { transactions, walletBalances } from "./wallet-schema";

async function getUserId() {
  const session = await auth.api.getSession({ headers: getRequestHeaders() });
  if (!session?.user) throw new Error("Unauthorized");
  return session.user.id;
}

export const getWalletData = createServerFn({ method: "GET" }).handler(async () => {
  const userId = await getUserId();
  const [balances, activity] = await Promise.all([
    db.select().from(walletBalances).where(eq(walletBalances.userId, userId)),
    db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(25),
  ]);
  return { balances, activity };
});

export const recordWalletTransaction = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      type: string;
      assetId: string;
      amount: string;
      metadata?: Record<string, unknown>;
    }) => input,
  )
  .handler(async ({ data }) => {
    const userId = await getUserId();
    const id = crypto.randomUUID();
    await db.insert(transactions).values({
      id,
      userId,
      type: data.type,
      assetId: data.assetId,
      amount: data.amount,
      metadata: data.metadata ?? {},
      status: "pending",
    });
    return { id };
  });
