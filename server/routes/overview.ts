import { Response, Router } from 'express';
import { authMiddleware, AuthRequest } from '../auth.js';
import pool from '../db.js';

const router = Router();
router.use(authMiddleware);

router.get('/stats', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    const [mixCountResult, completedMixResult, recentMixResult, messageCountResult, recentMessageResult] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM mix_operations WHERE user_id = $1', [userId]),
      pool.query("SELECT COUNT(*) FROM mix_operations WHERE user_id = $1 AND status = 'complete'", [userId]),
      pool.query("SELECT COUNT(*) FROM mix_operations WHERE user_id = $1 AND created_at > NOW() - INTERVAL '30 days'", [userId]),
      pool.query('SELECT COUNT(*) FROM messages WHERE user_id = $1', [userId]),
      pool.query("SELECT COUNT(*) FROM messages WHERE user_id = $1 AND created_at > NOW() - INTERVAL '30 days'", [userId]),
    ]);

    const totalMixes = parseInt(mixCountResult.rows[0].count);
    const completedMixes = parseInt(completedMixResult.rows[0].count);
    const recentMixes = parseInt(recentMixResult.rows[0].count);
    const messagesEncrypted = parseInt(messageCountResult.rows[0].count);
    const recentMessages = parseInt(recentMessageResult.rows[0].count);

    let privacyScore = 0;
    const mixBase = Math.min(totalMixes * 5, 30);
    const mixCompletion = totalMixes > 0 ? Math.round((completedMixes / totalMixes) * 20) : 0;
    const mixRecency = Math.min(recentMixes * 3, 20);
    const msgBase = Math.min(messagesEncrypted * 2, 15);
    const msgRecency = Math.min(recentMessages * 1, 15);
    privacyScore = Math.min(mixBase + mixCompletion + mixRecency + msgBase + msgRecency, 100);

    res.json({
      stats: {
        privacyScore,
        totalMixes,
        activeBridges: 0,
        messagesEncrypted,
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

    const [mixResult, msgResult] = await Promise.all([
      pool.query(
        `SELECT id, send_coin, receive_coin, send_amount, receive_amount, status, created_at, recipient_address, privacy_level
         FROM mix_operations
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 15`,
        [userId]
      ),
      pool.query(
        `SELECT m.id, m.content, m.created_at, c.contact_address
         FROM messages m
         JOIN conversations c ON c.id = m.conversation_id
         WHERE m.user_id = $1
         ORDER BY m.created_at DESC
         LIMIT 15`,
        [userId]
      ),
    ]);

    const mixActivity = mixResult.rows.map((row) => ({
      id: row.id,
      type: 'mix' as const,
      title: `${formatNum(row.send_amount)} ${row.send_coin} → ${formatNum(row.receive_amount)} ${row.receive_coin}`,
      description: `${row.privacy_level} privacy to ${row.recipient_address.slice(0, 8)}...${row.recipient_address.slice(-6)}`,
      timestamp: row.created_at?.toISOString?.() || row.created_at,
      status: row.status,
    }));

    const msgActivity = msgResult.rows.map((row) => ({
      id: row.id,
      type: 'message' as const,
      title: `Message to ${row.contact_address.slice(0, 6)}...${row.contact_address.slice(-4)}`,
      description: row.content.length > 50 ? row.content.slice(0, 50) + '...' : row.content,
      timestamp: row.created_at?.toISOString?.() || row.created_at,
      status: 'complete' as const,
    }));

    const activity = [...mixActivity, ...msgActivity]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);

    res.json({ activity });
  } catch (err) {
    console.error('Overview activity error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const overviewRouter = router;
