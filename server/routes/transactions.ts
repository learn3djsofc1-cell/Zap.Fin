import { Response, Router } from 'express';
import pool from '../db.js';
import { authMiddleware, AuthRequest } from '../auth.js';
import crypto from 'crypto';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, status, limit = '50', offset = '0' } = req.query;

    const conditions: string[] = ['t.user_id = $1'];
    const values: any[] = [req.userId];
    let paramIndex = 2;

    if (status && typeof status === 'string' && status !== 'all') {
      const validStatuses = ['settled', 'pending', 'blocked', 'failed'];
      if (validStatuses.includes(status)) {
        conditions.push(`t.status = $${paramIndex++}`);
        values.push(status);
      }
    }

    if (search && typeof search === 'string' && search.trim().length > 0) {
      const searchTerm = `%${search.trim().slice(0, 100)}%`;
      conditions.push(`(t.tx_hash ILIKE $${paramIndex} OR t.recipient ILIKE $${paramIndex} OR a.name ILIKE $${paramIndex})`);
      values.push(searchTerm);
      paramIndex++;
    }

    const limitNum = Math.min(Math.max(parseInt(limit as string, 10) || 50, 1), 100);
    const offsetNum = Math.max(parseInt(offset as string, 10) || 0, 0);

    values.push(limitNum, offsetNum);

    const result = await pool.query(
      `SELECT t.*, a.name as agent_name, a.agent_id_slug
       FROM transactions t
       LEFT JOIN agents a ON t.agent_id = a.id AND a.user_id = t.user_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY t.created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      values
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM transactions t
       LEFT JOIN agents a ON t.agent_id = a.id AND a.user_id = t.user_id
       WHERE ${conditions.join(' AND ')}`,
      values.slice(0, -2)
    );

    res.json({
      transactions: result.rows,
      total: parseInt(countResult.rows[0].count, 10),
      limit: limitNum,
      offset: offsetNum,
    });
  } catch (err) {
    console.error('List transactions error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { agentId, recipient, amount, currency, status, latencyMs } = req.body;

    if (!recipient || typeof recipient !== 'string' || recipient.trim().length === 0) {
      res.status(400).json({ error: 'Recipient is required' });
      return;
    }

    if (amount === undefined || amount === null || isNaN(Number(amount)) || Number(amount) <= 0) {
      res.status(400).json({ error: 'Amount must be a positive number' });
      return;
    }

    if (Number(amount) > 999999999) {
      res.status(400).json({ error: 'Amount exceeds maximum allowed value' });
      return;
    }

    if (agentId) {
      const agentCheck = await pool.query(
        'SELECT id FROM agents WHERE id = $1 AND user_id = $2',
        [agentId, req.userId]
      );
      if (agentCheck.rows.length === 0) {
        res.status(400).json({ error: 'Agent not found' });
        return;
      }
    }

    const validCurrencies = ['USDC', 'SOL', 'ETH'];
    const txCurrency = currency && validCurrencies.includes(currency) ? currency : 'USDC';

    const validStatuses = ['settled', 'pending', 'blocked', 'failed'];
    const txStatus = status && validStatuses.includes(status) ? status : 'settled';

    const txHash = `tx_${crypto.randomBytes(8).toString('hex')}`;
    const txLatency = latencyMs !== undefined ? Math.max(0, Math.min(parseInt(latencyMs, 10) || 0, 99999)) : Math.floor(Math.random() * 300) + 100;

    const result = await pool.query(
      `INSERT INTO transactions (user_id, agent_id, tx_hash, recipient, amount, currency, status, latency_ms)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [req.userId, agentId || null, txHash, recipient.trim(), Number(amount), txCurrency, txStatus, txLatency]
    );

    res.status(201).json({ transaction: result.rows[0] });
  } catch (err) {
    console.error('Create transaction error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const transactionsRouter = router;
