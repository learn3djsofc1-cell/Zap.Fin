import express from 'express';
import path from 'path';
import fs from 'fs';

const isProduction = process.env.NODE_ENV === 'production';
const app = express();

if (isProduction) {
  app.set('trust proxy', 1);
}

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(path.join(distPath, 'index.html'))) {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = parseInt(process.env.PORT || '3001', 10);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running on port ${PORT}`);
});

export default app;
