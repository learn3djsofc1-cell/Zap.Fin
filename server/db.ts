import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS cards (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        card_number VARCHAR(19) NOT NULL,
        cvv VARCHAR(4) NOT NULL,
        expiry VARCHAR(5) NOT NULL,
        name VARCHAR(100) NOT NULL DEFAULT 'Virtual Card',
        frozen BOOLEAN NOT NULL DEFAULT FALSE,
        online_payments BOOLEAN NOT NULL DEFAULT TRUE,
        contactless BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS wallets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        address VARCHAR(100) NOT NULL,
        encrypted_private_key TEXT NOT NULL,
        confirmed BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id)
      );
    `);
    console.log('Database schema initialized');
  } finally {
    client.release();
  }
}

export { pool };
