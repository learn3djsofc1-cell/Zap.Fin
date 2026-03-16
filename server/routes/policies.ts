import { Response, Router } from 'express';
import pool from '../db.js';
import { authMiddleware, AuthRequest } from '../auth.js';
import { parseIntId, sendInvalidId } from '../validate.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT * FROM policies WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json({ policies: result.rows });
  } catch (err) {
    console.error('List policies error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      maxPerTx,
      dailyLimit,
      monthlyLimit,
      multiSig,
      multiSigThreshold,
      allowedMerchants,
      allowedCurrencies,
      assignedAgentIds,
    } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ error: 'Policy name is required' });
      return;
    }

    if (name.trim().length > 255) {
      res.status(400).json({ error: 'Policy name must be 255 characters or less' });
      return;
    }

    if (maxPerTx !== undefined && (isNaN(Number(maxPerTx)) || Number(maxPerTx) < 0)) {
      res.status(400).json({ error: 'Max per transaction must be a non-negative number' });
      return;
    }

    if (dailyLimit !== undefined && (isNaN(Number(dailyLimit)) || Number(dailyLimit) < 0)) {
      res.status(400).json({ error: 'Daily limit must be a non-negative number' });
      return;
    }

    if (monthlyLimit !== undefined && (isNaN(Number(monthlyLimit)) || Number(monthlyLimit) < 0)) {
      res.status(400).json({ error: 'Monthly limit must be a non-negative number' });
      return;
    }

    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    const policyIdSlug = `${slug}_${Date.now().toString(36)}`;

    const validCurrencies = ['USDC', 'SOL', 'ETH', 'USDT'];
    const currencies = Array.isArray(allowedCurrencies)
      ? allowedCurrencies.filter((c: string) => validCurrencies.includes(c))
      : ['USDC'];

    const merchants = Array.isArray(allowedMerchants)
      ? allowedMerchants.filter((m: string) => typeof m === 'string' && m.trim().length > 0).map((m: string) => m.trim())
      : [];

    if (assignedAgentIds !== undefined && !Array.isArray(assignedAgentIds)) {
      res.status(400).json({ error: 'Assigned agent IDs must be an array' });
      return;
    }

    if (Array.isArray(assignedAgentIds)) {
      if (!assignedAgentIds.every((id: any) => typeof id === 'number' && Number.isInteger(id) && id > 0)) {
        res.status(400).json({ error: 'Assigned agent IDs must be positive integers' });
        return;
      }
      if (assignedAgentIds.length > 0) {
        const agentCheck = await pool.query(
          'SELECT id FROM agents WHERE id = ANY($1) AND user_id = $2',
          [assignedAgentIds, req.userId]
        );
        if (agentCheck.rows.length !== assignedAgentIds.length) {
          res.status(400).json({ error: 'One or more assigned agents not found' });
          return;
        }
      }
    }

    const result = await pool.query(
      `INSERT INTO policies (user_id, name, policy_id_slug, max_per_tx, daily_limit, monthly_limit, multi_sig, multi_sig_threshold, allowed_merchants, allowed_currencies, assigned_agent_ids)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        req.userId,
        name.trim(),
        policyIdSlug,
        Number(maxPerTx) || 0,
        Number(dailyLimit) || 0,
        Number(monthlyLimit) || 0,
        Boolean(multiSig),
        Math.max(1, parseInt(multiSigThreshold, 10) || 1),
        merchants,
        currencies,
        Array.isArray(assignedAgentIds) ? assignedAgentIds : [],
      ]
    );

    res.status(201).json({ policy: result.rows[0] });
  } catch (err) {
    console.error('Create policy error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const policyId = parseIntId(req.params.id);
    if (!policyId) { sendInvalidId(res); return; }
    const id = policyId;
    const {
      name, status, maxPerTx, dailyLimit, monthlyLimit,
      multiSig, multiSigThreshold, allowedMerchants, allowedCurrencies, assignedAgentIds,
    } = req.body;

    const existing = await pool.query(
      'SELECT * FROM policies WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );

    if (existing.rows.length === 0) {
      res.status(404).json({ error: 'Policy not found' });
      return;
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0 || name.trim().length > 255) {
        res.status(400).json({ error: 'Policy name must be between 1 and 255 characters' });
        return;
      }
      updates.push(`name = $${paramIndex++}`);
      values.push(name.trim());
    }

    if (status !== undefined) {
      const validStatuses = ['active', 'paused'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({ error: 'Status must be "active" or "paused"' });
        return;
      }
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
    }

    if (maxPerTx !== undefined) {
      if (isNaN(Number(maxPerTx)) || Number(maxPerTx) < 0) {
        res.status(400).json({ error: 'Max per transaction must be a non-negative number' });
        return;
      }
      updates.push(`max_per_tx = $${paramIndex++}`);
      values.push(Number(maxPerTx));
    }

    if (dailyLimit !== undefined) {
      if (isNaN(Number(dailyLimit)) || Number(dailyLimit) < 0) {
        res.status(400).json({ error: 'Daily limit must be a non-negative number' });
        return;
      }
      updates.push(`daily_limit = $${paramIndex++}`);
      values.push(Number(dailyLimit));
    }

    if (monthlyLimit !== undefined) {
      if (isNaN(Number(monthlyLimit)) || Number(monthlyLimit) < 0) {
        res.status(400).json({ error: 'Monthly limit must be a non-negative number' });
        return;
      }
      updates.push(`monthly_limit = $${paramIndex++}`);
      values.push(Number(monthlyLimit));
    }

    if (multiSig !== undefined) {
      updates.push(`multi_sig = $${paramIndex++}`);
      values.push(Boolean(multiSig));
    }

    if (multiSigThreshold !== undefined) {
      updates.push(`multi_sig_threshold = $${paramIndex++}`);
      values.push(Math.max(1, parseInt(multiSigThreshold, 10) || 1));
    }

    if (allowedMerchants !== undefined) {
      if (!Array.isArray(allowedMerchants)) {
        res.status(400).json({ error: 'Allowed merchants must be an array' });
        return;
      }
      updates.push(`allowed_merchants = $${paramIndex++}`);
      values.push(allowedMerchants.filter((m: string) => typeof m === 'string').map((m: string) => m.trim()));
    }

    if (allowedCurrencies !== undefined) {
      const validCurrencies = ['USDC', 'SOL', 'ETH', 'USDT'];
      if (!Array.isArray(allowedCurrencies)) {
        res.status(400).json({ error: 'Allowed currencies must be an array' });
        return;
      }
      updates.push(`allowed_currencies = $${paramIndex++}`);
      values.push(allowedCurrencies.filter((c: string) => validCurrencies.includes(c)));
    }

    if (assignedAgentIds !== undefined) {
      if (!Array.isArray(assignedAgentIds)) {
        res.status(400).json({ error: 'Assigned agent IDs must be an array' });
        return;
      }
      if (!assignedAgentIds.every((id: any) => typeof id === 'number' && Number.isInteger(id) && id > 0)) {
        res.status(400).json({ error: 'Assigned agent IDs must be positive integers' });
        return;
      }
      if (assignedAgentIds.length > 0) {
        const agentCheck = await pool.query(
          'SELECT id FROM agents WHERE id = ANY($1) AND user_id = $2',
          [assignedAgentIds, req.userId]
        );
        if (agentCheck.rows.length !== assignedAgentIds.length) {
          res.status(400).json({ error: 'One or more assigned agents not found' });
          return;
        }
      }
      updates.push(`assigned_agent_ids = $${paramIndex++}`);
      values.push(assignedAgentIds);
    }

    if (updates.length === 0) {
      res.status(400).json({ error: 'No valid fields to update' });
      return;
    }

    updates.push(`updated_at = NOW()`);
    values.push(id, req.userId);

    const result = await pool.query(
      `UPDATE policies SET ${updates.join(', ')} WHERE id = $${paramIndex++} AND user_id = $${paramIndex} RETURNING *`,
      values
    );

    res.json({ policy: result.rows[0] });
  } catch (err) {
    console.error('Update policy error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const policyId = parseIntId(req.params.id);
    if (!policyId) { sendInvalidId(res); return; }
    const id = policyId;

    const result = await pool.query(
      'DELETE FROM policies WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Policy not found' });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Delete policy error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const policiesRouter = router;
