// Production serves the website and API from the same HTTPS origin.
export const SERVER_URL = import.meta.env.PROD
  ? window.location.origin
  : (import.meta.env.VITE_SERVER_URL || 'http://localhost:8000').replace(/\/$/, '');
export const CLIENT_URL = import.meta.env.PROD
  ? window.location.origin
  : (import.meta.env.VITE_CLIENT_URL || window.location.origin).replace(/\/$/, '');
