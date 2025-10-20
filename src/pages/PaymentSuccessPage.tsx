import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle2, 
  Download, 
  Calendar, 
  MapPin, 
  User,
  ArrowRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { paymentsService } from '@/services/payments.service';

interface PaymentDetails {
  success: boolean;
  status: string;
  paymentIntentId?: string;
  ticketPurchaseId?: string;
  message?: string;
}

export const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');


  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        setIsVerifying(false);
        return;
      }

      try {
        const result = await paymentsService.verifyCheckoutSession(sessionId);
        setPaymentDetails(result);
        
        if (result.success) {
          // Payment successful
        } else {
          toast({
            title: "Payment Verification Failed",
            description: result.message || "Please contact support if you were charged.",
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        setError('Failed to verify payment. Please contact support.');
        toast({
          title: "Verification Error",
          description: "Unable to verify payment. Please contact support.",
          variant: "destructive",
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, toast]);

  const handleDownloadTickets = () => {
    // TODO: Implement ticket download functionality
    // Tickets downloaded successfully
  };

  const handleViewExperiences = () => {
    navigate('/experiences');
  };

  const handleViewMyTickets = () => {
    navigate('/account?tab=tickets');
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/50 flex items-center justify-center">
        <Card className="bg-white/5 border-white/20 max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 text-neon-cyan animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Verifying Payment</h2>
            <p className="text-white/70">Please wait while we confirm your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !paymentDetails?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/50 flex items-center justify-center">
        <Card className="bg-white/5 border-white/20 max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Payment Issue</h2>
            <p className="text-white/70 mb-6">
              {error || paymentDetails?.message || 'There was an issue with your payment.'}
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/experiences')}
                className="w-full bg-neon-cyan text-background hover:bg-neon-cyan/90"
              >
                Browse Experiences
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/account?tab=tickets')}
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                Check My Tickets
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
            <p className="text-white/70 text-lg">Your tickets have been confirmed and you're all set!</p>
          </div>

          {/* Payment Details */}
          <Card className="bg-white/5 border-white/20 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Payment Confirmed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/70 text-sm">Payment Status</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                      {paymentDetails.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-white/70 text-sm">Transaction ID</Label>
                  <p className="text-white text-sm font-mono mt-1">
                    {paymentDetails.paymentIntentId?.slice(-8) || 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-white/70 text-sm">Ticket Purchase ID</Label>
                  <p className="text-white text-sm font-mono mt-1">
                    {paymentDetails.ticketPurchaseId?.slice(-8) || 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-white/70 text-sm">Purchase Date</Label>
                  <p className="text-white text-sm mt-1">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="bg-white/5 border-white/20 mb-6">
            <CardHeader>
              <CardTitle className="text-white">What's Next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-neon-cyan/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-neon-cyan text-sm font-semibold">1</span>
                </div>
                <div>
                  <h4 className="text-white font-semibold">Check Your Email</h4>
                  <p className="text-white/70 text-sm">
                    We've sent you a confirmation email with your ticket details and event information.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-neon-cyan/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-neon-cyan text-sm font-semibold">2</span>
                </div>
                <div>
                  <h4 className="text-white font-semibold">Add to Calendar</h4>
                  <p className="text-white/70 text-sm">
                    Don't forget to add the event to your calendar so you don't miss it!
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-neon-cyan/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-neon-cyan text-sm font-semibold">3</span>
                </div>
                <div>
                  <h4 className="text-white font-semibold">Prepare for the Experience</h4>
                  <p className="text-white/70 text-sm">
                    Check the event details for any special requirements or preparation needed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={handleDownloadTickets}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 h-12"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Tickets
            </Button>
            
            <Button 
              onClick={handleViewMyTickets}
              className="bg-neon-cyan text-background hover:bg-neon-cyan/90 h-12"
            >
              <User className="w-4 h-4 mr-2" />
              My Tickets
            </Button>
            
            <Button 
              onClick={handleViewExperiences}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 h-12"
            >
              Browse More
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Support Information */}
          <Card className="bg-white/5 border-white/20 mt-6">
            <CardContent className="p-4">
              <p className="text-white/70 text-sm text-center">
                Need help? Contact our support team at{' '}
                <a href="mailto:support@experiences.com" className="text-neon-cyan hover:underline">
                  support@experiences.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
