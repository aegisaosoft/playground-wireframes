import { useState } from 'react';
import { Mail, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/auth.service';

interface EmailVerificationSuccessProps {
  email: string;
  onClose: () => void;
}

export const EmailVerificationSuccess = ({ email, onClose }: EmailVerificationSuccessProps) => {
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      toast({
        title: "📧 Check your email",
        description: "If you didn't receive the email, check your spam folder or try again in a few minutes.",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to resend email. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-[hsl(var(--card))] rounded-2xl shadow-[var(--shadow-neon)] p-8 space-y-6 border border-[#ff66c4]/30">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-[#ff66c4] rounded-full blur-xl opacity-60 animate-pulse"></div>
              <div className="relative bg-[hsl(var(--background))] rounded-full p-6 shadow-[var(--shadow-neon)] border border-[#ff66c4]/50">
                <Mail className="h-12 w-12 text-[#ff66c4]" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-[#ff66c4] to-[#00FFFF] bg-clip-text text-transparent">
              Check Your Email!
            </h2>
            <p className="text-[hsl(var(--foreground))] text-sm">
              We've sent a verification link to
            </p>
            <p className="font-semibold text-[#ff66c4] break-all">
              {email}
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-[hsl(var(--background))] rounded-xl p-4 space-y-3 border border-[#00FFFF]/30">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#00FFFF]/20 flex items-center justify-center text-[#00FFFF] font-bold text-sm mt-0.5 border border-[#00FFFF]/30">
                1
              </div>
              <p className="text-sm text-[hsl(var(--foreground))]">
                Open your email inbox and look for our verification email
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#00FFFF]/20 flex items-center justify-center text-[#00FFFF] font-bold text-sm mt-0.5 border border-[#00FFFF]/30">
                2
              </div>
              <p className="text-sm text-[hsl(var(--foreground))]">
                Click the verification link in the email
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#00FFFF]/20 flex items-center justify-center text-[#00FFFF] font-bold text-sm mt-0.5 border border-[#00FFFF]/30">
                3
              </div>
              <p className="text-sm text-[hsl(var(--foreground))]">
                Come back and log in to start exploring!
              </p>
            </div>
          </div>

          {/* Didn't receive email */}
          <div className="bg-[#FFFF52]/10 border border-[#FFFF52]/30 rounded-lg p-3 text-center">
            <p className="text-xs text-[hsl(var(--foreground))] mb-2">
              <strong className="text-[#FFFF52]">Didn't receive the email?</strong> Check your spam folder or promotions tab.
            </p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              The verification link will expire in 24 hours.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-[#ff66c4] to-[#00FFFF] hover:shadow-[var(--shadow-cyan)] text-white font-bold shadow-[var(--shadow-neon)] transition-all"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Got It!
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
