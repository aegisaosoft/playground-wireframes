import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userService, UserProfile } from '@/services/user.service';
import { preferencesService, UserPreferences, BrandPreferences } from '@/services/preferences.service';
import { useToast } from '@/hooks/use-toast';
import { sessionManager, SessionData } from '@/lib/session-manager';

interface UserContextType {
  user: UserProfile | null;
  preferences: UserPreferences | null;
  brandPreferences: BrandPreferences | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (userData: UserProfile, token?: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<UserProfile>) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  updateBrandPreferences: (brandData: Partial<BrandPreferences>) => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshPreferences: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [brandPreferences, setBrandPreferences] = useState<BrandPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check if user is authenticated (has valid token)
  const isAuthenticated = !!user;

  // Load user profile from API on mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setIsLoading(true);
        
        // First, try to restore from session manager
        const sessionData = sessionManager.getSession();
        if (sessionData && sessionData.user) {
          setUser(sessionData.user);
          setPreferences(sessionData.preferences || null);
          setBrandPreferences(sessionData.brandPreferences || null);
        }
        
        // Check if we have a token for API validation
        const token = sessionManager.getToken();
        if (!token) {
          setUser(null);
          return;
        }

        // Validate session with API (but don't fail if API is unavailable)
        try {
          const profile = await userService.getCurrentUser();
          setUser(profile);
          
          // Update session with fresh data
          sessionManager.saveSession({
            user: profile,
            token: token
          });
          
        } catch (apiError) {
          
          // Check if it's a 401/403 error (authentication issue)
          const isAuthError = apiError instanceof Error && (
            apiError.message.includes('401') || 
            apiError.message.includes('403') ||
            apiError.message.includes('Unauthorized') ||
            apiError.message.includes('Forbidden')
          );
          
          if (isAuthError) {
            sessionManager.clearSession();
            setUser(null);
            return;
          } else {
            // For network/server errors, keep the stored session
            if (sessionData && sessionData.user) {
              setUser(sessionData.user);
            }
          }
        }
        
        // Load user preferences
        try {
          const userPrefs = await preferencesService.getUserPreferences();
          setPreferences(userPrefs);
          sessionManager.saveSession({ preferences: userPrefs });
        } catch (error) {
          // Preferences are optional, so we continue
        }
        
        // Load brand preferences
        try {
          const brandPrefs = await preferencesService.getBrandPreferences();
          setBrandPreferences(brandPrefs);
          sessionManager.saveSession({ brandPreferences: brandPrefs });
          if (brandPrefs) {
          } else {
          }
        } catch (error) {
          // Brand preferences are optional, so we continue
        }
        
      } catch (error) {
        // Error handling is now done in the API validation section above
      } finally {
        setIsLoading(false);
      }
    };

    // Listen for session expiration events
    const handleSessionExpired = () => {
      setUser(null);
      setPreferences(null);
      setBrandPreferences(null);
      toast({
        title: "Session Expired",
        description: "Your session has expired due to inactivity. Please log in again.",
        variant: "destructive",
      });
    };

    window.addEventListener('sessionExpired', handleSessionExpired);

    loadUserProfile();

    // Cleanup
    return () => {
      window.removeEventListener('sessionExpired', handleSessionExpired);
    };
  }, [toast]);

  const login = (userData: UserProfile, token?: string) => {
    setUser(userData);
    try {
      console.log('[UserContext] login()', { role: (userData as any).role, profileRole: (userData as any).profile?.role });
      localStorage.setItem('debug_context_role', String((userData as any).role || ''));
      // Persist to session manager (keep role with token)
      sessionManager.saveSession({ user: userData, token });
    } catch {}
    
    // Save to session manager
    if (token) {
      sessionManager.saveSession({
        user: userData,
        token: token
      });
    }
  };

  const logout = () => {
    setUser(null);
    setPreferences(null);
    setBrandPreferences(null);
    
    // Clear session
    sessionManager.clearSession();
  };

  const updateUser = (userData: Partial<UserProfile>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const updatePreferences = async (prefs: Partial<UserPreferences>) => {
    try {
      await preferencesService.updateUserPreferences(prefs);
      setPreferences(prev => ({ ...prev, ...prefs }));
      // Preferences updated successfully
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateBrandPreferences = async (brandData: Partial<BrandPreferences>) => {
    try {
      await preferencesService.updateBrandPreferences(brandData);
      setBrandPreferences(prev => ({ ...prev, ...brandData }));
      // Brand preferences updated successfully
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update brand preferences. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      setIsLoading(true);
      const profile = await userService.getCurrentUser();
      setUser(profile);
      try {
        console.log('[UserContext] refreshUser()', { role: profile.role });
        localStorage.setItem('debug_context_role', String(profile.role || ''));
      } catch {}
      
      // Update localStorage with fresh data
      const updatedUser = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        profile: {
          role: profile.role,
          isEmailVerified: profile.isEmailVerified,
          isActive: profile.isActive,
          profileImageUrl: profile.profileImageUrl
        }
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPreferences = async () => {
    try {
      const userPrefs = await preferencesService.getUserPreferences();
      setPreferences(userPrefs);
      
      const brandPrefs = await preferencesService.getBrandPreferences();
      setBrandPreferences(brandPrefs);
      
    } catch (error) {
      throw error;
    }
  };

  const value: UserContextType = {
    user,
    preferences,
    brandPreferences,
    isLoading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    updatePreferences,
    updateBrandPreferences,
    refreshUser,
    refreshPreferences,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
