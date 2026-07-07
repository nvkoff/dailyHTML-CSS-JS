import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

let _db: Db | null = null;

export function getDb(): Db {
  if (_db) return _db;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const sql = neon(connectionString);
  _db = drizzle(sql, { schema });
  return _db;
}

export const db = new Proxy({} as Db, {
  get(_target, prop) {
    return Reflect.get(getDb(), prop);
  },
});
