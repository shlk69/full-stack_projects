import Redis from "ioredis";

export const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || "6379", 10), 
    password: process.env.REDIS_PASSWORD,
    keepAlive: 10000 
});

// Catch network drops so your app never crashes
redisClient.on('error', (err) => {
    console.error('[ioredis] Connection error occurred:', err.message);
});

redisClient.on('connect', () => {
    console.log('Redis connected');
});
