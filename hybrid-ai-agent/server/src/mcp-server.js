import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { startMCPServer } from './mcp/index.js';

dotenv.config();

async function main() {
  try {
    const mongoUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017/hybrid-ai-agent';
    await mongoose.connect(mongoUrl);
    console.log('[MCP] Connected to MongoDB');

    await startMCPServer();
  } catch (error) {
    console.error('[MCP] Failed to start:', error);
    process.exit(1);
  }
}

main();
