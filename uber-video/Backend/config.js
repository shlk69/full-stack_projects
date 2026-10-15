const allowedOrigins = (process.env.CLIENT_ORIGIN || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5173')).split(',').map(x => x.trim()).filter(Boolean);
if (process.env.RENDER_EXTERNAL_URL) allowedOrigins.push(process.env.RENDER_EXTERNAL_URL);
const origin = (value, callback) => callback(null, !value || allowedOrigins.includes(value));
module.exports = { corsOptions: { origin, methods: ['GET', 'POST', 'PUT', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization'], credentials: true } };
