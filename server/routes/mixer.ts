import { Response, Router } from 'express';
import { authMiddleware, AuthRequest } from '../auth.js';
import pool from '../db.js';
import { validateAddress, generateDepositAddress, isSupportedCoin, SUPPORTED_COINS } from '../crypto-utils.js';

const router = Router();
router.use(authMiddleware);

const VALID_PRIVACY_LEVELS = ['standard', 'enhanced', 'maximum'];
const VALID_STATUSES = ['pending', 'mixing', 'complete', 'failed'];

function formatMix(row: any) {
  const rawAmount = parseFloat(row.amount);
  const formattedAmount = rawAmount % 1 === 0 ? rawAmount.toFixed(0) : rawAmount.toString().replace(/\.?0+$/, '');
  return {
    id: row.id,
    coin: row.coin,
    amount: formattedAmount,
    recipientAddress: row.recipient_address,
    privacyLevel: row.privacy_level,
    delayMinutes: row.delay_minutes,
    status: row.status,
    depositAddress: row.deposit_address,
    txHash: row.tx_hash || undefined,
    createdAt: row.created_at?.toISOString?.() || row.created_at,
    completedAt: row.completed_at?.toISOString?.() || row.completed_at || undefined,
  };
}

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const status = req.query.status as string | undefined;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    let query = 'SELECT * FROM mix_operations WHERE user_id = $1';
    const params: any[] = [userId];
    let paramIndex = 2;

    if (status && VALID_STATUSES.includes(status)) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const countQuery = status && VALID_STATUSES.includes(status)
      ? 'SELECT COUNT(*) FROM mix_operations WHERE user_id = $1 AND status = $2'
      : 'SELECT COUNT(*) FROM mix_operations WHERE user_id = $1';
    const countParams = status && VALID_STATUSES.includes(status)
      ? [userId, status]
      : [userId];

    const [result, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, countParams),
    ]);

    res.json({
      mixes: result.rows.map(formatMix),
      total: parseInt(countResult.rows[0].count),
    });
  } catch (err) {
    console.error('Mixer list error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { coin, amount, recipientAddress, privacyLevel, delayMinutes } = req.body;

    if (!coin || !amount || !recipientAddress || !privacyLevel) {
      res.status(400).json({ error: 'Missing required fields: coin, amount, recipientAddress, privacyLevel' });
      return;
    }

    if (typeof coin !== 'string' || typeof recipientAddress !== 'string' || typeof privacyLevel !== 'string') {
      res.status(400).json({ error: 'Invalid input types' });
      return;
    }

    const upperCoin = coin.toUpperCase();
    if (!isSupportedCoin(upperCoin)) {
      res.status(400).json({ error: `Unsupported coin. Supported: ${SUPPORTED_COINS.join(', ')}` });
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      res.status(400).json({ error: 'Amount must be a positive number' });
      return;
    }

    if (!VALID_PRIVACY_LEVELS.includes(privacyLevel)) {
      res.status(400).json({ error: `Invalid privacy level. Valid: ${VALID_PRIVACY_LEVELS.join(', ')}` });
      return;
    }

    const addressValidation = validateAddress(upperCoin, recipientAddress.trim());
    if (!addressValidation.valid) {
      res.status(400).json({ error: addressValidation.error || 'Invalid recipient address' });
      return;
    }

    const parsedDelay = parseInt(delayMinutes) || 0;
    if (parsedDelay < 0 || parsedDelay > 1440) {
      res.status(400).json({ error: 'Delay must be between 0 and 1440 minutes' });
      return;
    }

    const deposit = generateDepositAddress(upperCoin);

    const result = await pool.query(
      `INSERT INTO mix_operations (user_id, coin, amount, recipient_address, privacy_level, delay_minutes, status, deposit_address, deposit_private_key_enc)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, $8)
       RETURNING *`,
      [userId, upperCoin, parsedAmount, recipientAddress.trim(), privacyLevel, parsedDelay, deposit.address, deposit.encryptedPrivateKey]
    );

    res.status(201).json({ mix: formatMix(result.rows[0]) });
  } catch (err) {
    console.error('Mixer create error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/validate-address', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { coin, address } = req.body;
    if (!coin || typeof coin !== 'string' || !address || typeof address !== 'string') {
      res.status(400).json({ error: 'coin and address must be non-empty strings' });
      return;
    }
    const result = validateAddress(coin, address);
    res.json(result);
  } catch (err) {
    console.error('Address validation error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/pools', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json({
      pools: [
        { coin: 'BTC', size: 847500 },
        { coin: 'ETH', size: 2150000 },
        { coin: 'XMR', size: 520000 },
        { coin: 'LTC', size: 310000 },
        { coin: 'DASH', size: 185000 },
        { coin: 'ZEC', size: 275000 },
        { coin: 'BCH', size: 142000 },
        { coin: 'DOGE', size: 95000 },
      ],
    });
  } catch (err) {
    console.error('Mixer pools error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const mixId = req.params.id;

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(mixId)) {
      res.status(400).json({ error: 'Invalid mix ID format' });
      return;
    }

    const result = await pool.query(
      'SELECT * FROM mix_operations WHERE id = $1 AND user_id = $2',
      [mixId, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Mix not found' });
      return;
    }

    res.json({ mix: formatMix(result.rows[0]) });
  } catch (err) {
    console.error('Mixer get error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const mixerRouter = router;
