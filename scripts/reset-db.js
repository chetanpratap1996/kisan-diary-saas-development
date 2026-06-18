require('dotenv').config();
const { Pool } = require('pg');

async function resetDb() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:Piyush%403126@db.oqzrtgvzgnlgqoqaaumh.supabase.co:5432/postgres"
  });

  try {
    console.log("Dropping public schema cascade...");
    await pool.query('DROP SCHEMA public CASCADE;');
    console.log("Recreating public schema...");
    await pool.query('CREATE SCHEMA public;');
    console.log("Database reset successfully.");
  } catch (err) {
    console.error("Error resetting db:", err);
  } finally {
    await pool.end();
  }
}

resetDb();
