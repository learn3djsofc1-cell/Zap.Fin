import { Response, Router } from 'express';
import { authMiddleware, AuthRequest } from '../auth.js';
import pool from '../db.js';
import crypto from 'crypto';

const router = Router();
router.use(authMiddleware);

interface VpnServerDef {
  id: string;
  country: string;
  city: string;
  flag: string;
  baseLatency: number;
  region: string;
}

const VPN_SERVERS: VpnServerDef[] = [
  { id: 'us-nyc-1', country: 'United States', city: 'New York', flag: '🇺🇸', baseLatency: 12, region: 'NA' },
  { id: 'us-lax-1', country: 'United States', city: 'Los Angeles', flag: '🇺🇸', baseLatency: 18, region: 'NA' },
  { id: 'us-mia-1', country: 'United States', city: 'Miami', flag: '🇺🇸', baseLatency: 15, region: 'NA' },
  { id: 'us-chi-1', country: 'United States', city: 'Chicago', flag: '🇺🇸', baseLatency: 14, region: 'NA' },
  { id: 'ca-tor-1', country: 'Canada', city: 'Toronto', flag: '🇨🇦', baseLatency: 20, region: 'NA' },
  { id: 'uk-lon-1', country: 'United Kingdom', city: 'London', flag: '🇬🇧', baseLatency: 35, region: 'EU' },
  { id: 'de-fra-1', country: 'Germany', city: 'Frankfurt', flag: '🇩🇪', baseLatency: 38, region: 'EU' },
  { id: 'nl-ams-1', country: 'Netherlands', city: 'Amsterdam', flag: '🇳🇱', baseLatency: 36, region: 'EU' },
  { id: 'fr-par-1', country: 'France', city: 'Paris', flag: '🇫🇷', baseLatency: 40, region: 'EU' },
  { id: 'ch-zur-1', country: 'Switzerland', city: 'Zurich', flag: '🇨🇭', baseLatency: 42, region: 'EU' },
  { id: 'se-sto-1', country: 'Sweden', city: 'Stockholm', flag: '🇸🇪', baseLatency: 45, region: 'EU' },
  { id: 'es-mad-1', country: 'Spain', city: 'Madrid', flag: '🇪🇸', baseLatency: 48, region: 'EU' },
  { id: 'it-mil-1', country: 'Italy', city: 'Milan', flag: '🇮🇹', baseLatency: 44, region: 'EU' },
  { id: 'jp-tok-1', country: 'Japan', city: 'Tokyo', flag: '🇯🇵', baseLatency: 85, region: 'APAC' },
  { id: 'sg-sgp-1', country: 'Singapore', city: 'Singapore', flag: '🇸🇬', baseLatency: 72, region: 'APAC' },
  { id: 'au-syd-1', country: 'Australia', city: 'Sydney', flag: '🇦🇺', baseLatency: 95, region: 'APAC' },
  { id: 'kr-sel-1', country: 'South Korea', city: 'Seoul', flag: '🇰🇷', baseLatency: 88, region: 'APAC' },
  { id: 'in-mum-1', country: 'India', city: 'Mumbai', flag: '🇮🇳', baseLatency: 78, region: 'APAC' },
  { id: 'br-sao-1', country: 'Brazil', city: 'São Paulo', flag: '🇧🇷', baseLatency: 110, region: 'SA' },
  { id: 'ae-dxb-1', country: 'UAE', city: 'Dubai', flag: '🇦🇪', baseLatency: 65, region: 'ME' },
  { id: 'za-jnb-1', country: 'South Africa', city: 'Johannesburg', flag: '🇿🇦', baseLatency: 120, region: 'AF' },
  { id: 'hk-hkg-1', country: 'Hong Kong', city: 'Hong Kong', flag: '🇭🇰', baseLatency: 80, region: 'APAC' },
  { id: 'is-rkv-1', country: 'Iceland', city: 'Reykjavik', flag: '🇮🇸', baseLatency: 55, region: 'EU' },
  { id: 'ro-buc-1', country: 'Romania', city: 'Bucharest', flag: '🇷🇴', baseLatency: 50, region: 'EU' },
];

const RELAY_NODES = [
  'relay-alpha.ghostlane.net',
  'relay-bravo.ghostlane.net',
  'relay-charlie.ghostlane.net',
  'relay-delta.ghostlane.net',
  'relay-echo.ghostlane.net',
  'relay-foxtrot.ghostlane.net',
];

function generateVpnIp(): string {
  const subnets = ['10.8', '10.9', '172.16', '172.17'];
  const subnet = subnets[Math.floor(Math.random() * subnets.length)];
  return `${subnet}.${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254) + 1}`;
}

