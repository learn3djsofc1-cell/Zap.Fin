import { Response, Router } from 'express';
import { authMiddleware, AuthRequest } from '../auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/stats', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json({
      stats: {
        privacyScore: 0,
        totalMixes: 0,
        activeBridges: 0,
        messagesEncrypted: 0,
        vpnUptime: '0h',
      },
    });
  } catch (err) {
    console.error('Overview stats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/activity', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json({ activity: [] });
  } catch (err) {
    console.error('Overview activity error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const overviewRouter = router;
