import { numeric, pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const walletBalances = pgTable("wallet_balances", {
  userId: text("userId").notNull(),
  assetId: text("assetId").notNull(),
  amount: numeric("amount").notNull().default("0"),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull(),
  type: text("type").notNull(),
  assetId: text("assetId").notNull(),
  amount: numeric("amount").notNull(),
  status: text("status").notNull().default("pending"),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
});
