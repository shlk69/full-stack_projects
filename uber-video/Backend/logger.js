// Log operational events without request bodies, tokens, OTPs or provider responses.
const record = (level, event, error) => {
    const entry = { level, event, time: new Date().toISOString() };
    if (error) entry.errorType = error.name || 'Error';
    const output = JSON.stringify(entry);
    if (level === 'error') console.error(output);
    else if (level === 'warn') console.warn(output);
    else if (process.env.NODE_ENV !== 'test') console.info(output);
};
module.exports = { error: (event, error) => record('error', event, error), warn: event => record('warn', event), info: event => record('info', event) };
