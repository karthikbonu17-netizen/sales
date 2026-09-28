import express from 'express';
import cors from 'cors';
import { CONFIG } from './config';
import { initDatabase } from './db';
import { seedDatabase } from './db/seed';
import authRoutes from './routes/auth';
import agentRoutes from './routes/agents';
import dealsRoutes from './routes/deals';
import proposalsRoutes from './routes/proposals';
import actionsRoutes from './routes/actions';
import configRoutes from './routes/config';

const app = express();

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Initialize and seed database
initDatabase();
seedDatabase();

// Route registration
app.use('/api/auth', authRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/deals', dealsRoutes);
app.use('/api/proposals', proposalsRoutes);
app.use('/api/actions', actionsRoutes);
app.use('/api/config', configRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    platform: 'SalesMind Tri-Agent Platform',
  });
});

app.listen(CONFIG.PORT, CONFIG.HOST, () => {
  console.log(`=======================================================`);
  console.log(`🚀 SalesMind Revenue Intelligence Platform Backend Running`);
  console.log(`📡 URL: http://${CONFIG.HOST}:${CONFIG.PORT}`);
  console.log(`🛡️  Tri-Agent Engine: [Recorder, Analyst, Planner]`);
  console.log(`💾 Hindsight Memory: Partition-isolated Active`);
  console.log(`=======================================================`);
});

export default app;
