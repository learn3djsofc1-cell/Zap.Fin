import { Router, Request, Response } from 'express';
import pg from 'pg';
import { Keypair } from '@solana/web3.js';
import crypto from 'crypto';

const isProduction = process.env.NODE_ENV === 'production';
const ENCRYPTION_KEY = process.env.WALLET_ENCRYPTION_KEY || process.env.SESSION_SECRET || (isProduction ? '' : 'zap-fin-dev-wallet-key-32chars!!');

if (isProduction && !ENCRYPTION_KEY) {
  console.error('FATAL: WALLET_ENCRYPTION_KEY or SESSION_SECRET must be set in production');
  process.exit(1);
}

function encrypt(text: string): string {
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

export default function walletRoutes(pool: pg.Pool) {
  const router = Router();

  function requireAuth(req: Request, res: Response): number | null {
    if (!req.session.userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return null;
    }
    return req.session.userId;
  }

  router.get('/', async (req: Request, res: Response) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    try {
      const result = await pool.query(
        `SELECT id, address, confirmed, created_at FROM wallets WHERE user_id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        res.json(null);
        return;
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error('Get wallet error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/create', async (req: Request, res: Response) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    try {
      const existing = await pool.query(
        'SELECT id FROM wallets WHERE user_id = $1',
        [userId]
      );

      if (existing.rows.length > 0) {
        res.status(409).json({ error: 'Wallet already exists' });
        return;
      }

      const keypair = Keypair.generate();
      const address = keypair.publicKey.toBase58();
      const privateKeyBase58 = Buffer.from(keypair.secretKey).toString('base64');
      const encryptedKey = encrypt(privateKeyBase58);

      await pool.query(
        `INSERT INTO wallets (user_id, address, encrypted_private_key, confirmed)
         VALUES ($1, $2, $3, FALSE)`,
        [userId, address, encryptedKey]
      );

      res.status(201).json({
        address,
        privateKey: privateKeyBase58,
      });
    } catch (err) {
      console.error('Create wallet error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.post('/confirm', async (req: Request, res: Response) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    try {
      const result = await pool.query(
        `UPDATE wallets SET confirmed = TRUE WHERE user_id = $1 AND confirmed = FALSE
         RETURNING id, address, confirmed`,
        [userId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'No unconfirmed wallet found' });
        return;
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error('Confirm wallet error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}
