import { Response, Router } from 'express';
import { authMiddleware, AuthRequest } from '../auth.js';
import pool from '../db.js';

const router = Router();
router.use(authMiddleware);

router.get('/stats', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    const [mixCountResult, completedMixResult, recentMixResult, messageCountResult, recentMessageResult, bridgeCountResult, activeBridgeResult, vpnUptimeResult, vpnActiveResult] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM mix_operations WHERE user_id = $1', [userId]),
      pool.query("SELECT COUNT(*) FROM mix_operations WHERE user_id = $1 AND status = 'complete'", [userId]),
      pool.query("SELECT COUNT(*) FROM mix_operations WHERE user_id = $1 AND created_at > NOW() - INTERVAL '30 days'", [userId]),
      pool.query('SELECT COUNT(*) FROM messages WHERE user_id = $1', [userId]),
      pool.query("SELECT COUNT(*) FROM messages WHERE user_id = $1 AND created_at > NOW() - INTERVAL '30 days'", [userId]),
      pool.query('SELECT COUNT(*) FROM bridge_transfers WHERE user_id = $1', [userId]),
      pool.query("SELECT COUNT(*) FROM bridge_transfers WHERE user_id = $1 AND status IN ('initiated', 'confirming', 'bridging')", [userId]),
      pool.query(
        `SELECT COALESCE(
          SUM(EXTRACT(EPOCH FROM (COALESCE(disconnected_at, NOW()) - connected_at))),
          0
        ) as total_seconds
        FROM vpn_sessions WHERE user_id = $1`,
        [userId]
      ),
      pool.query("SELECT COUNT(*) FROM vpn_sessions WHERE user_id = $1 AND status = 'active'", [userId]),
    ]);

    const totalMixes = parseInt(mixCountResult.rows[0].count);
    const completedMixes = parseInt(completedMixResult.rows[0].count);
    const recentMixes = parseInt(recentMixResult.rows[0].count);
    const messagesEncrypted = parseInt(messageCountResult.rows[0].count);
    const recentMessages = parseInt(recentMessageResult.rows[0].count);
    const totalBridges = parseInt(bridgeCountResult.rows[0].count);
    const activeBridges = parseInt(activeBridgeResult.rows[0].count);
    const vpnTotalSeconds = parseFloat(vpnUptimeResult.rows[0].total_seconds) || 0;
    const vpnActive = parseInt(vpnActiveResult.rows[0].count) > 0;

    const vpnHours = Math.floor(vpnTotalSeconds / 3600);
    const vpnMins = Math.floor((vpnTotalSeconds % 3600) / 60);
    let vpnUptime: string;
    if (vpnHours >= 24) {
      const days = Math.floor(vpnHours / 24);
      const remHours = vpnHours % 24;
      vpnUptime = `${days}d ${remHours}h`;
    } else if (vpnHours > 0) {
      vpnUptime = `${vpnHours}h ${vpnMins}m`;
    } else if (vpnMins > 0) {
      vpnUptime = `${vpnMins}m`;
    } else {
      vpnUptime = '0h';
    }

    let privacyScore = 0;
    const mixBase = Math.min(totalMixes * 5, 30);
    const mixCompletion = totalMixes > 0 ? Math.round((completedMixes / totalMixes) * 20) : 0;
    const mixRecency = Math.min(recentMixes * 3, 20);
    const msgBase = Math.min(messagesEncrypted * 2, 15);
    const msgRecency = Math.min(recentMessages * 1, 15);
    const bridgeBase = Math.min(totalBridges * 3, 10);
    const vpnScore = vpnActive ? 10 : Math.min(Math.floor(vpnHours), 5);
    privacyScore = Math.min(mixBase + mixCompletion + mixRecency + msgBase + msgRecency + bridgeBase + vpnScore, 100);

    res.json({
      stats: {
        privacyScore,
        totalMixes,
        activeBridges,
        messagesEncrypted,
        vpnUptime,
        vpnActive,
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

    const [mixResult, msgResult, bridgeResult, vpnResult] = await Promise.all([
      pool.query(
        `SELECT id, send_coin, receive_coin, send_amount, receive_amount, status, created_at, recipient_address, privacy_level
         FROM mix_operations
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 15`,
        [userId]
      ),
      pool.query(
        `SELECT m.id, m.content, m.created_at, COALESCE(u.name, c.contact_address, 'Unknown') AS contact_name
         FROM messages m
         JOIN conversations c ON c.id = m.conversation_id
         LEFT JOIN users u ON u.id = c.contact_user_id
         WHERE m.user_id = $1
         ORDER BY m.created_at DESC
         LIMIT 15`,
        [userId]
      ),
      pool.query(
        `SELECT id, source_chain, dest_chain, token, amount, status, created_at, recipient_address
         FROM bridge_transfers
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 15`,
        [userId]
      ),
      pool.query(
        `SELECT id, server_name, server_country, server_city, status, connected_at, disconnected_at, assigned_ip
         FROM vpn_sessions
         WHERE user_id = $1
         ORDER BY connected_at DESC
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
      title: `Message to ${row.contact_name}`,
      description: row.content.length > 50 ? row.content.slice(0, 50) + '...' : row.content,
      timestamp: row.created_at?.toISOString?.() || row.created_at,
      status: 'complete' as const,
    }));

    const bridgeActivity = bridgeResult.rows.map((row) => ({
      id: row.id,
      type: 'bridge' as const,
      title: `Bridge ${formatNum(row.amount)} ${row.token}`,
      description: `${row.source_chain} → ${row.dest_chain} to ${row.recipient_address.slice(0, 8)}...${row.recipient_address.slice(-6)}`,
      timestamp: row.created_at?.toISOString?.() || row.created_at,
      status: row.status,
    }));

    const vpnActivity = vpnResult.rows.map((row) => ({
      id: row.id,
      type: 'vpn' as const,
      title: `VPN ${row.status === 'active' ? 'Connected' : 'Session'} — ${row.server_city}, ${row.server_country}`,
      description: `IP: ${row.assigned_ip}${row.disconnected_at ? ' (ended)' : ' (active)'}`,
      timestamp: row.connected_at?.toISOString?.() || row.connected_at,
      status: row.status === 'active' ? 'active' : 'complete',
    }));

    const activity = [...mixActivity, ...msgActivity, ...bridgeActivity, ...vpnActivity]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);

    res.json({ activity });
  } catch (err) {
    console.error('Overview activity error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const overviewRouter = router;
