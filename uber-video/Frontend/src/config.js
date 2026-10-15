// Only public configuration belongs in browser code.
export const API_BASE_URL = import.meta.env.VITE_BASE_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:8000');
