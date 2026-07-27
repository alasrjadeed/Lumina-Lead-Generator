import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import leadRoutes from './routes/leads.js';
import adminRoutes from './routes/admin.js';
import widgetRoutes from './routes/widget.js';
import aiRoutes from './routes/ai.js';
import agentRoutes from './routes/agent.js';

import { setupSocketHandlers } from './socket/chatSocket.js';
import whatsappService from './services/whatsapp/whatsappClient.js';
import { initializeCronJobs } from './services/leadgen/cronJobs.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/widget', widgetRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/agent', agentRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientBuildPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientBuildPath));

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  }
});

setupSocketHandlers(io);

app.set('io', io);

const PORT = process.env.PORT || 5000;

async function connectDatabase() {
  const mongoUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017/hybrid-ai-agent';
  try {
    await mongoose.connect(mongoUrl);
    console.log('Connected to MongoDB');
    return true;
  } catch (err) {
    console.log('MongoDB not available locally, trying in-memory database...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log('Connected to in-memory MongoDB');
      return true;
    } catch (memErr) {
      console.warn('WARNING: No MongoDB available. Running in degraded mode (APIs requiring DB will fail).');
      console.warn('To fix: Install MongoDB or set MONGODB_URL in .env');
      return false;
    }
  }
}

async function startServer() {
  try {
    const dbConnected = await connectDatabase();

    try {
      await whatsappService.initialize(io);
      console.log('WhatsApp client initialized');
    } catch (err) {
      console.log('WhatsApp initialization skipped:', err.message);
    }

    if (dbConnected) {
      initializeCronJobs();
      console.log('Cron jobs started');
    }

    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API: http://localhost:${PORT}/api`);
      console.log(`Health: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
