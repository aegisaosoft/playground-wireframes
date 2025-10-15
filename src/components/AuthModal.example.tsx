/**
 * EXAMPLE: AuthModal with Real API Integration
 * 
 * This is an example of how to update AuthModal.tsx to use the real .NET backend API.
 * 
 * To use this:
 * 1. Rename the current AuthModal.tsx to AuthModal.old.tsx (or delete it)
 * 2. Rename this file from AuthModal.example.tsx to AuthModal.tsx
 * 3. Ensure your .NET backend is running and has the auth endpoints implemented
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { VoiceOnboardingModal } from "@/components/VoiceOnboarding";
import { authService } from "@/services/auth.service"; // Import the auth service

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: { name: string; email: string }, isFirstSignIn?: boolean) => void;
}

export const AuthModal = ({ isOpen, onClose, onLogin }: AuthModalProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showVoiceOnboarding, setShowVoiceOnboarding] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Validate passwords match
        if (password !== confirmPassword) {
          toast({
            title: "Password Mismatch",
            description: "Passwords do not match.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        // Call real signup API
        const response = await authService.signUp({
          email,
          password,
          name: email.split('@')[0], // Default name from email
        });

        const user = {
          name: response.user.name,
          email: response.user.email,
        };

        // Show voice onboarding modal for new signups
        setShowVoiceOnboarding(true);
        
      } else {
        // Call real login API
        const response = await authService.login({
          email,
          password,
        });

        const user = {
          name: response.user.name,
          email: response.user.email,
        };

        onLogin(user, false);
        onClose();
        
        toast({
          title: "Welcome back!",
          description: "You've been logged in successfully.",
        });
        
        // Navigate to profile section for returning users
        navigate('/account');
      }
      
      // Reset form
      setEmail("");
      setPassword("");
      setConfirmPassword("");

    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Authentication failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement Google OAuth with your backend
      // This would typically involve redirecting to a Google OAuth endpoint
      // provided by your .NET backend
      
      toast({
        title: "Google Login",
        description: "Google login not yet implemented with backend.",
        variant: "default",
      });
      
    } catch (error) {
      console.error('Google login error:', error);
      toast({
        title: "Error",
        description: "Google login failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceOnboardingComplete = (profile: any) => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      user.profile = profile;
      localStorage.setItem('user', JSON.stringify(user));
      onLogin(user, true);
    }
    setShowVoiceOnboarding(false);
    onClose();
    navigate('/');
  };

  const handleVoiceOnboardingSkip = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      onLogin(user, true);
    }
    setShowVoiceOnboarding(false);
    onClose();
    navigate('/');
  };

  return (
    <>
      <Dialog open={isOpen && !showVoiceOnboarding} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : (isSignUp ? "Sign Up" : "Log In")}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full"
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="text-center text-sm">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary hover:underline"
              disabled={isLoading}
            >
              {isSignUp ? "Already have an account? Log in" : "Don't have an account? Sign up"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <VoiceOnboardingModal
        isOpen={showVoiceOnboarding}
        onClose={handleVoiceOnboardingSkip}
        onComplete={handleVoiceOnboardingComplete}
      />
    </>
  );
};

