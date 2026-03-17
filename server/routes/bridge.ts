import { Response, Router } from 'express';
import { authMiddleware, AuthRequest } from '../auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json({ transfers: [], total: 0 });
  } catch (err) {
    console.error('Bridge list error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sourceChain, destChain, token, amount, recipientAddress } = req.body;
    if (!sourceChain || !destChain || !token || !amount || !recipientAddress) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    const transfer = {
      id: crypto.randomUUID(),
      sourceChain,
      destChain,
      token,
      amount,
      recipientAddress,
      status: 'initiated',
      createdAt: new Date().toISOString(),
    };
    res.json({ transfer });
  } catch (err) {
    console.error('Bridge create error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/chains', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json({
      chains: [
        { id: 'ethereum', name: 'Ethereum', icon: 'eth', tokens: ['ETH', 'USDC', 'USDT'] },
        { id: 'bitcoin', name: 'Bitcoin', icon: 'btc', tokens: ['BTC'] },
        { id: 'solana', name: 'Solana', icon: 'sol', tokens: ['SOL', 'USDC'] },
        { id: 'polygon', name: 'Polygon', icon: 'matic', tokens: ['MATIC', 'USDC', 'USDT'] },
        { id: 'avalanche', name: 'Avalanche', icon: 'avax', tokens: ['AVAX', 'USDC'] },
        { id: 'bsc', name: 'BNB Chain', icon: 'bnb', tokens: ['BNB', 'USDT'] },
        { id: 'arbitrum', name: 'Arbitrum', icon: 'eth', tokens: ['ETH', 'USDC'] },
        { id: 'optimism', name: 'Optimism', icon: 'eth', tokens: ['ETH', 'USDC'] },
        { id: 'base', name: 'Base', icon: 'eth', tokens: ['ETH', 'USDC'] },
        { id: 'monero', name: 'Monero', icon: 'xmr', tokens: ['XMR'] },
        { id: 'litecoin', name: 'Litecoin', icon: 'ltc', tokens: ['LTC'] },
        { id: 'zcash', name: 'Zcash', icon: 'zec', tokens: ['ZEC'] },
        { id: 'dash', name: 'Dash', icon: 'dash', tokens: ['DASH'] },
        { id: 'dogecoin', name: 'Dogecoin', icon: 'doge', tokens: ['DOGE'] },
        { id: 'fantom', name: 'Fantom', icon: 'ftm', tokens: ['FTM'] },
      ],
    });
  } catch (err) {
    console.error('Bridge chains error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const bridgeRouter = router;
