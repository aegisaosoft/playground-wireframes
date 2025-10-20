import { useState } from 'react';
import { Mail, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';

interface ForgotPasswordModalProps {
  onClose: () => void;
}

export const ForgotPasswordModal = ({ onClose }: ForgotPasswordModalProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiClient.post<{ success: boolean; message: string }>('/Auth/forgot-password', {
        email
      });

      if (response.success) {
        setIsSubmitted(true);
        toast({
          title: "✨ Email Sent!",
          description: "Check your inbox for password reset instructions.",
          variant: "success",
        });
      } else {
        toast({
          title: "❌ Error",
          description: response.message || "Failed to send reset email",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      toast({
        title: "❌ Error",
        description: error.message || "Failed to send reset email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
        <div className="relative w-full max-w-md mx-4">
          <div className="bg-[hsl(var(--card))] rounded-2xl shadow-[0_0_40px_rgba(0,255,255,0.4)] p-8 space-y-6 border border-[#00FFFF]/30">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[hsl(var(--muted-foreground))] hover:text-[#ff66c4] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-[#00FFFF] rounded-full blur-xl opacity-60 animate-pulse"></div>
                <div className="relative bg-[hsl(var(--background))] rounded-full p-6 shadow-[var(--shadow-cyan)] border border-[#00FFFF]/50">
                  <CheckCircle className="h-12 w-12 text-[#00FFFF]" />
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#00FFFF] to-[#B366FF] bg-clip-text text-transparent">
                Check Your Email
              </h2>
              <p className="text-[hsl(var(--foreground))] text-sm">
                We've sent password reset instructions to:
              </p>
              <p className="font-semibold text-[#00FFFF] break-all">
                {email}
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-[hsl(var(--background))] rounded-xl p-4 space-y-3 border border-[#B366FF]/30">
              <p className="text-sm text-[hsl(var(--foreground))] text-center font-semibold">
                Click the link in the email to reset your password.
              </p>
              <div className="bg-[#ff66c4]/10 border border-[#ff66c4]/30 rounded-lg p-3">
                <p className="text-xs text-[#ff66c4] text-center">
                  <strong>Important:</strong> This is a NEW link. Any old password reset links are now invalid.
                </p>
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))] text-center">
                The link will expire in 1 hour for security.<br/>
                Didn't receive the email? Check your spam folder.
              </p>
            </div>

            {/* Actions */}
            <Button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-[#00FFFF] to-[#B366FF] hover:shadow-[var(--shadow-cyan)] text-white font-bold shadow-[var(--shadow-cyan)] transition-all uppercase tracking-wider"
            >
              Got It!
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-[hsl(var(--card))] rounded-2xl shadow-[0_0_40px_rgba(0,255,255,0.4)] p-8 space-y-6 border border-[#00FFFF]/30">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[hsl(var(--muted-foreground))] hover:text-[#ff66c4] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-[#00FFFF] rounded-full blur-xl opacity-60 animate-pulse"></div>
              <div className="relative bg-[hsl(var(--background))] rounded-full p-6 shadow-[var(--shadow-cyan)] border border-[#00FFFF]/50">
                <Mail className="h-12 w-12 text-[#00FFFF]" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-[#00FFFF] to-[#B366FF] bg-clip-text text-transparent">
              Forgot Password?
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] text-sm">
              No worries! Enter your email and we'll send you reset instructions.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email" className="text-[hsl(var(--foreground))]">Email Address</Label>
              <Input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="bg-[hsl(var(--background))] border-[#00FFFF]/30 text-[hsl(var(--foreground))] focus:border-[#00FFFF] focus:ring-[#00FFFF]/20 placeholder:text-[hsl(var(--muted-foreground))]"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#00FFFF] to-[#B366FF] hover:shadow-[var(--shadow-cyan)] text-white font-bold shadow-[var(--shadow-cyan)] transition-all uppercase tracking-wider"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>

          {/* Back to login */}
          <div className="text-center">
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-[#00FFFF] hover:text-[#B366FF] hover:underline transition-colors"
            >
              ← Back to Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
