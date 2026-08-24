import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as walletSchema from "./wallet-schema";

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema: walletSchema });
