import { pgTable, serial, varchar, timestamp } from "drizzle-orm/pg-core";

export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 }).unique(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  divisi: varchar("divisi", { length: 255 }),
  jabatan: varchar("jabatan", { length: 255 }),
  noTelp: varchar("no_telp", { length: 50 }),
  photoUrl: varchar("photo_url", { length: 512 }),
  qrCodeUrl: varchar("qr_code_url", { length: 512 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: varchar("role", { length: 20 }).notNull().default("operator"),
  createdAt: timestamp("created_at").defaultNow(),
});
