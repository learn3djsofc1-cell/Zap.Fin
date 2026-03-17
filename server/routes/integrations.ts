import { Response, Router } from 'express';
import pool from '../db.js';
import { authMiddleware, AuthRequest } from '../auth.js';

const router = Router();
router.use(authMiddleware);

const AVAILABLE_PROVIDERS = [
  {
    id: 'openclaw',
    name: 'OpenClaw',
    description: 'MCP-based agent framework connector. Enable your AI agents to interact with GhostLane through the Model Context Protocol.',
    category: 'agent-framework',
    configFields: ['mcp_endpoint', 'agent_id'],
  },
  {
    id: 'claude',
    name: 'Claude (Anthropic)',
    description: 'AI assistant powered by Anthropic via Replit AI Integration. No API key required — charges are billed to your Replit credits.',
    category: 'ai',
    configFields: ['model', 'max_tokens'],
  },
];

router.get('/providers', async (_req: AuthRequest, res: Response): Promise<void> => {
  res.json({ providers: AVAILABLE_PROVIDERS });
});

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT * FROM integrations WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );

    const integrations = AVAILABLE_PROVIDERS.map((provider) => {
      const existing = result.rows.find((r: { provider: string }) => r.provider === provider.id);
      return {
        ...provider,
        status: existing?.status || 'disconnected',
        config: existing?.config || {},
        integrationId: existing?.id || null,
        connectedAt: existing?.created_at || null,
      };
    });

    res.json({ integrations });
  } catch (err) {
    console.error('List integrations error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:provider/connect', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { provider } = req.params;
    const { config } = req.body;

    const validProvider = AVAILABLE_PROVIDERS.find((p) => p.id === provider);
    if (!validProvider) {
      res.status(400).json({ error: 'Invalid provider' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO integrations (user_id, provider, status, config)
       VALUES ($1, $2, 'connected', $3)
       ON CONFLICT (user_id, provider) DO UPDATE SET status = 'connected', config = $3, updated_at = NOW()
       RETURNING *`,
      [req.userId, provider, JSON.stringify(config || {})]
    );

    res.json({ integration: result.rows[0] });
  } catch (err) {
    console.error('Connect integration error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:provider/disconnect', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { provider } = req.params;

    const result = await pool.query(
      `UPDATE integrations SET status = 'disconnected', updated_at = NOW() WHERE user_id = $1 AND provider = $2 RETURNING *`,
      [req.userId, provider]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Integration not found' });
      return;
    }

    res.json({ integration: result.rows[0] });
  } catch (err) {
    console.error('Disconnect integration error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:provider/config', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { provider } = req.params;
    const { config } = req.body;

    if (!config || typeof config !== 'object') {
      res.status(400).json({ error: 'Config must be an object' });
      return;
    }

    const result = await pool.query(
      `UPDATE integrations SET config = $1, updated_at = NOW() WHERE user_id = $2 AND provider = $3 RETURNING *`,
      [JSON.stringify(config), req.userId, provider]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Integration not found' });
      return;
    }

    res.json({ integration: result.rows[0] });
  } catch (err) {
    console.error('Update integration config error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const integrationsRouter = router;
