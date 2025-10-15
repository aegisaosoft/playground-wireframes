/**
 * Authentication Service
 * Handles user authentication with the .NET backend
 */

import { apiClient } from '@/lib/api-client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  name: string;
  role?: string; // 'user', 'host', or 'admin'
}

// Backend response structure
interface BackendAuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    isEmailVerified: boolean;
    isActive: boolean;
    createdAt: string;
    lastLoginAt?: string;
    profileImageUrl?: string;
  };
}

// Frontend-facing response structure
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    profile?: any;
  };
}

export const authService = {
  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    console.log('🔑 Attempting login with:', credentials.email);
    
    // Call backend endpoint (case-sensitive: /Auth not /auth)
    const backendResponse = await apiClient.post<BackendAuthResponse>('/Auth/login', credentials);
    
    console.log('📥 Backend response:', backendResponse);
    
    // Check if login was successful
    if (!backendResponse.success || !backendResponse.token || !backendResponse.user) {
      throw new Error(backendResponse.message || 'Login failed');
    }
    
    // Transform backend response to frontend format
    const response: AuthResponse = {
      token: backendResponse.token,
      user: {
        id: backendResponse.user.id,
        email: backendResponse.user.email,
        name: backendResponse.user.name,
        profile: {
          role: backendResponse.user.role,
          isEmailVerified: backendResponse.user.isEmailVerified,
          isActive: backendResponse.user.isActive,
          profileImageUrl: backendResponse.user.profileImageUrl
        }
      }
    };
    
    // Store token and user data in localStorage
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('auth_token', response.token);
    
    console.log('✅ Token saved to localStorage:', response.token.substring(0, 20) + '...');
    console.log('✅ User saved to localStorage:', response.user);
    console.log('✅ Profile Image URL:', backendResponse.user.profileImageUrl || 'none');
    
    return response;
  },

  /**
   * Sign up new user
   */
  async signUp(data: SignUpRequest): Promise<AuthResponse> {
    // Call backend endpoint (case-sensitive: /Auth/register not /auth/signup)
    const backendResponse = await apiClient.post<BackendAuthResponse>('/Auth/register', {
      email: data.email,
      password: data.password,
      name: data.name,
      role: data.role || 'user'
    });
    
    // Check if registration was successful
    if (!backendResponse.success || !backendResponse.token || !backendResponse.user) {
      throw new Error(backendResponse.message || 'Registration failed');
    }
    
    // Transform backend response to frontend format
    const response: AuthResponse = {
      token: backendResponse.token,
      user: {
        id: backendResponse.user.id,
        email: backendResponse.user.email,
        name: backendResponse.user.name,
        profile: {
          role: backendResponse.user.role,
          isEmailVerified: backendResponse.user.isEmailVerified,
          isActive: backendResponse.user.isActive,
          profileImageUrl: backendResponse.user.profileImageUrl
        }
      }
    };
    
    // Store token and user data in localStorage
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('auth_token', response.token);
    
    return response;
  },

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
  },

  /**
   * Get current user
   */
  getCurrentUser(): any | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  },

  /**
   * Exchange Google ID token for backend JWT token
   */
  async googleLogin(googleIdToken: string): Promise<AuthResponse> {
    console.log('🔑 Exchanging Google token for backend JWT');
    
    const backendResponse = await apiClient.post<BackendAuthResponse>('/Auth/google-login', {
      idToken: googleIdToken
    });
    
    console.log('📥 Backend response:', backendResponse);
    
    // Check if login was successful
    if (!backendResponse.success || !backendResponse.token || !backendResponse.user) {
      throw new Error(backendResponse.message || 'Google login failed');
    }
    
    // Transform backend response to frontend format
    const response: AuthResponse = {
      token: backendResponse.token,
      user: {
        id: backendResponse.user.id,
        email: backendResponse.user.email,
        name: backendResponse.user.name,
        profile: {
          role: backendResponse.user.role,
          isEmailVerified: backendResponse.user.isEmailVerified,
          isActive: backendResponse.user.isActive,
          profileImageUrl: backendResponse.user.profileImageUrl
        }
      }
    };
    
    // Store token and user data in localStorage
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('auth_token', response.token);
    
    console.log('✅ Backend JWT Token saved:', response.token.substring(0, 20) + '...');
    console.log('✅ User saved:', response.user);
    console.log('✅ Profile Image URL:', backendResponse.user.profileImageUrl || 'none');
    
    return response;
  },
};
