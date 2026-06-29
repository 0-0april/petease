import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const getDatabaseConfig = () => {
  const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

  if (!connectionString) {
    console.warn('No database connection string configured. Set SUPABASE_DB_URL or DATABASE_URL.');
    return {
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    };
  }

  const normalizedConnectionString = connectionString
    .replace(/\?pgbouncer=true/i, '')
    .replace(/\?sslmode=require/i, '')
    .replace(/\&sslmode=require/i, '');

  return {
    connectionString: normalizedConnectionString,
    ssl: {
      rejectUnauthorized: false,
      require: true
    },
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
  };
};

const pool = new Pool(getDatabaseConfig());

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err.message);
});

const verifyDatabaseConnection = async () => {
  const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

  if (!connectionString) {
    console.warn('SUPABASE_DB_URL is not configured. Database-backed routes will fail until it is set.');
    return;
  }

  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('Supabase database connection verified.');
  } catch (error) {
    console.error('Supabase database connection failed:', error.message);
    console.error('This usually means the current network cannot reach the Supabase Postgres endpoint or the connection string is not valid for this environment.');
  }
};

verifyDatabaseConnection();

export default pool;
