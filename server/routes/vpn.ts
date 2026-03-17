import { Response, Router } from 'express';
import { authMiddleware, AuthRequest } from '../auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/servers', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json({ servers: [] });
  } catch (err) {
    console.error('VPN servers error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/session', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json({
      session: {
        connected: false,
        killSwitch: false,
      },
    });
  } catch (err) {
    console.error('VPN session error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/connect', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { serverId } = req.body;
    if (!serverId) {
      res.status(400).json({ error: 'Server ID required' });
      return;
    }
    res.json({
      session: {
        connected: true,
        serverId,
        serverName: 'GhostLane Server',
        connectedAt: new Date().toISOString(),
        bytesUp: 0,
        bytesDown: 0,
        assignedIp: '10.0.0.' + Math.floor(Math.random() * 255),
        killSwitch: false,
      },
    });
  } catch (err) {
    console.error('VPN connect error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/disconnect', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json({
      session: {
        connected: false,
        killSwitch: false,
      },
    });
  } catch (err) {
    console.error('VPN disconnect error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/kill-switch', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { enabled } = req.body;
    res.json({
      session: {
        connected: false,
        killSwitch: !!enabled,
      },
    });
  } catch (err) {
    console.error('VPN kill switch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const vpnRouter = router;
