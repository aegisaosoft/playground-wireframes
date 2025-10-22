/**
 * API Client for communicating with the .NET backend
 */

// Read from environment variable (compat with non-Vite type checking)
const ENV_BASE = (import.meta as any)?.env?.VITE_API_URL as string | undefined;
// Smart default: when running locally without an env, target local API; otherwise Azure
const DEFAULT_BASE = (typeof window !== 'undefined' && window.location.hostname === 'localhost')
  ? 'https://localhost:7183'
  : 'https://goplayground-web-api-2025-cgbkabcxh6abccd6.canadacentral-01.azurewebsites.net';
const API_BASE_URL = ENV_BASE || DEFAULT_BASE;

// Add /api to base URL
const API_FULL_URL = `${API_BASE_URL}/api`;

// Debug: Log the API base URL
console.log('API Base URL:', API_FULL_URL);

/**
 * Resolve a backend-served resource (like /images/...) to an absolute URL on the API origin.
 * Leaves absolute URLs untouched.
 */
export function resolveApiResourceUrl(path: string | undefined | null): string | undefined | null {
  if (!path) return path as any;
  if (/^https?:\/\//i.test(path)) return path;
  // Keep avatar assets on frontend origin
  if (path.startsWith('/avatars/') || /^[\w.-]+\.(png|jpg|jpeg|gif|webp)$/i.test(path) && path.toLowerCase().includes('avatar')) {
    return path; // served by frontend /public
  }
  // Static files (e.g., /images/...) are hosted at the API root, not under /api
  if (path.startsWith('/')) return `${API_BASE_URL}${path}`;
  // Handle bare filenames by prefixing with /images/
  if (/^[\w.-]+\.(png|jpg|jpeg|gif|webp)$/i.test(path)) {
    return `${API_BASE_URL}/images/${path}`;
  }
  return `${API_BASE_URL}/${path}`;
}

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

    // Add Bearer token if present (fallback for JWT-auth APIs)
    try {
      const token = this.getAuthToken();
      if (token && !headers['Authorization']) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch {}

    return headers;
  }

  /**
   * Generic request method
   */
  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      credentials: 'include',
      ...options,
      headers: this.buildHeaders(options.headers),
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
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
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Upload file(s) with FormData
   */
  async upload<T>(endpoint: string, formData: FormData, options?: Omit<RequestOptions, 'headers'>): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      credentials: 'include',
      ...options,
      method: (options && options.method) ? options.method : 'POST',
      body: formData,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const apiClient = new ApiClient(API_FULL_URL);

// Export the base URL for reference
export { API_BASE_URL, API_FULL_URL };
