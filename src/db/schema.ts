import {
  pgTable,
  text,
  varchar,
  real,
  integer,
  timestamp,
  boolean,
  serial,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const languageEnum = pgEnum("language", ["hi", "en", "mr", "pa", "te", "ta"]);
export const seasonStatusEnum = pgEnum("season_status", ["active", "completed", "archived"]);
export const activityTypeEnum = pgEnum("activity_type", ["sowing", "irrigation", "spray", "harvest", "majdoor", "other"]);
export const expenseCategoryEnum = pgEnum("expense_category", ["seeds", "fertilizers", "pesticides", "diesel", "labor", "tractor_rent", "irrigation_cost", "machinary", "other"]);
export const harvestUnitEnum = pgEnum("harvest_unit", ["quintal", "kg", "ton"]);

// New Enums for Pillars
export const incomeCategoryEnum = pgEnum("income_category", ["crop_sales", "subsidy", "milk", "animal_husbandry", "other"]);
export const borrowingTypeEnum = pgEnum("borrowing_type", ["given", "taken"]);
export const borrowingStatusEnum = pgEnum("borrowing_status", ["pending", "settled"]);
export const inventoryUnitEnum = pgEnum("inventory_unit", ["kg", "liter", "bag", "unit"]);
export const inventoryCategoryEnum = pgEnum("inventory_category", ["seed", "fertilizer", "pesticide", "other"]);

// Users
export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  phone: varchar("phone", { length: 15 }).unique(),
  username: varchar("username", { length: 30 }).unique(),
  passwordHash: text("password_hash"),
  name: varchar("name", { length: 100 }).notNull(),
  state: varchar("state", { length: 50 }).notNull(),
  district: varchar("district", { length: 100 }),
  village: varchar("village", { length: 100 }),
  pincode: varchar("pincode", { length: 6 }),
  pmKisanId: varchar("pm_kisan_id", { length: 50 }),
  language: languageEnum("language").default("hi").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// OTP Store
export const otpStore = pgTable("otp_store", {
  id: serial("id").primaryKey(),
  phone: varchar("phone", { length: 15 }).notNull(),
  otp: varchar("otp", { length: 6 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  verified: boolean("verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Sessions
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Farms
export const farms = pgTable("farms", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  sizeAcre: real("size_acre").notNull(),
  location: varchar("location", { length: 200 }).notNull(),
  landType: varchar("land_type", { length: 50 }),       // owned / leased / ancestral
  irrigationSource: varchar("irrigation_source", { length: 50 }), // borewell / canal / rain-fed / drip
  soilType: varchar("soil_type", { length: 50 }),       // black / red / sandy / clay
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Seasons
export const seasons = pgTable("seasons", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  farmId: text("farm_id").notNull().references(() => farms.id, { onDelete: "cascade" }),
  cropName: varchar("crop_name", { length: 100 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: seasonStatusEnum("status").default("active").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Activity Logs (Pillar 3)
export const activityLogs = pgTable("activity_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  seasonId: text("season_id").notNull().references(() => seasons.id, { onDelete: "cascade" }),
  date: timestamp("date").defaultNow().notNull(),
  activityType: activityTypeEnum("activity_type").notNull(),
  note: text("note"),
  photoUrl: text("photo_url"),
  workers: integer("workers"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Expenses (Pillar 1)
export const expenses = pgTable("expenses", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  farmId: text("farm_id").notNull().references(() => farms.id, { onDelete: "cascade" }),
  seasonId: text("season_id").references(() => seasons.id, { onDelete: "cascade" }), // Optional for general farm expenses
  date: timestamp("date").defaultNow().notNull(),
  category: expenseCategoryEnum("category").notNull(),
  amount: real("amount").notNull(),
  description: text("description"),
  receiptUrl: text("receipt_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Incomes (Pillar 2)
export const incomes = pgTable("incomes", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  farmId: text("farm_id").notNull().references(() => farms.id, { onDelete: "cascade" }),
  seasonId: text("season_id").references(() => seasons.id, { onDelete: "cascade" }), // Optional for things like Milk
  date: timestamp("date").defaultNow().notNull(),
  category: incomeCategoryEnum("category").notNull(),
  amount: real("amount").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Borrowings (Pillar 4)
export const borrowings = pgTable("borrowings", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: borrowingTypeEnum("type").notNull(), // given vs taken
  counterpartyName: varchar("counterparty_name", { length: 100 }).notNull(),
  amount: real("amount").notNull(),
  interestRate: real("interest_rate").default(0), // percentage
  dueDate: timestamp("due_date"),
  status: borrowingStatusEnum("status").default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Inventory (Pillar 5)
export const inventory = pgTable("inventory", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  farmId: text("farm_id").notNull().references(() => farms.id, { onDelete: "cascade" }),
  itemName: varchar("item_name", { length: 100 }).notNull(),
  category: inventoryCategoryEnum("category").notNull(),
  quantity: real("quantity").notNull(),
  unit: inventoryUnitEnum("unit").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Legacy Harvests (Kept for compatibility, though Income covers general crop sales)
export const harvests = pgTable("harvests", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  seasonId: text("season_id").notNull().references(() => seasons.id, { onDelete: "cascade" }),
  date: timestamp("date").defaultNow().notNull(),
  quantity: real("quantity").notNull(),
  unit: harvestUnitEnum("unit").notNull(),
  pricePerUnit: real("price_per_unit").notNull(),
  totalIncome: real("total_income").notNull(),
  buyerName: varchar("buyer_name", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  farms: many(farms),
  sessions: many(sessions),
  borrowings: many(borrowings),
}));

export const farmsRelations = relations(farms, ({ one, many }) => ({
  user: one(users, { fields: [farms.userId], references: [users.id] }),
  seasons: many(seasons),
  expenses: many(expenses),
  incomes: many(incomes),
  inventory: many(inventory),
}));

export const seasonsRelations = relations(seasons, ({ one, many }) => ({
  farm: one(farms, { fields: [seasons.farmId], references: [farms.id] }),
  activityLogs: many(activityLogs),
  expenses: many(expenses),
  incomes: many(incomes),
  harvests: many(harvests),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  season: one(seasons, { fields: [activityLogs.seasonId], references: [seasons.id] }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  farm: one(farms, { fields: [expenses.farmId], references: [farms.id] }),
  season: one(seasons, { fields: [expenses.seasonId], references: [seasons.id] }),
}));

export const incomesRelations = relations(incomes, ({ one }) => ({
  farm: one(farms, { fields: [incomes.farmId], references: [farms.id] }),
  season: one(seasons, { fields: [incomes.seasonId], references: [seasons.id] }),
}));

export const borrowingsRelations = relations(borrowings, ({ one }) => ({
  user: one(users, { fields: [borrowings.userId], references: [users.id] }),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  farm: one(farms, { fields: [inventory.farmId], references: [farms.id] }),
}));

export const harvestsRelations = relations(harvests, ({ one }) => ({
  season: one(seasons, { fields: [harvests.seasonId], references: [seasons.id] }),
}));

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Farm = typeof farms.$inferSelect;
export type NewFarm = typeof farms.$inferInsert;
export type Season = typeof seasons.$inferSelect;
export type NewSeason = typeof seasons.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
export type Income = typeof incomes.$inferSelect;
export type NewIncome = typeof incomes.$inferInsert;
export type Borrowing = typeof borrowings.$inferSelect;
export type NewBorrowing = typeof borrowings.$inferInsert;
export type InventoryItem = typeof inventory.$inferSelect;
export type NewInventoryItem = typeof inventory.$inferInsert;
export type Harvest = typeof harvests.$inferSelect;
export type NewHarvest = typeof harvests.$inferInsert;
export type Session = typeof sessions.$inferSelect;
