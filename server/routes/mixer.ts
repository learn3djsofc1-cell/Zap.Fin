import { Response, Router } from 'express';
import { authMiddleware, AuthRequest } from '../auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json({ mixes: [], total: 0 });
  } catch (err) {
    console.error('Mixer list error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { coin, amount, recipientAddress, privacyLevel, delayMinutes } = req.body;
    if (!coin || !amount || !recipientAddress || !privacyLevel) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    const mix = {
      id: crypto.randomUUID(),
      coin,
      amount,
      recipientAddress,
      privacyLevel,
      delayMinutes: delayMinutes || 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    res.json({ mix });
  } catch (err) {
    console.error('Mixer create error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/pools', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json({ pools: [] });
  } catch (err) {
    console.error('Mixer pools error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.status(404).json({ error: 'Mix not found' });
  } catch (err) {
    console.error('Mixer get error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const mixerRouter = router;
