const requiredEnvs = [
    'MONGODB_URL',
    'JWT_SECRET',
    'FIREBASE_PROJECT_ID',
    'GEMINI_URL',
    'GEMINI_API_KEY',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
]

const validateEnv = () => {
    if (process.env.NODE_ENV === 'production' && (process.env.JWT_SECRET || '').length < 32) throw new Error('JWT secret must contain at least 32 characters');
    const missing = requiredEnvs.filter((name) => !process.env[name])
    if (missing.length) {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}`
        )
    }
}

export default validateEnv
