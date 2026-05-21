import { hashPassword } from "../src/lib/auth";
import { db } from "../src/db";
import { users } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const existing = await db.select().from(users).where(eq(users.role, "admin")).limit(1);
  if (existing.length > 0) {
    console.log("Admin already exists:", existing[0].username);
    process.exit(0);
  }
  const username = process.env.ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    console.error("ADMIN_PASSWORD env var not set");
    process.exit(1);
  }
  await db.insert(users).values({
    username,
    passwordHash: hashPassword(password),
    role: "admin",
  });
  console.log(`Admin created: ${username}`);
}

main();
