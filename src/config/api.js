// src/config/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  'https://goplayground-web-api-2025-cgbkabcxh6abccd6.canadacentral-01.azurewebsites.net';

export const API_URL = API_BASE_URL;

// Готовые endpoints для удобства
export const ENDPOINTS = {
  health: `${API_BASE_URL}/health`,
  experiences: `${API_BASE_URL}/api/experiences`,
  auth: {
    login: `${API_BASE_URL}/api/auth/login`,
    register: `${API_BASE_URL}/api/auth/register`,
  }
};

export default API_URL;