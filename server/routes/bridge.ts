import { Response, Router } from 'express';
import { authMiddleware, AuthRequest } from '../auth.js';
import pool from '../db.js';
import { validateBridgeAddress, generateBridgeDepositAddress } from '../crypto-utils.js';

const router = Router();
router.use(authMiddleware);

const VALID_STATUSES = ['initiated', 'confirming', 'bridging', 'complete', 'failed'];

const CHAIN_LOGO_MAP: Record<string, string> = {
  ethereum: '/crypto-eth.png',
  bitcoin: '/crypto-btc.png',
  solana: '/sol-logo.png',
  polygon: '/crypto-matic.png',
  avalanche: '/crypto-avax.png',
  bsc: '/crypto-bnb.png',
  arbitrum: '/crypto-arb.png',
  optimism: '/crypto-op.png',
  base: '/crypto-eth.png',
  monero: '/crypto-xmr.png',
  litecoin: '/crypto-ltc.png',
  zcash: '/crypto-zec.png',
  dash: '/crypto-dash.png',
  dogecoin: '/crypto-doge.png',
  fantom: '/crypto-ftm.png',
};

const CHAINS = [
  { id: 'ethereum', name: 'Ethereum', icon: 'eth', tokens: ['ETH', 'USDC', 'USDT'], logo: CHAIN_LOGO_MAP['ethereum'] },
  { id: 'bitcoin', name: 'Bitcoin', icon: 'btc', tokens: ['BTC'], logo: CHAIN_LOGO_MAP['bitcoin'] },
  { id: 'solana', name: 'Solana', icon: 'sol', tokens: ['SOL', 'USDC'], logo: CHAIN_LOGO_MAP['solana'] },
  { id: 'polygon', name: 'Polygon', icon: 'matic', tokens: ['MATIC', 'USDC', 'USDT'], logo: CHAIN_LOGO_MAP['polygon'] },
  { id: 'avalanche', name: 'Avalanche', icon: 'avax', tokens: ['AVAX', 'USDC'], logo: CHAIN_LOGO_MAP['avalanche'] },
  { id: 'bsc', name: 'BNB Chain', icon: 'bnb', tokens: ['BNB', 'USDT'], logo: CHAIN_LOGO_MAP['bsc'] },
  { id: 'arbitrum', name: 'Arbitrum', icon: 'eth', tokens: ['ETH', 'USDC'], logo: CHAIN_LOGO_MAP['arbitrum'] },
  { id: 'optimism', name: 'Optimism', icon: 'eth', tokens: ['ETH', 'USDC'], logo: CHAIN_LOGO_MAP['optimism'] },
  { id: 'base', name: 'Base', icon: 'eth', tokens: ['ETH', 'USDC'], logo: CHAIN_LOGO_MAP['base'] },
  { id: 'monero', name: 'Monero', icon: 'xmr', tokens: ['XMR'], logo: CHAIN_LOGO_MAP['monero'] },
  { id: 'litecoin', name: 'Litecoin', icon: 'ltc', tokens: ['LTC'], logo: CHAIN_LOGO_MAP['litecoin'] },
  { id: 'zcash', name: 'Zcash', icon: 'zec', tokens: ['ZEC'], logo: CHAIN_LOGO_MAP['zcash'] },
  { id: 'dash', name: 'Dash', icon: 'dash', tokens: ['DASH'], logo: CHAIN_LOGO_MAP['dash'] },
  { id: 'dogecoin', name: 'Dogecoin', icon: 'doge', tokens: ['DOGE'], logo: CHAIN_LOGO_MAP['dogecoin'] },
  { id: 'fantom', name: 'Fantom', icon: 'ftm', tokens: ['FTM'], logo: CHAIN_LOGO_MAP['fantom'] },
];

const VALID_CHAIN_IDS = CHAINS.map(c => c.id);

function formatNum(val: string | number): string {
  const n = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(n)) return '0';
  if (n % 1 === 0) return n.toFixed(0);
  return n.toString().replace(/\.?0+$/, '');
}

