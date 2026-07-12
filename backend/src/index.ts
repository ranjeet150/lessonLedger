import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authMiddleware } from './middleware/auth';
import authRoutes from './routes/auth';
import roadmapRoutes from './routes/roadmaps';
import taskRoutes from './routes/tasks';
import streakRoutes from './routes/streaks';
import achievementRoutes from './routes/achievements';
import walletRoutes from './routes/wallet';
import nftRoutes from './routes/nft';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/tasks', authMiddleware, taskRoutes);
app.use('/api/streaks', authMiddleware, streakRoutes);
app.use('/api/achievements', authMiddleware, achievementRoutes);
app.use('/api/wallet', authMiddleware, walletRoutes);
app.use('/api/nft', authMiddleware, nftRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
