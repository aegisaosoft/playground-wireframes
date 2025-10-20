/**
 * Session Manager - Handles global session persistence and management
 */

import { UserProfile } from '@/services/user.service';
import { UserPreferences, BrandPreferences } from '@/services/preferences.service';

export interface SessionData {
  user?: UserProfile;
  token?: string;
  preferences?: UserPreferences;
  brandPreferences?: BrandPreferences;
  lastActivity?: number; // Unix timestamp
}

class SessionManager {
  private static instance: SessionManager;
  private sessionKey = 'app_session';
  private tokenKey = 'auth_token';
  private userKey = 'user';
  private activityTimeout = 30 * 60 * 1000; // 30 minutes
  private checkInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startActivityMonitoring();
  }

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /**
   * Save session data to localStorage
   */
  public saveSession(sessionData: Partial<SessionData>): void {
    try {
      const existingSession = this.getSession();
      const updatedSession = {
        ...existingSession,
        ...sessionData,
        lastActivity: Date.now()
      };

      localStorage.setItem(this.sessionKey, JSON.stringify(updatedSession));
      
      // Also maintain backward compatibility
      if (sessionData.token) {
        localStorage.setItem(this.tokenKey, sessionData.token);
      }
      if (sessionData.user) {
        localStorage.setItem(this.userKey, JSON.stringify(sessionData.user));
      }

      console.log('💾 Session saved successfully');
    } catch (error) {
      console.error('❌ Failed to save session:', error);
    }
  }

  /**
   * Get session data from localStorage
   */
  public getSession(): SessionData | null {
    try {
      const sessionData = localStorage.getItem(this.sessionKey);
      if (!sessionData) return null;

      const session = JSON.parse(sessionData) as SessionData;
      
      // Check if session is expired
      if (this.isSessionExpired(session)) {
        this.clearSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('❌ Failed to get session:', error);
      return null;
    }
  }

  /**
   * Check if session is expired
   */
  private isSessionExpired(session: SessionData): boolean {
    if (!session.lastActivity) {
      // If no activity timestamp, consider it valid (for backward compatibility)
      return false;
    }
    
    const now = Date.now();
    const timeSinceActivity = now - session.lastActivity;
    
    // Only expire if it's been more than 2 hours (more lenient than 30 minutes)
    const extendedTimeout = 2 * 60 * 60 * 1000; // 2 hours
    return timeSinceActivity > extendedTimeout;
  }

  /**
   * Update last activity timestamp
   */
  public updateActivity(): void {
    const session = this.getSession();
    if (session) {
      this.saveSession({ lastActivity: Date.now() });
    }
  }

  /**
   * Clear session data
   */
  public clearSession(): void {
    try {
      localStorage.removeItem(this.sessionKey);
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    } catch (error) {
      console.error('❌ Failed to clear session:', error);
    }
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    const session = this.getSession();
    return session !== null && !!session.token && !!session.user;
  }

  /**
   * Get current user from session
   */
  public getCurrentUser(): SessionData['user'] | null {
    const session = this.getSession();
    return session?.user || null;
  }

  /**
   * Get auth token from session
   */
  public getToken(): string | null {
    const session = this.getSession();
    return session?.token || null;
  }

  /**
   * Start monitoring user activity
   */
  private startActivityMonitoring(): void {
    // Update activity on user interactions
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const updateActivity = () => {
      this.updateActivity();
    };

    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Check session validity every 5 minutes
    this.checkInterval = setInterval(() => {
      const session = this.getSession();
      if (session && this.isSessionExpired(session)) {
        console.log('⏰ Session expired due to inactivity');
        this.clearSession();
        // Dispatch custom event to notify components
        window.dispatchEvent(new CustomEvent('sessionExpired'));
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Stop monitoring (cleanup)
   */
  public destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Extend session timeout
   */
  public extendSession(): void {
    this.updateActivity();
  }

  /**
   * Get session info for debugging
   */
  public getSessionInfo(): {
    isAuthenticated: boolean;
    hasToken: boolean;
    hasUser: boolean;
    lastActivity: number | null;
    timeUntilExpiry: number | null;
  } {
    const session = this.getSession();
    const now = Date.now();
    
    return {
      isAuthenticated: this.isAuthenticated(),
      hasToken: !!session?.token,
      hasUser: !!session?.user,
      lastActivity: session?.lastActivity || null,
      timeUntilExpiry: session ? Math.max(0, this.activityTimeout - (now - session.lastActivity)) : null
    };
  }
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance();

// Export types
export type { SessionData };