import 'dotenv/config';
import app from './app.js';
import validateEnv from './config/validateEnv.js';
import { connection } from './config/connectDB.js';
import mongoose from 'mongoose';
import logger from './utils/logger.js';
try {
  validateEnv();
  await connection();
  const server = app.listen(Number(process.env.PORT) || 8000, () => logger.info('VA Builder server started'));
  server.on('error', error => { logger.error('Server failed to listen: ' + error.code); process.exit(1); });
  const stop = () => { server.close(async () => { await mongoose.disconnect(); process.exit(0); }); setTimeout(() => process.exit(0),10000).unref(); };
  process.on('SIGTERM',stop); process.on('SIGINT',stop);
} catch (error) { logger.error('Startup failed: ' + error.name); process.exit(1); }
