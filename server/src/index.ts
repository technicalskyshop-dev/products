import { app } from './app.js';
import { env } from './config/env.js';
import { prisma } from './db/prisma.js';

const server = app.listen(env.PORT, () => {
  console.log(`====================================================`);
  console.log(` 🚀 CURATED DISCOVERY BACKEND SERVER RUNNING`);
  console.log(` 📡 Address: http://localhost:${env.PORT}`);
  console.log(` 🌍 Environment: ${env.NODE_ENV}`);
  console.log(` 🛡️  CORS Allowed Origin: ${env.FRONTEND_URL}`);
  console.log(`====================================================`);
});

// Graceful Shutdown
const shutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log('Database connection closed.');
      process.exit(0);
    } catch (err) {
      console.error('Error during shutdown:', err);
      process.exit(1);
    }
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

