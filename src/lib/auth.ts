import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  const verify = scryptSync(password, salt!, 64);
  const storedBuf = Buffer.from(hash!, "hex");
  return timingSafeEqual(verify, storedBuf);
}

export async function seedAdmin(): Promise<void> {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.role, "admin"))
    .limit(1);

  if (existing.length > 0) return;

  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || "admin123";

  await db.insert(users).values({
    username,
    passwordHash: hashPassword(password),
    role: "admin",
  });
}

export type UserRole = "admin" | "operator";
