require('dotenv').config();
const { Pool } = require('pg');

async function checkUser() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const res = await pool.query("SELECT * FROM users WHERE phone = $1", ["8077170715"]);
    console.log(res.rows);
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
checkUser();
