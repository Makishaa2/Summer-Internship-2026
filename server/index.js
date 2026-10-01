import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import apiRouter from './routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend development servers
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// API routes
app.use('/api', apiRouter);

// Serve static frontend files from workspace root
app.use(express.static(rootDir));

// SPA fallback: any remaining GET request receives index.html
app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(rootDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Not Found');
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

export const server = app.listen(PORT, '127.0.0.1', () => {
  console.log(`Backend server and SQLite database running at http://127.0.0.1:${PORT}`);
  console.log(`API endpoints available at http://127.0.0.1:${PORT}/api`);
});

export default app;
