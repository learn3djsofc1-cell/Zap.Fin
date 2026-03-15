import { Router, Request, Response } from 'express';

interface PriceCache {
  data: { sol: number; usdc: number; usdt: number } | null;
  timestamp: number;
}

const CACHE_TTL = 30_000;
const cache: PriceCache = { data: null, timestamp: 0 };

export default function priceRoutes() {
  const router = Router();

  router.get('/sol', async (_req: Request, res: Response) => {
    const now = Date.now();
    if (cache.data && now - cache.timestamp < CACHE_TTL) {
      res.json(cache.data);
      return;
    }

    try {
      const apiKey = process.env.COINGECKO_API_KEY;
      const headers: Record<string, string> = { accept: 'application/json' };
      if (apiKey) {
        headers['x-cg-demo-api-key'] = apiKey;
      }

      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=solana,usd-coin,tether&vs_currencies=usd',
        { headers }
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      const prices = {
        sol: data.solana?.usd ?? 0,
        usdc: data['usd-coin']?.usd ?? 1,
        usdt: data.tether?.usd ?? 1,
      };

      cache.data = prices;
      cache.timestamp = now;

      res.json(prices);
    } catch (err) {
      console.error('Price fetch error:', err);
      if (cache.data) {
        res.json({ ...cache.data, stale: true });
        return;
      }
      res.status(502).json({ error: 'Failed to fetch prices' });
    }
  });

  return router;
}
