require('dotenv').config();
const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');
const { pgTable, text, varchar, timestamp, boolean, pgEnum } = require('drizzle-orm/pg-core');
const { SignJWT } = require('jose');

const languageEnum = pgEnum("language", ["hi", "en", "mr", "pa", "te", "ta"]);

const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  phone: varchar("phone", { length: 15 }).unique(),
  username: varchar("username", { length: 30 }).unique(),
  passwordHash: text("password_hash"),
  name: varchar("name", { length: 100 }).notNull(),
  state: varchar("state", { length: 50 }).notNull(),
  language: languageEnum("language").default("hi").notNull(),
});

const sessions = pgTable("sessions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);
  
  try {
    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "kisan-diary-secret-key-2024-secure");
    
    console.log("Inserting user...");
    const [newUser] = await db.insert(users).values({
      id: crypto.randomUUID(),
      phone: "9999999123",
      username: "ph_9999999123",
      passwordHash: "test",
      name: "किसान भाई",
      state: "India",
      language: "hi"
    }).returning();
    
    console.log('Inserted user:', newUser);

    const token = await new SignJWT({ userId: newUser.id, phone: newUser.phone })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(JWT_SECRET);
      
    const sessionExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    
    console.log("Inserting session...");
    await db.insert(sessions).values({ userId: newUser.id, token, expiresAt: sessionExpiry });
    console.log("Session inserted!");

    await db.delete(users).where(require('drizzle-orm').eq(users.phone, "9999999123"));
    console.log("Cleanup done.");
  } catch (err) {
    console.error('Error:', err);
    await db.delete(users).where(require('drizzle-orm').eq(users.phone, "9999999123")).catch(() => {});
  } finally {
    pool.end();
  }
}

main();
