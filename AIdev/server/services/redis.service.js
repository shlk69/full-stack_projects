import Redis from 'ioredis';

// Configure connection options
export const redisClient = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined, // Remove if no password set
    maxRetriesPerRequest: 3,
});

redisClient.on('connect', () => {
    console.log('🔄 Connecting to Redis...');
});

redisClient.on('ready', () => {
    console.log('✅ Redis client connected and ready to use');
});

redisClient.on('error', (err) => {
    console.error('❌ Redis Connection Error:', err);
});

export default redisClient;
