import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AccountExistsModalProps {
  email: string;
  isVerified: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export const AccountExistsModal = ({ email, isVerified, onClose, onSwitchToLogin }: AccountExistsModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-[hsl(var(--card))] rounded-2xl shadow-[var(--shadow-yellow)] p-8 space-y-6 border border-[#FFFF52]/30">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-[#FFFF52] rounded-full blur-xl opacity-60 animate-pulse"></div>
              <div className="relative bg-[hsl(var(--background))] rounded-full p-6 shadow-[var(--shadow-yellow)] border border-[#FFFF52]/50">
                <AlertCircle className="h-12 w-12 text-[#FFFF52]" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-[#FFFF52] to-[#FF9900] bg-clip-text text-transparent">
              Account Already Exists
            </h2>
            <p className="text-[hsl(var(--foreground))] text-sm">
              An account with this email already exists
            </p>
            <p className="font-semibold text-[#FFFF52] break-all">
              {email}
            </p>
          </div>

          {/* Message */}
          <div className="bg-[hsl(var(--background))] rounded-xl p-4 border border-[#FFFF52]/30">
            {isVerified ? (
              <p className="text-sm text-[hsl(var(--foreground))] text-center">
                This account is already verified and active. Please use the <strong className="text-[#FFFF52]">Sign In</strong> button to log in to your account.
              </p>
            ) : (
              <p className="text-sm text-[hsl(var(--foreground))] text-center">
                This account exists but hasn't been verified yet. We've sent you a new verification email. Please check your inbox and click the verification link.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-2">
            {isVerified ? (
              <>
                <Button
                  onClick={onSwitchToLogin}
                  className="w-full bg-gradient-to-r from-[#FFFF52] to-[#FF9900] hover:shadow-[var(--shadow-yellow)] text-black font-bold shadow-[var(--shadow-yellow)] transition-all"
                >
                  Go to Sign In
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="w-full border-[#FFFF52]/30 text-[hsl(var(--foreground))] hover:bg-[#FFFF52]/10"
                >
                  Close
                </Button>
              </>
            ) : (
              <Button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-[#FFFF52] to-[#FF9900] hover:shadow-[var(--shadow-yellow)] text-black font-bold shadow-[var(--shadow-yellow)] transition-all"
              >
                Got It!
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
