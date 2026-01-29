// Frontend Configuration
// Change the API_URL here to point to your backend server
// Examples:
//  - Local development: http://localhost:5000
//  - Production: https://api.yourdomain.com
//  - Docker container: http://backend:5000

const API_URL = 'http://localhost:5000';
const API_BASE_URL = `${API_URL}/api`;

console.log('[CONFIG.JS] API_URL:', API_URL);
console.log('[CONFIG.JS] API_BASE_URL:', API_BASE_URL);