function formatTransfer(row: any) {
  return {
    id: row.id,
    sourceChain: row.source_chain,
    destChain: row.dest_chain,
    token: row.token,
    amount: formatNum(row.amount),
    recipientAddress: row.recipient_address,
    status: row.status,
    depositAddress: row.deposit_address,
    sourceTxHash: row.source_tx_hash || undefined,
    destTxHash: row.dest_tx_hash || undefined,
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

    let query = 'SELECT * FROM bridge_transfers WHERE user_id = $1';
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
      ? 'SELECT COUNT(*) FROM bridge_transfers WHERE user_id = $1 AND status = $2'
      : 'SELECT COUNT(*) FROM bridge_transfers WHERE user_id = $1';
    const countParams = status && VALID_STATUSES.includes(status)
      ? [userId, status]
      : [userId];

    const [result, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, countParams),
    ]);

    res.json({
      transfers: result.rows.map(formatTransfer),
      total: parseInt(countResult.rows[0].count),
    });
  } catch (err) {
    console.error('Bridge list error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { sourceChain, destChain, token, amount, recipientAddress } = req.body;

    if (!sourceChain || !destChain || !token || !amount || !recipientAddress) {
      res.status(400).json({ error: 'Missing required fields: sourceChain, destChain, token, amount, recipientAddress' });
      return;
    }

    if (typeof sourceChain !== 'string' || typeof destChain !== 'string' || typeof token !== 'string' || typeof recipientAddress !== 'string') {
      res.status(400).json({ error: 'Invalid input types' });
      return;
    }

    if (!VALID_CHAIN_IDS.includes(sourceChain)) {
      res.status(400).json({ error: `Invalid source chain: ${sourceChain}` });
      return;
    }
    if (!VALID_CHAIN_IDS.includes(destChain)) {
      res.status(400).json({ error: `Invalid destination chain: ${destChain}` });
      return;
    }
    if (sourceChain === destChain) {
      res.status(400).json({ error: 'Source and destination chains must be different' });
      return;
    }

    const sourceChainData = CHAINS.find(c => c.id === sourceChain);
    if (!sourceChainData || !sourceChainData.tokens.includes(token.toUpperCase())) {
      res.status(400).json({ error: `Token ${token} is not available on ${sourceChain}` });
      return;
    }

    const destChainData = CHAINS.find(c => c.id === destChain);
    if (!destChainData || !destChainData.tokens.includes(token.toUpperCase())) {
      res.status(400).json({ error: `Token ${token} is not available on ${destChain}` });
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      res.status(400).json({ error: 'Amount must be a positive number' });
      return;
    }

    const addressValidation = validateBridgeAddress(destChain, token.toUpperCase(), recipientAddress.trim());
    if (!addressValidation.valid) {
      res.status(400).json({ error: addressValidation.error || 'Invalid recipient address' });
      return;
    }

    const deposit = generateBridgeDepositAddress(sourceChain, token.toUpperCase());

    const result = await pool.query(
      `INSERT INTO bridge_transfers (user_id, source_chain, dest_chain, token, amount, recipient_address, status, deposit_address, deposit_private_key_enc)
       VALUES ($1, $2, $3, $4, $5, $6, 'initiated', $7, $8)
       RETURNING *`,
      [userId, sourceChain, destChain, token.toUpperCase(), parsedAmount, recipientAddress.trim(), deposit.address, deposit.encryptedPrivateKey]
    );

    res.status(201).json({ transfer: formatTransfer(result.rows[0]) });
  } catch (err) {
    console.error('Bridge create error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/validate-address', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { chain, token, address } = req.body;
    if (!chain || typeof chain !== 'string' || !token || typeof token !== 'string' || !address || typeof address !== 'string') {
      res.status(400).json({ error: 'chain, token, and address must be non-empty strings' });
      return;
    }
    const result = validateBridgeAddress(chain, token.toUpperCase(), address);
    res.json(result);
  } catch (err) {
    console.error('Bridge address validation error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/chains', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json({ chains: CHAINS });
  } catch (err) {
    console.error('Bridge chains error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const transferId = req.params.id;

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(transferId)) {
      res.status(400).json({ error: 'Invalid transfer ID format' });
      return;
    }

    const result = await pool.query(
      'SELECT * FROM bridge_transfers WHERE id = $1 AND user_id = $2',
      [transferId, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Transfer not found' });
      return;
    }

    res.json({ transfer: formatTransfer(result.rows[0]) });
  } catch (err) {
    console.error('Bridge get error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const bridgeRouter = router;
