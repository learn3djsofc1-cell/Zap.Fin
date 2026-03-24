import pool from './db.js';

export async function initializeDatabase(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS agents (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        agent_id_slug VARCHAR(100) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        purpose TEXT DEFAULT '',
        currency VARCHAR(10) NOT NULL DEFAULT 'USDC',
        balance NUMERIC(20, 2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, agent_id_slug)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        agent_id INTEGER REFERENCES agents(id) ON DELETE SET NULL,
        tx_hash VARCHAR(100) NOT NULL,
        recipient VARCHAR(255) NOT NULL,
        amount NUMERIC(20, 2) NOT NULL,
        currency VARCHAR(10) NOT NULL DEFAULT 'USDC',
        status VARCHAR(20) NOT NULL DEFAULT 'settled',
        latency_ms INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS policies (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        policy_id_slug VARCHAR(100) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        max_per_tx NUMERIC(20, 2) DEFAULT 0,
        daily_limit NUMERIC(20, 2) DEFAULT 0,
        monthly_limit NUMERIC(20, 2) DEFAULT 0,
        multi_sig BOOLEAN DEFAULT FALSE,
        multi_sig_threshold INTEGER DEFAULT 1,
        allowed_merchants TEXT[] DEFAULT '{}',
        allowed_currencies TEXT[] DEFAULT '{USDC}',
        assigned_agent_ids INTEGER[] DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, policy_id_slug)
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_agent_id ON transactions(agent_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_policies_user_id ON policies(user_id)
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        key_prefix VARCHAR(20) NOT NULL,
        key_hash VARCHAR(255) NOT NULL,
        label VARCHAR(255) NOT NULL DEFAULT '',
        environment VARCHAR(10) NOT NULL DEFAULT 'live',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_used_at TIMESTAMP WITH TIME ZONE,
        revoked_at TIMESTAMP WITH TIME ZONE
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id)
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS integrations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        provider VARCHAR(50) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'disconnected',
        config JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, provider)
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON integrations(user_id)
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS mix_operations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        send_coin VARCHAR(10) NOT NULL,
        receive_coin VARCHAR(10) NOT NULL,
        send_amount NUMERIC(30, 18) NOT NULL,
        receive_amount NUMERIC(30, 18) NOT NULL,
        exchange_rate NUMERIC(30, 18) NOT NULL DEFAULT 1,
        fee_percent NUMERIC(5, 2) NOT NULL DEFAULT 1.5,
        recipient_address VARCHAR(255) NOT NULL,
        privacy_level VARCHAR(20) NOT NULL DEFAULT 'standard',
        delay_minutes INTEGER NOT NULL DEFAULT 0,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        deposit_address VARCHAR(255),
        deposit_private_key_enc TEXT,
        tx_hash VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE
      )
    `);

    const hasOldCoinCol = await client.query(`
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'mix_operations' AND column_name = 'coin'
    `);
    if (hasOldCoinCol.rows.length > 0) {
      await client.query(`ALTER TABLE mix_operations RENAME COLUMN coin TO send_coin`);
      await client.query(`ALTER TABLE mix_operations RENAME COLUMN amount TO send_amount`);
      await client.query(`ALTER TABLE mix_operations ADD COLUMN IF NOT EXISTS receive_coin VARCHAR(10) NOT NULL DEFAULT 'ETH'`);
      await client.query(`ALTER TABLE mix_operations ADD COLUMN IF NOT EXISTS receive_amount NUMERIC(30, 18) NOT NULL DEFAULT 0`);
      await client.query(`ALTER TABLE mix_operations ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC(30, 18) NOT NULL DEFAULT 1`);
      await client.query(`ALTER TABLE mix_operations ADD COLUMN IF NOT EXISTS fee_percent NUMERIC(5, 2) NOT NULL DEFAULT 1.5`);
      await client.query(`
        UPDATE mix_operations
        SET receive_coin = send_coin, receive_amount = send_amount, exchange_rate = 1, fee_percent = 1.5
        WHERE receive_amount = 0
      `);
      console.log('Migrated mix_operations from single-coin to cross-asset schema');
    } else {
      await client.query(`ALTER TABLE mix_operations ADD COLUMN IF NOT EXISTS receive_coin VARCHAR(10) NOT NULL DEFAULT 'ETH'`);
      await client.query(`ALTER TABLE mix_operations ADD COLUMN IF NOT EXISTS receive_amount NUMERIC(30, 18) NOT NULL DEFAULT 0`);
      await client.query(`ALTER TABLE mix_operations ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC(30, 18) NOT NULL DEFAULT 1`);
      await client.query(`ALTER TABLE mix_operations ADD COLUMN IF NOT EXISTS fee_percent NUMERIC(5, 2) NOT NULL DEFAULT 1.5`);
    }

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_mix_operations_user_id ON mix_operations(user_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_mix_operations_status ON mix_operations(status)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_mix_operations_created_at ON mix_operations(created_at)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_mix_operations_user_status ON mix_operations(user_id, status)
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        contact_address VARCHAR(255) NOT NULL,
        last_message TEXT NOT NULL DEFAULT '',
        last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, contact_address)
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_conversations_last_msg ON conversations(user_id, last_message_at DESC)
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        sender VARCHAR(10) NOT NULL DEFAULT 'me',
        self_destruct_seconds INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(conversation_id, created_at)
    `);

    await client.query('COMMIT');
    console.log('Database schema initialized successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Failed to initialize database schema:', err);
    throw err;
  } finally {
    client.release();
  }
}
