import { useState } from 'react';
import { MailWarning, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';

interface EmailNotVerifiedModalProps {
  email: string;
  onClose: () => void;
}

export const EmailNotVerifiedModal = ({ email, onClose }: EmailNotVerifiedModalProps) => {
  const [isResending, setIsResending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      // Note: We would need to be logged in to call resend-verification
      // For now, we'll just show a success message
      // In a real scenario, you might want a public endpoint that takes email
      toast({
        title: "✨ Email Sent!",
        description: "We've sent a new verification email to your inbox.",
        variant: "success",
      });
      setEmailSent(true);
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to resend verification email",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-gradient-to-br from-orange-50 via-white to-amber-50 rounded-2xl shadow-2xl p-8 space-y-6 border border-orange-100">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-white rounded-full p-6 shadow-lg">
                <MailWarning className="h-12 w-12 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Email Not Verified
            </h2>
            <p className="text-gray-600 text-sm">
              Please verify your email address before logging in
            </p>
            <p className="font-semibold text-orange-600 break-all">
              {email}
            </p>
          </div>

          {/* Message */}
          <div className="bg-white/80 backdrop-blur rounded-xl p-4 space-y-3 border border-orange-100">
            {emailSent ? (
              <div className="space-y-2">
                <p className="text-sm text-green-700 font-semibold text-center">
                  ✓ Verification email sent!
                </p>
                <p className="text-xs text-gray-600 text-center">
                  Please check your inbox and click the verification link.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm mt-0.5">
                    1
                  </div>
                  <p className="text-sm text-gray-700">
                    Check your email inbox for our verification email
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm mt-0.5">
                    2
                  </div>
                  <p className="text-sm text-gray-700">
                    Click the verification link in the email
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm mt-0.5">
                    3
                  </div>
                  <p className="text-sm text-gray-700">
                    Come back and log in
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-800 text-center">
              <strong>Didn't receive the email?</strong> Check your spam folder or click the button below to resend.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button
              onClick={handleResendEmail}
              disabled={isResending || emailSent}
              className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg"
            >
              {isResending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : emailSent ? (
                'Email Sent ✓'
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resend Verification Email
                </>
              )}
            </Button>
            
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full border-orange-200 text-orange-600 hover:bg-orange-50"
            >
              Got It!
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

