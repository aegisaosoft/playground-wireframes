import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  XCircle, 
  ArrowLeft, 
  RefreshCw,
  CreditCard,
  HelpCircle
} from 'lucide-react';

export const PaymentCancelPage: React.FC = () => {
  const navigate = useNavigate();

  const handleTryAgain = () => {
    // Go back to the previous page (payment page)
    navigate(-1);
  };

  const handleBrowseExperiences = () => {
    navigate('/experiences');
  };

  const handleContactSupport = () => {
    // TODO: Implement contact support functionality
    window.open('mailto:support@experiences.com?subject=Payment Issue', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/50 flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className="bg-white/5 border-white/20">
            <CardContent className="p-8 text-center">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500/20 rounded-full mb-6">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>

              {/* Title and Description */}
              <h1 className="text-2xl font-bold text-white mb-3">Payment Cancelled</h1>
              <p className="text-white/70 mb-6">
                Your payment was cancelled. No charges have been made to your account.
              </p>

              {/* Reasons */}
              <div className="bg-white/5 rounded-lg p-4 mb-6 text-left">
                <h3 className="text-white font-semibold mb-3">Common reasons for cancellation:</h3>
                <ul className="text-white/70 text-sm space-y-2">
                  <li>• You clicked the back button during payment</li>
                  <li>• You closed the payment window</li>
                  <li>• You decided not to complete the purchase</li>
                  <li>• There was a technical issue</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  onClick={handleTryAgain}
                  className="w-full bg-neon-cyan text-background hover:bg-neon-cyan/90 h-12"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                
                <Button 
                  onClick={handleBrowseExperiences}
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10 h-12"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Browse Experiences
                </Button>
                
                <Button 
                  onClick={handleContactSupport}
                  variant="ghost"
                  className="w-full text-white/70 hover:text-white hover:bg-white/5 h-12"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </div>

              {/* Additional Information */}
              <div className="mt-6 pt-6 border-t border-white/20">
                <p className="text-white/60 text-xs">
                  If you continue to experience issues, please contact our support team.
                  We're here to help make your booking experience smooth and secure.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card className="bg-white/5 border-white/20 mt-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <CreditCard className="w-4 h-4" />
                <span>Your payment information is always secure with Stripe</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelPage;
