import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/auth.service';
import { CheckCircle, XCircle, Loader2, Lock, Shield, ArrowLeft } from 'lucide-react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetStatus, setResetStatus] = useState<'loading' | 'success' | 'error' | 'form'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      setResetStatus('form');
    } else {
      setResetStatus('error');
      setMessage('Invalid or missing reset token.');
    }
  }, [searchParams]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Password Required",
        description: "Please enter both password fields.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (!token) {
      toast({
        title: "Invalid Token",
        description: "Reset token is missing or invalid.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.resetPassword(token, newPassword);
      
      if (response.success) {
        setResetStatus('success');
        setMessage('Your password has been reset successfully. You can now log in with your new password.');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        setResetStatus('error');
        setMessage(response.message || 'Failed to reset password. Please try again.');
        toast({
          title: "Reset Failed",
          description: response.message || "Failed to reset password. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Password reset failed:', error);
      setResetStatus('error');
      setMessage(error instanceof Error ? error.message : 'Failed to reset password. Please try again.');
      toast({
        title: "Reset Failed",
        description: error instanceof Error ? error.message : "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToHome = () => {
    navigate('/');
  };

  const handleGetNewResetLink = () => {
    navigate('/');
  };

  if (resetStatus === 'loading') {
    return (
      <div className="relative min-h-screen bg-background flex items-center justify-center overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-4 h-4 bg-neon-pink rounded-full animate-pulse shadow-neon"></div>
          <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-neon-cyan rounded-full animate-pulse delay-300 shadow-cyan"></div>
          <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-neon-yellow rounded-full animate-pulse delay-700 shadow-yellow"></div>
          <div className="absolute bottom-20 right-20 w-5 h-5 bg-neon-purple rounded-full animate-pulse delay-1000"></div>
        </div>

        <Card className="relative z-10 w-full max-w-md bg-card/80 backdrop-blur-sm border-neon-pink/20">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <Shield className="h-16 w-16 text-neon-cyan animate-pulse" />
                <div className="absolute inset-0 bg-neon-cyan/20 rounded-full blur-xl"></div>
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Verifying Reset Link</h2>
                <p className="text-muted-foreground">Please wait while we validate your reset token...</p>
              </div>
              <Loader2 className="h-8 w-8 animate-spin text-neon-pink" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (resetStatus === 'success') {
    return (
      <div className="relative min-h-screen bg-background flex items-center justify-center overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-4 h-4 bg-neon-pink rounded-full animate-pulse shadow-neon"></div>
          <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-neon-cyan rounded-full animate-pulse delay-300 shadow-cyan"></div>
          <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-neon-yellow rounded-full animate-pulse delay-700 shadow-yellow"></div>
          <div className="absolute bottom-20 right-20 w-5 h-5 bg-neon-purple rounded-full animate-pulse delay-1000"></div>
        </div>

        <Card className="relative z-10 w-full max-w-md bg-card/80 backdrop-blur-sm border-neon-green/20">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <CheckCircle className="h-20 w-20 text-neon-green animate-pulse" />
                <div className="absolute inset-0 bg-neon-green/20 rounded-full blur-xl"></div>
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-neon-green to-neon-cyan bg-clip-text text-transparent">
              Password Reset Successful
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-4 text-base">
              {message}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleGoToHome} 
              className="w-full bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-pink/80 hover:to-neon-purple/80 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (resetStatus === 'error') {
    return (
      <div className="relative min-h-screen bg-background flex items-center justify-center overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-4 h-4 bg-neon-pink rounded-full animate-pulse shadow-neon"></div>
          <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-neon-cyan rounded-full animate-pulse delay-300 shadow-cyan"></div>
          <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-neon-yellow rounded-full animate-pulse delay-700 shadow-yellow"></div>
          <div className="absolute bottom-20 right-20 w-5 h-5 bg-neon-purple rounded-full animate-pulse delay-1000"></div>
        </div>

        <Card className="relative z-10 w-full max-w-md bg-card/80 backdrop-blur-sm border-red-500/20">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <XCircle className="h-20 w-20 text-red-500 animate-pulse" />
                <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl"></div>
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent">
              Reset Failed
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-4 text-base">
              {message}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleGoToHome} 
              className="w-full bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-pink/80 hover:to-neon-purple/80 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Go to Home
            </Button>
            <Button 
              onClick={handleGetNewResetLink} 
              variant="outline" 
              className="w-full border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10 hover:border-neon-cyan font-semibold py-3 rounded-lg transition-all duration-300"
            >
              Get New Reset Link
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background flex items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-4 h-4 bg-neon-pink rounded-full animate-pulse shadow-neon"></div>
        <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-neon-cyan rounded-full animate-pulse delay-300 shadow-cyan"></div>
        <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-neon-yellow rounded-full animate-pulse delay-700 shadow-yellow"></div>
        <div className="absolute bottom-20 right-20 w-5 h-5 bg-neon-purple rounded-full animate-pulse delay-1000"></div>
      </div>

      {/* Back to home button */}
      <Button
        onClick={handleGoToHome}
        variant="ghost"
        className="absolute top-6 left-6 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Button>

      <Card className="relative z-10 w-full max-w-md bg-card/80 backdrop-blur-sm border-neon-pink/20">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Lock className="h-16 w-16 text-neon-pink animate-pulse" />
              <div className="absolute inset-0 bg-neon-pink/20 rounded-full blur-xl"></div>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-neon-pink to-neon-purple bg-clip-text text-transparent">
            Reset Your Password
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-4 text-base">
            Enter your new password below to complete the reset process.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="new-password" className="text-sm font-semibold text-foreground">
                New Password
              </Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="bg-background/50 border-neon-cyan/30 focus:border-neon-cyan focus:ring-neon-cyan/20 transition-all duration-300"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="confirm-password" className="text-sm font-semibold text-foreground">
                Confirm Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="bg-background/50 border-neon-cyan/30 focus:border-neon-cyan focus:ring-neon-cyan/20 transition-all duration-300"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-pink/80 hover:to-neon-purple/80 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-5 w-5" />
                  Reset Password
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}