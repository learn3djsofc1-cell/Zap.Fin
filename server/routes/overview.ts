import { Response, Router } from 'express';
import pool from '../db.js';
import { authMiddleware, AuthRequest } from '../auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [agentsResult, txStatsResult, volumeResult, latencyResult, recentActivityResult] = await Promise.all([
      pool.query(
        `SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'active') as active,
          COUNT(*) FILTER (WHERE status = 'paused') as paused
         FROM agents WHERE user_id = $1`,
        [req.userId]
      ),

      pool.query(
        `SELECT COUNT(*) as count
         FROM transactions
         WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '24 hours'`,
        [req.userId]
      ),

      pool.query(
        `SELECT COALESCE(SUM(amount), 0) as total_volume
         FROM transactions
         WHERE user_id = $1 AND status = 'settled'`,
        [req.userId]
      ),

      pool.query(
        `SELECT COALESCE(AVG(latency_ms), 0) as avg_latency
         FROM transactions
         WHERE user_id = $1 AND status = 'settled' AND latency_ms > 0`,
        [req.userId]
      ),

      pool.query(
        `SELECT t.*, a.name as agent_name, a.agent_id_slug
         FROM transactions t
         LEFT JOIN agents a ON t.agent_id = a.id AND a.user_id = t.user_id
         WHERE t.user_id = $1
         ORDER BY t.created_at DESC
         LIMIT 10`,
        [req.userId]
      ),
    ]);

    const agents = agentsResult.rows[0];
    const txStats = txStatsResult.rows[0];
    const volume = volumeResult.rows[0];
    const latency = latencyResult.rows[0];

    res.json({
      stats: {
        totalAgents: parseInt(agents.total, 10),
        activeAgents: parseInt(agents.active, 10),
        pausedAgents: parseInt(agents.paused, 10),
        transactions24h: parseInt(txStats.count, 10),
        totalVolume: parseFloat(volume.total_volume),
        avgSettlementMs: Math.round(parseFloat(latency.avg_latency)),
      },
      recentActivity: recentActivityResult.rows,
    });
  } catch (err) {
    console.error('Overview error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const overviewRouter = router;
