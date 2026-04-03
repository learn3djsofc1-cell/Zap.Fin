import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import path from 'path';
import fs from 'fs';
import { initializeDatabase } from './schema.js';
import { initLogoCache } from './coingecko.js';
import { setupWebSocket } from './websocket.js';
import { authRouter } from './auth.js';
import { overviewRouter } from './routes/overview.js';
import { mixerRouter } from './routes/mixer.js';
import { messengerRouter } from './routes/messenger.js';
import { bridgeRouter } from './routes/bridge.js';
import { vpnRouter } from './routes/vpn.js';
import { settingsRouter } from './routes/settings.js';

const isProduction = process.env.NODE_ENV === 'production';
const app = express();
const server = createServer(app);

if (isProduction) {
  app.set('trust proxy', 1);
}

app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/overview', overviewRouter);
app.use('/api/mixer', mixerRouter);
app.use('/api/messenger', messengerRouter);
app.use('/api/bridge', bridgeRouter);
app.use('/api/vpn', vpnRouter);
app.use('/api/settings', settingsRouter);

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
    initLogoCache();
    setupWebSocket(server);
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`API server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

export default app;
