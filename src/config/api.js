// Read from environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  'https://goplayground-web-api-2025-cgbkabcxh6abccd6.canadacentral-01.azurewebsites.net';

// Add /api to base URL
const API_FULL_URL = `${API_BASE_URL}/api`;

// Debug: Log the API base URL
console.log('API Base URL:', API_FULL_URL);

// Export as named export
export const API_URL = API_BASE_URL;

// Export as default
export default API_BASE_URL;
