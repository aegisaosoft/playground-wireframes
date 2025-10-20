/**
 * API Client for communicating with the .NET backend
 */

// 
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  'https://goplayground-web-api-2025-cgbkabcxh6abccd6.canadacentral-01.azurewebsites.net';

// 
const API_FULL_URL = `${API_BASE_URL}/api`;

// Debug: Log the API base URL
console.log('API Base URL:', API_FULL_URL);

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

/**
 * Main API client class for making HTTP requests to the backend
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get the authorization token from localStorage
   */
  private getAuthToken(): string | null {
    // Prefer dedicated auth token if present
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) return storedToken;

    // Backward-compat: some flows may have token nested in the user object
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        return userData.token || null;
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Build headers for API requests
   */
  private buildHeaders(customHeaders?: Record<string, string>): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Generic request method
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: this.buildHeaders(options.headers),
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      // Handle empty responses (204 No Content)
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options,