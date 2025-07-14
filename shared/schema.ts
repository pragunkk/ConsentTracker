import { pgTable, text, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const consentRecords = pgTable("consent_records", {
  id: serial("id").primaryKey(),
  documentName: text("document_name").notNull(),
  dataAccessed: text("data_accessed").notNull(),
  hostUserId: serial("host_user_id").references(() => users.id),
  hostUserName: text("host_user_name").notNull(),
  guestUserId: serial("guest_user_id").references(() => users.id),
  guestUserName: text("guest_user_name").notNull(),
  accessDate: timestamp("access_date").notNull(),
  expiryDate: timestamp("expiry_date").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, expiring, expired
  accessLevel: text("access_level").notNull().default("read"),
  purpose: text("purpose"),
  documentSize: text("document_size"),
  documentType: text("document_type"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertConsentSchema = createInsertSchema(consentRecords).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertConsentRecord = z.infer<typeof insertConsentSchema>;
export type ConsentRecord = typeof consentRecords.$inferSelect;
