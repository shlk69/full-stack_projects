const requiredEnvs = [
    'PORT',
    'MONGODB_URL',
    'JWT_SECRET',
    'DOMAIN_URL',
    'GEMINI_URL',
    'GEMINI_API_KEY',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
]

const validateEnv = () => {
    const missing = requiredEnvs.filter((name) => !process.env[name])
    if (missing.length) {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}`
        )
    }
}

export default validateEnv
