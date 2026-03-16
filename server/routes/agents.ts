import { Response, Router } from 'express';
import pool from '../db.js';
import { authMiddleware, AuthRequest } from '../auth.js';
import { parseIntId, sendInvalidId } from '../validate.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT a.*, 
        (SELECT COUNT(*) FROM transactions t WHERE t.agent_id = a.id) as tx_count
       FROM agents a WHERE a.user_id = $1 ORDER BY a.created_at DESC`,
      [req.userId]
    );
    res.json({ agents: result.rows });
  } catch (err) {
    console.error('List agents error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, purpose, currency } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ error: 'Agent name is required' });
      return;
    }

    if (name.trim().length > 255) {
      res.status(400).json({ error: 'Agent name must be 255 characters or less' });
      return;
    }

    if (purpose !== undefined && typeof purpose !== 'string') {
      res.status(400).json({ error: 'Purpose must be a string' });
      return;
    }

    if (currency !== undefined && typeof currency !== 'string') {
      res.status(400).json({ error: 'Currency must be a string' });
      return;
    }

    const validCurrencies = ['USDC', 'SOL', 'ETH'];
    const agentCurrency = typeof currency === 'string' && validCurrencies.includes(currency) ? currency : 'USDC';

    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    const agentIdSlug = `${slug}_${Date.now().toString(36)}`;

    const result = await pool.query(
      `INSERT INTO agents (user_id, name, agent_id_slug, purpose, currency)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.userId, name.trim(), agentIdSlug, typeof purpose === 'string' ? purpose.trim() : '', agentCurrency]
    );

    res.status(201).json({ agent: result.rows[0] });
  } catch (err) {
    console.error('Create agent error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const agentId = parseIntId(req.params.id);
    if (!agentId) { sendInvalidId(res); return; }
    const id = agentId;
    const { name, status, purpose } = req.body;

    const existing = await pool.query(
      'SELECT * FROM agents WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );

    if (existing.rows.length === 0) {
      res.status(404).json({ error: 'Agent not found' });
      return;
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0 || name.trim().length > 255) {
        res.status(400).json({ error: 'Agent name must be between 1 and 255 characters' });
        return;
      }
      updates.push(`name = $${paramIndex++}`);
      values.push(name.trim());
    }

    if (status !== undefined) {
      const validStatuses = ['active', 'paused'];
      if (typeof status !== 'string' || !validStatuses.includes(status)) {
        res.status(400).json({ error: 'Status must be "active" or "paused"' });
        return;
      }
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
    }

    if (purpose !== undefined) {
      if (typeof purpose !== 'string') {
        res.status(400).json({ error: 'Purpose must be a string' });
        return;
      }
      updates.push(`purpose = $${paramIndex++}`);
      values.push(purpose.trim());
    }

    if (updates.length === 0) {
      res.status(400).json({ error: 'No valid fields to update' });
      return;
    }

    updates.push(`updated_at = NOW()`);
    values.push(id, req.userId);

    const result = await pool.query(
      `UPDATE agents SET ${updates.join(', ')} WHERE id = $${paramIndex++} AND user_id = $${paramIndex} RETURNING *`,
      values
    );

    res.json({ agent: result.rows[0] });
  } catch (err) {
    console.error('Update agent error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const agentId = parseIntId(req.params.id);
    if (!agentId) { sendInvalidId(res); return; }
    const id = agentId;

    const result = await pool.query(
      'DELETE FROM agents WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Agent not found' });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Delete agent error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const agentsRouter = router;
