import { Router, Request, Response } from 'express';
import pg from 'pg';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
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
      const secretKeyBase58 = bs58.encode(keypair.secretKey);
      const encryptedKey = encrypt(secretKeyBase58);

      await pool.query(
        `INSERT INTO wallets (user_id, address, encrypted_private_key, confirmed)
         VALUES ($1, $2, $3, FALSE)`,
        [userId, address, encryptedKey]
      );

      res.status(201).json({
        address,
        privateKey: secretKeyBase58,
      });
    } catch (err) {
      console.error('Create wallet error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/balance', async (req: Request, res: Response) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    try {
      const walletResult = await pool.query(
        'SELECT address FROM wallets WHERE user_id = $1 AND confirmed = TRUE',
        [userId]
      );

      if (walletResult.rows.length === 0) {
        res.status(404).json({ error: 'No confirmed wallet found' });
        return;
      }

      const address = walletResult.rows[0].address;
      const heliusKey = process.env.HELIUS_API_KEY;
      const rpcUrl = heliusKey
        ? `https://mainnet.helius-rpc.com/?api-key=${heliusKey}`
        : 'https://api.mainnet-beta.solana.com';

      const rpcResponse = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [address],
        }),
      });

      if (!rpcResponse.ok) {
        throw new Error(`Helius RPC error: ${rpcResponse.status}`);
      }

      const rpcData = await rpcResponse.json();
      const lamports = rpcData.result?.value ?? 0;
      const sol = lamports / 1e9;

      res.json({ address, lamports, sol });
    } catch (err) {
      console.error('Balance fetch error:', err);
      res.status(502).json({ error: 'Failed to fetch balance' });
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
