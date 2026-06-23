const info = (...args) => console.log('[INFO]', ...args)
const warn = (...args) => console.warn('[WARN]', ...args)
const error = (...args) => console.error('[ERROR]', ...args)
const debug = (...args) => {
    if (process.env.NODE_ENV !== 'production') {
        console.debug('[DEBUG]', ...args)
    }
}

export default {
    info,
    warn,
    error,
    debug,
}
