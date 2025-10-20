import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, Mail, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerificationStatus('error');
        setMessage('No verification token provided');
        setIsVerifying(false);
        return;
      }

      try {
        console.log('🔍 Verifying email with token:', token);
        
        // Call the backend API to verify the email
        const response = await apiClient.get(`/Auth/verify-email?token=${encodeURIComponent(token)}`);
        
        console.log('✅ Email verification response:', response);
        
        if (response.success) {
          // Check if this is a token expired case where new email was sent
          if (response.message === 'TOKEN_EXPIRED_NEW_SENT') {
            setVerificationStatus('success');
            setMessage('Your verification link has expired. A new verification email has been sent to your inbox. Please check your email and click the new link.');
            
            // Show info toast
            toast({
              title: "New Verification Email Sent",
              description: "Your old link expired. Please check your email for the new verification link.",
              variant: "default",
            });
            
            // Redirect to home after a short delay
            setTimeout(() => {
              navigate('/');
            }, 5000);
          } else {
            setVerificationStatus('success');
            setMessage(response.message || 'Email verified successfully!');
            
            
            // Redirect to login after a short delay
            setTimeout(() => {
              navigate('/');
            }, 3000);
          }
        } else {
          setVerificationStatus('error');
          setMessage(response.message || 'Email verification failed');
        }
      } catch (error) {
        console.error('❌ Email verification error:', error);
        setVerificationStatus('error');
        
        if (error instanceof Error) {
          setMessage(error.message);
        } else {
          setMessage('An error occurred during email verification');
        }
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [token, navigate, toast]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleResendVerification = async () => {
    try {
      // Call the backend to resend verification email
      // This would need the user's email, but since we don't have it from the token,
      // we'll redirect to the signup page where they can try again
      toast({
        title: "Resend Verification",
        description: "Please try signing up again with your email to receive a new verification link.",
        variant: "default",
      });
      
      // Redirect to home where they can access the signup modal
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('❌ Failed to resend verification:', error);
      toast({
        title: "Error",
        description: "Failed to resend verification email. Please try signing up again.",
        variant: "destructive",
      });
    }
  };

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
        onClick={handleGoHome}
        variant="ghost"
        className="absolute top-6 left-6 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Button>

      <Card className="relative z-10 w-full max-w-md bg-card/80 backdrop-blur-sm border-neon-pink/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
            <Mail className="w-6 h-6 text-neon-cyan" />
            Email Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {isVerifying && (
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-neon-cyan mx-auto" />
              <p className="text-foreground">Verifying your email address...</p>
            </div>
          )}

          {verificationStatus === 'success' && (
            <div className="text-center space-y-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <h3 className="text-lg font-semibold text-foreground">Success!</h3>
              <p className="text-muted-foreground">{message}</p>
              <p className="text-sm text-muted-foreground">
                You will be redirected to the home page shortly...
              </p>
              <Button 
                onClick={handleGoHome} 
                className="w-full bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-pink/80 hover:to-neon-purple/80 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Go to Home
              </Button>
            </div>
          )}

          {verificationStatus === 'error' && (
            <div className="text-center space-y-4">
              <XCircle className="w-12 h-12 text-red-500 mx-auto" />
              <h3 className="text-lg font-semibold text-foreground">Verification Failed</h3>
              <p className="text-muted-foreground">{message}</p>
              <div className="space-y-3">
                <Button 
                  onClick={handleGoHome} 
                  className="w-full bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-pink/80 hover:to-neon-purple/80 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Go to Home
                </Button>
                <Button 
                  onClick={handleResendVerification} 
                  variant="outline" 
                  className="w-full border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10 hover:border-neon-cyan font-semibold py-3 rounded-lg transition-all duration-300"
                >
                  Get New Verification Email
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerification;
