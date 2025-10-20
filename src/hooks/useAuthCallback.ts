/**
 * Auth Callback Hook
 * Handles OAuth redirects and exchanges tokens with backend
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { authService } from '@/services/auth.service';
import { useToast } from '@/hooks/use-toast';

export const useAuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Supabase OAuth disabled - using backend authentication only
    return () => {};
    
    /* DISABLED - Enable when Supabase is configured
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔵 Supabase auth event:', event);
      console.log('🔵 Session:', session);
      
      if (event === 'SIGNED_IN' && session) {
        console.log('🔵 User signed in via Supabase');
        console.log('🔵 Provider token:', session.provider_token ? 'exists' : 'missing');
        console.log('🔵 Access token:', session.access_token ? 'exists' : 'missing');
        
        try {
          // Get the ID token from Supabase session
          const idToken = session.provider_token || session.access_token;
          
          if (!idToken) {
            console.warn('⚠️ No ID token in session, skipping backend exchange');
            return;
          }

          console.log('🔑 Exchanging token with backend...');
          console.log('🔑 Token (first 50 chars):', idToken.substring(0, 50));
          
          // Exchange Google token for backend JWT
          const backendAuth = await authService.googleLogin(idToken);
          
          console.log('✅ Backend JWT received!', backendAuth);
          
          // Reload the page to ensure all components refresh with new auth
          window.location.href = '/account';
          
        } catch (error) {
          console.error('❌ Error exchanging token:', error);
          
          // Even if backend exchange fails, user is still logged in via Supabase
          // Navigate anyway
          toast({
            title: "Note",
            description: "Using Supabase authentication. Some features may be limited.",
            variant: "default",
          });
          
          navigate('/account');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
    */
  }, [navigate, toast]);
};

