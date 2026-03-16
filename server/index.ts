import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { initializeDatabase } from './schema.js';
import { authRouter } from './auth.js';
import { agentsRouter } from './routes/agents.js';
import { transactionsRouter } from './routes/transactions.js';
import { policiesRouter } from './routes/policies.js';
import { overviewRouter } from './routes/overview.js';
import { apiKeysRouter } from './routes/apiKeys.js';
import { integrationsRouter } from './routes/integrations.js';

const isProduction = process.env.NODE_ENV === 'production';
const app = express();

if (isProduction) {
  app.set('trust proxy', 1);
}

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/agents', agentsRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/policies', policiesRouter);
app.use('/api/overview', overviewRouter);
app.use('/api/api-keys', apiKeysRouter);
app.use('/api/integrations', integrationsRouter);

app.use('/api', (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled API error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(path.join(distPath, 'index.html'))) {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = parseInt(process.env.PORT || '3001', 10);

async function start() {
  try {
    await initializeDatabase();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`API server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

export default app;
