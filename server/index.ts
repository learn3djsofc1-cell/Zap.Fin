import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { pool, initDatabase } from './db.js';
import authRoutes from './routes/auth.js';
import cardRoutes from './routes/cards.js';
import walletRoutes from './routes/wallet.js';

const isProduction = process.env.NODE_ENV === 'production';
const app = express();
const PgSession = connectPgSimple(session);

if (isProduction) {
  app.set('trust proxy', 1);
}

app.use(express.json());

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret && isProduction) {
  console.error('FATAL: SESSION_SECRET must be set in production');
  process.exit(1);
}

app.use(session({
  store: new PgSession({
    pool,
    tableName: 'session',
    createTableIfMissing: true,
  }),
  secret: sessionSecret || 'zap-fin-dev-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    sameSite: 'lax',
  },
}));

app.use('/api/auth', authRoutes(pool));
app.use('/api/cards', cardRoutes(pool));
app.use('/api/wallet', walletRoutes(pool));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const PORT = parseInt(process.env.API_PORT || '3001', 10);

async function start() {
  await initDatabase();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`API server running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
