// Frontend Configuration
// Uses relative path /api which is proxied by nginx to the backend
// The nginx reverse proxy handles routing /api/* to http://coffee-backend:5000

// For local development without reverse proxy, use:
// const API_BASE_URL = 'http://localhost:5000/api';

// For production with nginx reverse proxy (Kubernetes):
const API_BASE_URL = '/api';

console.log('[CONFIG.JS] API_BASE_URL:', API_BASE_URL);
console.log('[CONFIG.JS] Using relative path - nginx will proxy to backend');
