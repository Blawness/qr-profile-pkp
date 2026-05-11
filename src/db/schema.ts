import { pgTable, serial, varchar, timestamp } from "drizzle-orm/pg-core";

export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 36 }).unique(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  photoUrl: varchar("photo_url", { length: 512 }),
  qrCodeUrl: varchar("qr_code_url", { length: 512 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
