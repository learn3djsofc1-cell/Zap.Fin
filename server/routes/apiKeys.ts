import { Response, Router } from 'express';
import pool from '../db.js';
import { authMiddleware, AuthRequest } from '../auth.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT id, key_prefix, label, environment, created_at, last_used_at, revoked_at
       FROM api_keys WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.userId]
    );
    res.json({ apiKeys: result.rows });
  } catch (err) {
    console.error('List API keys error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { label, environment } = req.body;

    if (!label || typeof label !== 'string' || label.trim().length === 0) {
      res.status(400).json({ error: 'Label is required' });
      return;
    }

    if (label.trim().length > 255) {
      res.status(400).json({ error: 'Label must be 255 characters or less' });
      return;
    }

    const validEnvs = ['live', 'test'];
    const env = typeof environment === 'string' && validEnvs.includes(environment) ? environment : 'live';

    const prefix = env === 'test' ? 'mf_test_' : 'mf_live_';
    const rawKey = crypto.randomBytes(24).toString('base64url');
    const fullKey = `${prefix}${rawKey}`;
    const displayPrefix = fullKey.slice(0, 12) + '...';

    const keyHash = await bcrypt.hash(fullKey, 10);

    const result = await pool.query(
      `INSERT INTO api_keys (user_id, key_prefix, key_hash, label, environment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, key_prefix, label, environment, created_at`,
      [req.userId, displayPrefix, keyHash, label.trim(), env]
    );

    res.status(201).json({
      apiKey: result.rows[0],
      fullKey,
    });
  } catch (err) {
    console.error('Create API key error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      res.status(400).json({ error: 'Invalid API key ID' });
      return;
    }

    const result = await pool.query(
      `UPDATE api_keys SET revoked_at = NOW() WHERE id = $1 AND user_id = $2 AND revoked_at IS NULL RETURNING id`,
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'API key not found or already revoked' });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Revoke API key error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const apiKeysRouter = router;
