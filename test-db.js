const { Client } = require('pg');

async function testConnection(url) {
  console.log('Testing', url);
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    console.log('Success!');
    const res = await client.query('SELECT NOW()');
    console.log('Time:', res.rows[0]);
  } catch (err) {
    console.error('Error connecting:', err.message);
  } finally {
    await client.end();
  }
}

testConnection('postgresql://postgres:Chintu9759%40@db.yshwiferhyavpppbgamf.supabase.co:5432/postgres').then(() => 
testConnection('postgresql://postgres:Chintu9759%40@db.yshwiferhyavpppbgamf.supabase.co:6543/postgres?pgbouncer=true')
);
