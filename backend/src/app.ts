import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import csrRoutes from './routes/csr.routes';
import challengeRoutes from './routes/challenge.routes';
import badgeRoutes from './routes/badge.routes';
import rewardRoutes from './routes/reward.routes';
import leaderboardRoutes from './routes/leaderboard.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ──────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded proof files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Routes ──────────────────────────────────────────
app.use('/api/csr', csrRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// ── Health Check ─────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', module: 'social-gamification', timestamp: new Date().toISOString() });
});

// ── Global Error Handler ─────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Error]', err.message);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 EcoSphere Social+Gamification API running on http://localhost:${PORT}`);
});

export default app;
