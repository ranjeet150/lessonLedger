import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authMiddleware } from './middleware/auth';
import { generalRateLimiter, authRateLimiter } from './middleware/rateLimiter';
import { requestLogger, errorHandler, notFoundHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
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
app.use(requestLogger);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Apply general rate limiting across all API endpoints (100 req/min)
app.use('/api', generalRateLimiter);

// Specific routes
// Apply strict auth rate limiter to authentication endpoints (5 req/min)
app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/tasks', authMiddleware, taskRoutes);
app.use('/api/streaks', authMiddleware, streakRoutes);
app.use('/api/achievements', authMiddleware, achievementRoutes);
app.use('/api/wallet', authMiddleware, walletRoutes);
app.use('/api/nft', authMiddleware, nftRoutes);

// 404 Catch-all handler for unmapped routes
app.use(notFoundHandler);

// Centralized error handling middleware with error IDs & sanitization
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

export default app;