function generateFingerprint(): string {
  return crypto.randomBytes(32).toString('hex').substring(0, 16).toUpperCase();
}

function pickRelay(): string {
  return RELAY_NODES[Math.floor(Math.random() * RELAY_NODES.length)];
}

function simulateLoad(): number {
  return Math.floor(Math.random() * 65) + 10;
}

function simulateLatency(base: number): number {
  return base + Math.floor(Math.random() * 15) - 5;
}

function simulateBandwidth(connectedAt: Date): { bytesUp: number; bytesDown: number } {
  const seconds = Math.floor((Date.now() - connectedAt.getTime()) / 1000);
  const bytesUp = Math.floor(seconds * (Math.random() * 5000 + 2000));
  const bytesDown = Math.floor(seconds * (Math.random() * 25000 + 8000));
  return { bytesUp, bytesDown };
}

function formatSessionRow(row: any) {
  const bw = row.status === 'active' ? simulateBandwidth(new Date(row.connected_at)) : { bytesUp: Number(row.bytes_up), bytesDown: Number(row.bytes_down) };
  return {
    id: row.id,
    connected: row.status === 'active',
    serverId: row.server_id,
    serverName: `${row.server_city}, ${row.server_country}`,
    serverCountry: row.server_country,
    serverCity: row.server_city,
    connectedAt: row.connected_at?.toISOString?.() || row.connected_at,
    disconnectedAt: row.disconnected_at?.toISOString?.() || row.disconnected_at || null,
    bytesUp: bw.bytesUp,
    bytesDown: bw.bytesDown,
    assignedIp: row.assigned_ip,
    fingerprintHash: row.fingerprint_hash,
    relayNode: row.relay_node,
    killSwitch: row.kill_switch,
    status: row.status,
  };
}

