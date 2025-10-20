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
    
    // Call backend endpoint (case-sensitive: /Auth not /auth)
    const backendResponse = await apiClient.post<BackendAuthResponse>('/Auth/login', credentials);
    
    
    // Check if login was successful
    if (!backendResponse.success || !backendResponse.token || !backendResponse.user) {
      // Handle specific error cases
      if (backendResponse.message === 'EMAIL_NOT_VERIFIED_RESENT') {
        throw new Error('Your email address is not verified. A new verification email has been sent to your inbox. Please check your email and click the verification link before logging in.');
      }
      // Preserve the specific backend error message
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
    if (!backendResponse.success) {
      // Handle specific error cases
      if (backendResponse.message === 'ACCOUNT_EXISTS_VERIFIED') {
        throw new Error('ACCOUNT_EXISTS_VERIFIED: An account with this email already exists. Please try logging in instead.');
      } else if (backendResponse.message === 'ACCOUNT_EXISTS_UNVERIFIED') {
        throw new Error('An account with this email already exists but is not verified. A new verification email has been sent to your inbox.');
      }
      throw new Error(backendResponse.message || 'Registration failed');
    }
    
    // For new registrations, backend returns null token/user until email verification
    // This is expected behavior - user needs to verify email first
    if (!backendResponse.token || !backendResponse.user) {
      // Return a special response indicating email verification is needed
      return {
        token: null,
        user: null,
        message: backendResponse.message || 'Please check your email and click the verification link to activate your account.'
      } as any;
    }
    
    // Transform backend response to frontend format (for verified users)
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
   * Forgot password - Send password reset email
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    
    const response = await apiClient.post<{ success: boolean; message: string }>('/Auth/forgot-password', {
      email: email
    });
    
    return response;
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    
    const response = await apiClient.post<{ success: boolean; message: string }>('/Auth/reset-password', {
      token: token,
      newPassword: newPassword
    });
    
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
   * Get current user from localStorage (fallback method)
   * Note: Prefer using UserContext for getting current user
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
   * Check if user is authenticated (fallback method)
   * Note: Prefer using UserContext for authentication state
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  },

  /**
   * Exchange Google ID token for backend JWT token
   */
  async googleLogin(googleIdToken: string): Promise<AuthResponse> {
    
    const backendResponse = await apiClient.post<BackendAuthResponse>('/Auth/google-login', {
      idToken: googleIdToken
    });
    
    
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
    
    
    return response;
  },
};
