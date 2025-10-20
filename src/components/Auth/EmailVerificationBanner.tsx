import { useState } from "react";
import { Mail, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth.service";
import { useToast } from "@/hooks/use-toast";

interface EmailVerificationBannerProps {
  userEmail?: string;
  onDismiss?: () => void;
}

export default function EmailVerificationBanner({ userEmail, onDismiss }: EmailVerificationBannerProps) {
  const [isResending, setIsResending] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { toast } = useToast();

  const handleResend = async () => {
    setIsResending(true);
    try {
      await authService.resendVerification();
      toast({
        title: "✨ Verification Email Sent",
        description: "Please check your inbox and spam folder.",
        variant: "success",
      });
    } catch (error: any) {
      console.error("Failed to resend verification email:", error);
      toast({
        title: "❌ Failed to Send Email",
        description: error?.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Mail className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              Please verify your email address
            </p>
            <p className="text-xs text-violet-100 mt-0.5">
              We sent a verification link to <span className="font-medium">{userEmail}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResend}
            disabled={isResending}
            className="text-white hover:bg-white/20 transition-colors text-sm h-8 px-3"
          >
            {isResending ? (
              <>
                <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                Sending...
              </>
            ) : (
              "Resend Email"
            )}
          </Button>

          <button
            onClick={handleDismiss}
            className="text-white/80 hover:text-white transition-colors p-1"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

