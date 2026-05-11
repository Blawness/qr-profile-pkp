import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function createDb() {
  const sql = neon(process.env.DATABASE_URL!);
  return drizzle(sql, { schema });
}

type DrizzleClient = ReturnType<typeof createDb>;

let _db: DrizzleClient | null = null;

function getDb(): DrizzleClient {
  if (!_db) {
    _db = createDb();
  }
  return _db;
}

export const db = new Proxy({} as DrizzleClient, {
  get(_, prop) {
    return Reflect.get(getDb(), prop);
  },
});
