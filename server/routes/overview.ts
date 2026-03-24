import { Response, Router } from 'express';
import { authMiddleware, AuthRequest } from '../auth.js';
import pool from '../db.js';

const router = Router();
router.use(authMiddleware);

router.get('/stats', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    const [mixCountResult, completedMixResult, recentMixResult] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM mix_operations WHERE user_id = $1', [userId]),
      pool.query("SELECT COUNT(*) FROM mix_operations WHERE user_id = $1 AND status = 'complete'", [userId]),
      pool.query("SELECT COUNT(*) FROM mix_operations WHERE user_id = $1 AND created_at > NOW() - INTERVAL '30 days'", [userId]),
    ]);

    const totalMixes = parseInt(mixCountResult.rows[0].count);
    const completedMixes = parseInt(completedMixResult.rows[0].count);
    const recentMixes = parseInt(recentMixResult.rows[0].count);

    let privacyScore = 0;
    if (totalMixes > 0) {
      const baseScore = Math.min(totalMixes * 5, 40);
      const completionBonus = totalMixes > 0 ? Math.round((completedMixes / totalMixes) * 30) : 0;
      const recencyBonus = Math.min(recentMixes * 3, 30);
      privacyScore = Math.min(baseScore + completionBonus + recencyBonus, 100);
    }

    res.json({
      stats: {
        privacyScore,
        totalMixes,
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

function formatNum(val: string | number): string {
  const n = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(n)) return '0';
  if (n % 1 === 0) return n.toFixed(0);
  return n.toString().replace(/\.?0+$/, '');
}

router.get('/activity', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      `SELECT id, send_coin, receive_coin, send_amount, receive_amount, status, created_at, recipient_address, privacy_level
       FROM mix_operations
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 20`,
      [userId]
    );

    const activity = result.rows.map((row) => ({
      id: row.id,
      type: 'mix' as const,
      title: `${formatNum(row.send_amount)} ${row.send_coin} → ${formatNum(row.receive_amount)} ${row.receive_coin}`,
      description: `${row.privacy_level} privacy to ${row.recipient_address.slice(0, 8)}...${row.recipient_address.slice(-6)}`,
      timestamp: row.created_at?.toISOString?.() || row.created_at,
      status: row.status,
    }));

    res.json({ activity });
  } catch (err) {
    console.error('Overview activity error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const overviewRouter = router;
