// Read from environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  'https://goplayground-web-api-2025-cgbkabcxh6abccd6.canadacentral-01.azurewebsites.net/api';

export const API_FULL_URL = API_BASE_URL;
  
// Export as named export
export const API_URL = API_BASE_URL;

// Export as default
export default API_BASE_URL;