router.get('/servers', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const servers = VPN_SERVERS.map((s) => ({
      id: s.id,
      country: s.country,
      city: s.city,
      flag: s.flag,
      latencyMs: simulateLatency(s.baseLatency),
      load: simulateLoad(),
      protocol: 'WireGuard',
      region: s.region,
    }));
    res.json({ servers });
  } catch (err) {
    console.error('VPN servers error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/session', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const result = await pool.query(
      `SELECT * FROM vpn_sessions WHERE user_id = $1 AND status = 'active' ORDER BY connected_at DESC LIMIT 1`,
      [userId]
    );
    if (result.rows.length === 0) {
      res.json({ session: { connected: false, killSwitch: false } });
      return;
    }
    res.json({ session: formatSessionRow(result.rows[0]) });
  } catch (err) {
    console.error('VPN session error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/connect', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { serverId } = req.body;
    if (!serverId) {
      res.status(400).json({ error: 'Server ID required' });
      return;
    }

    const server = VPN_SERVERS.find((s) => s.id === serverId);
    if (!server) {
      res.status(400).json({ error: 'Invalid server ID' });
      return;
    }

    const prevActive = await pool.query(
      `SELECT * FROM vpn_sessions WHERE user_id = $1 AND status = 'active'`,
      [userId]
    );
    for (const prev of prevActive.rows) {
      const prevBw = simulateBandwidth(new Date(prev.connected_at));
      await pool.query(
        `UPDATE vpn_sessions SET status = 'disconnected', disconnected_at = NOW(), bytes_up = $2, bytes_down = $3 WHERE id = $1`,
        [prev.id, prevBw.bytesUp, prevBw.bytesDown]
      );
    }

    const assignedIp = generateVpnIp();
    const fingerprintHash = generateFingerprint();
    const relayNode = pickRelay();

    const result = await pool.query(
      `INSERT INTO vpn_sessions (user_id, server_id, server_name, server_country, server_city, assigned_ip, fingerprint_hash, relay_node)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [userId, serverId, `${server.city}, ${server.country}`, server.country, server.city, assignedIp, fingerprintHash, relayNode]
    );

    res.json({ session: formatSessionRow(result.rows[0]) });
  } catch (err) {
    console.error('VPN connect error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/disconnect', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    const active = await pool.query(
      `SELECT * FROM vpn_sessions WHERE user_id = $1 AND status = 'active' ORDER BY connected_at DESC LIMIT 1`,
      [userId]
    );

    if (active.rows.length === 0) {
      res.json({ session: { connected: false, killSwitch: false } });
      return;
    }

    const row = active.rows[0];
    const bw = simulateBandwidth(new Date(row.connected_at));

    const updated = await pool.query(
      `UPDATE vpn_sessions SET status = 'disconnected', disconnected_at = NOW(), bytes_up = $2, bytes_down = $3
       WHERE id = $1 RETURNING *`,
      [row.id, bw.bytesUp, bw.bytesDown]
    );

    const endedSession = formatSessionRow(updated.rows[0]);
    res.json({
      session: {
        ...endedSession,
        connected: false,
      },
    });
  } catch (err) {
    console.error('VPN disconnect error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/kill-switch', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { enabled } = req.body;

    const active = await pool.query(
      `SELECT * FROM vpn_sessions WHERE user_id = $1 AND status = 'active' ORDER BY connected_at DESC LIMIT 1`,
      [userId]
    );

    if (active.rows.length === 0) {
      res.json({ session: { connected: false, killSwitch: !!enabled } });
      return;
    }

    await pool.query(
      `UPDATE vpn_sessions SET kill_switch = $2 WHERE id = $1`,
      [active.rows[0].id, !!enabled]
    );

    const updated = await pool.query(`SELECT * FROM vpn_sessions WHERE id = $1`, [active.rows[0].id]);
    res.json({ session: formatSessionRow(updated.rows[0]) });
  } catch (err) {
    console.error('VPN kill switch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/history', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const offset = parseInt(req.query.offset as string) || 0;

    const [sessionsResult, countResult] = await Promise.all([
      pool.query(
        `SELECT * FROM vpn_sessions WHERE user_id = $1 ORDER BY connected_at DESC LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      ),
      pool.query(`SELECT COUNT(*) FROM vpn_sessions WHERE user_id = $1`, [userId]),
    ]);

    const sessions = sessionsResult.rows.map(formatSessionRow);
    const total = parseInt(countResult.rows[0].count);

    res.json({ sessions, total });
  } catch (err) {
    console.error('VPN history error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/search', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { query } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      res.status(400).json({ error: 'Search query required' });
      return;
    }

    const active = await pool.query(
      `SELECT id FROM vpn_sessions WHERE user_id = $1 AND status = 'active' LIMIT 1`,
      [userId]
    );

    if (active.rows.length === 0) {
      res.status(400).json({ error: 'VPN must be connected to search' });
      return;
    }

    const sessionId = active.rows[0].id;
    const serpApiKey = process.env.SERPAPI_KEY;

    if (!serpApiKey) {
      res.status(500).json({ error: 'Search service not configured' });
      return;
    }

    const params = new URLSearchParams({
      q: query.trim(),
      api_key: serpApiKey,
      engine: 'google',
      num: '10',
    });

    const serpRes = await fetch(`https://serpapi.com/search.json?${params.toString()}`);

    if (!serpRes.ok) {
      console.error(`SerpAPI error: ${serpRes.status} ${serpRes.statusText}`);
      res.status(502).json({ error: 'Search service temporarily unavailable' });
      return;
    }

    let serpData: any;
    try {
      serpData = await serpRes.json();
    } catch {
      console.error('SerpAPI returned non-JSON response');
      res.status(502).json({ error: 'Search service returned invalid response' });
      return;
    }

    if (serpData.error) {
      console.error('SerpAPI error:', serpData.error);
      res.status(502).json({ error: 'Search service error' });
      return;
    }

    const results: { title: string; link: string; snippet: string; position: number }[] = [];

    if (serpData.organic_results) {
      for (const item of serpData.organic_results) {
        results.push({
          title: item.title || '',
          link: item.link || '',
          snippet: item.snippet || '',
          position: item.position || 0,
        });
      }
    }

    await pool.query(
      `INSERT INTO vpn_searches (session_id, user_id, query, results_count) VALUES ($1, $2, $3, $4)`,
      [sessionId, userId, query.trim(), results.length]
    );

    res.json({ results, query: query.trim() });
  } catch (err) {
    console.error('VPN search error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

router.post('/search/log-open', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { url, query } = req.body;

    if (!url) {
      res.status(400).json({ error: 'URL required' });
      return;
    }

    const active = await pool.query(
      `SELECT id FROM vpn_sessions WHERE user_id = $1 AND status = 'active' LIMIT 1`,
      [userId]
    );

    const sessionId = active.rows.length > 0 ? active.rows[0].id : null;

    await pool.query(
      `INSERT INTO vpn_searches (session_id, user_id, query, results_count, url_opened) VALUES ($1, $2, $3, 0, $4)`,
      [sessionId, userId, query || 'direct', url]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('VPN log-open error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/searches', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

    const result = await pool.query(
      `SELECT * FROM vpn_searches WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [userId, limit]
    );

    const searches = result.rows.map((row) => ({
      id: row.id,
      sessionId: row.session_id,
      query: row.query,
      resultsCount: row.results_count,
      urlOpened: row.url_opened,
      createdAt: row.created_at?.toISOString?.() || row.created_at,
    }));

    res.json({ searches });
  } catch (err) {
    console.error('VPN searches error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const vpnRouter = router;
