import 'dotenv/config'
import Redis from 'ioredis'

console.log('Connecting to:', process.env.REDIS_URL)

export const redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        return Math.min(times * 500,3000)
    }
})

redis.on('connect', () => {
    console.log('Redis connected successfully')
})

redis.on('error', (error) => {
    console.error('Redis connection error:',error.message)
})