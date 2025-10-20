import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { VoiceOnboardingModal } from "@/components/VoiceOnboarding";
import { authService } from "@/services/auth.service";
import { supabase } from "@/integrations/supabase/client";

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
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const res = await authService.signUp({ email, password, name: email.split('@')[0] });
        
        // Check if email verification is needed
        if (!res.token || !res.user) {
          onClose();
          return;
        }
        
        // Store user + token already handled in service; show onboarding
        setShowVoiceOnboarding(true);
      } else {
        const res = await authService.login({ email, password });
        localStorage.setItem('user', JSON.stringify(res.user));
        localStorage.setItem('auth_token', res.token);
        onLogin({ name: res.user.name, email: res.user.email }, false);
        onClose();
        navigate('/account');
      }
      
      // Reset form
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      // Use the specific error message from the backend
      const errorMessage = error instanceof Error ? error.message : 
        (isSignUp ? "Sign up failed. Check details and try again." : "Invalid email or password.");
      
      // Check if this is a verified account signup attempt
      if (isSignUp && error instanceof Error && error.message.includes("ACCOUNT_EXISTS_VERIFIED")) {
        // Switch to login mode and show helpful message
        setIsSignUp(false);
        toast({ 
          title: "Account Already Exists", 
          description: "An account with this email already exists. Please log in instead.",
          variant: "default" 
        });
      } else {
        toast({ 
          title: "Authentication error", 
          description: errorMessage, 
          variant: "destructive" 
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingReset(true);
    try {
      await authService.forgotPassword(forgotPasswordEmail);
      setShowForgotPassword(false);
      setForgotPasswordEmail("");
    } catch (error) {
      console.error('Forgot password failed:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleGoogleLogin = async () => {
    // Supabase instance not available - use email/password login instead
    toast({
      title: "Google Login Not Available",
      description: "Please use email/password login. Google OAuth requires Supabase configuration.",
      variant: "default",
    });
  };

  const handleVoiceOnboardingComplete = (profileData: any) => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      onLogin(user, true);
    }
    setShowVoiceOnboarding(false);
    onClose();

    // Navigate to profile section
    navigate('/account');
  };

  const handleVoiceOnboardingSkip = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      onLogin(user, true);
    }
    setShowVoiceOnboarding(false);
    onClose();

    // Navigate to profile section
    navigate('/account');
  };

  return (
    <>
      <Dialog open={isOpen && !showVoiceOnboarding} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {isSignUp ? "Create your account" : "Welcome back"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Loading..." : isSignUp ? "Get Early Access" : "Sign In"}
            </Button>
            
            {!isSignUp && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-coral hover:underline"
                >
                  Forgot your password?
                </button>
              </div>
            )}
            
            {isSignUp && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Join now to access private experiences. You'll also be added to the waitlist for public access.
              </p>
            )}
          </form>

          <div className="text-center text-sm">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-coral hover:underline"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <VoiceOnboardingModal
      isOpen={showVoiceOnboarding}
      onClose={handleVoiceOnboardingSkip}
      onComplete={handleVoiceOnboardingComplete}
      isFirstSignIn={true}
    />

    {/* Forgot Password Modal */}
    <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Enter your email address and we'll send you a link to reset your password.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email</Label>
            <Input
              id="reset-email"
              type="email"
              placeholder="Enter your email"
              value={forgotPasswordEmail}
              onChange={(e) => setForgotPasswordEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowForgotPassword(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSendingReset} className="flex-1">
              {isSendingReset ? "Sending..." : "Send Reset Link"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
};