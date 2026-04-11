import pool from './config/database.js';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('Connection string:', process.env.SUPABASE_DB_URL ? 'Set' : 'Not set');
    
    const result = await pool.query('SELECT NOW()');
    console.log('✓ Database connected successfully!');
    console.log('Current time from DB:', result.rows[0].now);
    
    const accountTest = await pool.query('SELECT COUNT(*) FROM "ACCOUNT"');
    console.log('✓ Found', accountTest.rows[0].count, 'accounts in database');
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Database connection failed:');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testConnection();
