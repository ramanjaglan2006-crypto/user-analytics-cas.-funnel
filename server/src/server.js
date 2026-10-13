import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB, disconnectDB } from './config/database.js';
import { seedInitialEventsIfEmpty } from './scripts/seed.js';

const PORT = process.env.PORT || 5001;

async function bootstrap() {
  try {
    await connectDB();
    await seedInitialEventsIfEmpty();

    const server = app.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(`🚀 CausalFunnel Analytics API Server`);
      console.log(`📡 Listening on http://localhost:${PORT}`);
      console.log(`🔍 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`=========================================`);
    });

    // Graceful shutdown handling
    const shutdown = async (signal) => {
      console.log(`\n[Server] Received ${signal}. Closing HTTP server...`);
      server.close(async () => {
        console.log('[Server] HTTP server closed.');
        await disconnectDB();
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (err) {
    console.error('[Server] Fatal startup error:', err);
    process.exit(1);
  }
}

bootstrap();
