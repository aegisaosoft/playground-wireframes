import { ShieldAlert, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InvalidCredentialsModalProps {
  onClose: () => void;
  onForgotPassword: () => void;
}

export const InvalidCredentialsModal = ({ onClose, onForgotPassword }: InvalidCredentialsModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-gradient-to-br from-red-50 via-white to-pink-50 rounded-2xl shadow-2xl p-8 space-y-6 border border-red-100">
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
              <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-white rounded-full p-6 shadow-lg">
                <ShieldAlert className="h-12 w-12 text-red-600" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
              Login Failed
            </h2>
            <p className="text-gray-600 text-sm">
              The email or password you entered is incorrect
            </p>
          </div>

          {/* Message */}
          <div className="bg-white/80 backdrop-blur rounded-xl p-4 space-y-3 border border-red-100">
            <div className="space-y-2">
              <p className="text-sm text-gray-700 text-center">
                Please check your credentials and try again.
              </p>
              <div className="bg-red-50 border border-red-100 rounded-lg p-3 mt-3">
                <p className="text-xs text-red-700">
                  <strong>Common issues:</strong>
                </p>
                <ul className="text-xs text-red-700 mt-1 space-y-1 list-disc list-inside">
                  <li>Check if Caps Lock is on</li>
                  <li>Make sure you're using the correct email</li>
                  <li>Verify your password is spelled correctly</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg"
            >
              Try Again
            </Button>
            
            <Button
              onClick={onForgotPassword}
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50"
            >
              Forgot Password?
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

