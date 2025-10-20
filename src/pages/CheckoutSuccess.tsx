import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Download, Calendar, MapPin, Loader2 } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { paymentsService } from '@/services/payments.service';
import { experiencesService } from '@/services/experiences.service';
import { useToast } from '@/hooks/use-toast';

interface OrderDetails {
  experience_title: string;
  tier_name: string;
  amount_total: number;
  currency: string;
  session_id: string;
  experience_id?: string;
  ticket_tier_id?: string;
  quantity?: number;
  status?: string;
  created_at?: string;
}

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [experienceDetails, setExperienceDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      fetchOrderDetails(sessionId);
    } else {
      setError('No session ID provided');
      setIsLoading(false);
    }
  }, [sessionId]);

  const fetchOrderDetails = async (sessionId: string) => {
    try {
      console.log('📥 Verifying checkout session:', sessionId);
      
      // Verify the checkout session with the API
      const verificationResult = await paymentsService.verifyCheckoutSession(sessionId);
      console.log('✅ Session verified:', verificationResult);
      
      if (!verificationResult || !verificationResult.success || verificationResult.status !== 'completed') {
        setError('Payment verification failed');
        setIsLoading(false);
        return;
      }

      // Create basic order details from session ID and verification result
      const orderDetails: OrderDetails = {
        experience_title: 'Experience', // We'll try to get this from the experience if we have the ID
        tier_name: 'Standard', // Default tier name
        amount_total: 0, // We don't have amount in the verification response
        currency: 'usd', // Default currency
        session_id: sessionId,
        experience_id: undefined, // We don't have this in the verification response
        ticket_tier_id: undefined, // We don't have this in the verification response
        quantity: 1, // Default quantity
        status: verificationResult.status,
        created_at: new Date().toISOString()
      };

      setOrderDetails(orderDetails);

      // Try to get experience details from the ticket purchase if we have the ID
      if (verificationResult.ticketPurchaseId) {
        try {
          // We would need a service method to get ticket purchase details
          // For now, we'll use placeholder data
          console.log('✅ Ticket purchase confirmed:', verificationResult.ticketPurchaseId);
        } catch (expError) {
          console.warn('Could not load ticket purchase details:', expError);
        }
      }

      // Payment successful

    } catch (error) {
      console.error('❌ Failed to verify checkout session:', error);
      setError('Failed to verify payment. Please contact support if you were charged.');
      toast({
        title: "Verification Error",
        description: "Could not verify your payment. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (!orderDetails) return;
    
    // Generate a simple receipt
    const receiptContent = `
RECEIPT - EXPERIENCE BOOKING
============================

Session ID: ${orderDetails.session_id}
Experience: ${orderDetails.experience_title}
Tier: ${orderDetails.tier_name}
Amount: $${(orderDetails.amount_total / 100).toFixed(2)} ${orderDetails.currency.toUpperCase()}
Date: ${new Date().toLocaleDateString()}

Thank you for your booking!
    `.trim();

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${orderDetails.session_id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Receipt downloaded successfully
  };

  const handleViewExperience = () => {
    if (orderDetails?.experience_id) {
      navigate(`/experiences/${orderDetails.experience_id}`);
    } else {
      navigate('/experiences');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-neon-cyan" />
            <p className="text-muted-foreground">Verifying your payment...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !orderDetails) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <div className="bg-red-500/10 border border-red-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500 text-2xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">Payment Verification Failed</h1>
            <p className="text-muted-foreground mb-6">
              {error || 'We could not verify your payment. Please contact support if you were charged.'}
            </p>
            <div className="space-y-3">
              <Button onClick={() => navigate('/experiences')} className="w-full">
                Browse Experiences
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="bg-green-500/10 border border-green-500/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-4">
                Payment Successful!
              </h1>
              <p className="text-xl text-muted-foreground">
                Your booking has been confirmed
              </p>
            </div>

            {/* Order Details Card */}
            <Card className="bg-background border-border mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-neon-cyan" />
                  Booking Confirmation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Experience Info */}
                <div className="flex items-start gap-4">
                  {experienceDetails?.featuredImageUrl && (
                    <img 
                      src={experienceDetails.featuredImageUrl} 
                      alt={orderDetails.experience_title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{orderDetails.experience_title}</h3>
                    {experienceDetails && (
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                        <MapPin className="w-4 h-4" />
                        {experienceDetails.location}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-border pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tier:</span>
                    <span className="font-medium">{orderDetails.tier_name}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity:</span>
                    <span className="font-medium">{orderDetails.quantity || 1}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Session ID:</span>
                    <span className="font-mono text-sm">{orderDetails.session_id}</span>
                  </div>
                  
                  <div className="flex justify-between text-lg font-semibold border-t border-border pt-3">
                    <span>Total Paid:</span>
                    <span className="text-neon-cyan">
                      ${(orderDetails.amount_total / 100).toFixed(2)} {orderDetails.currency.toUpperCase()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="bg-background border-border mb-8">
              <CardHeader>
                <CardTitle>What's Next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-neon-cyan text-black rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Confirmation Email</h4>
                    <p className="text-sm text-muted-foreground">
                      You'll receive a confirmation email with all the details shortly.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-neon-cyan text-black rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Experience Portal</h4>
                    <p className="text-sm text-muted-foreground">
                      Access your experience portal for updates, logistics, and community.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-neon-cyan text-black rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Prepare for Your Experience</h4>
                    <p className="text-sm text-muted-foreground">
                      Check the experience details and prepare for your upcoming adventure.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleViewExperience}
                className="flex-1 bg-neon-cyan hover:bg-neon-cyan/90 text-black"
              >
                View Experience
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleDownloadReceipt}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Receipt
              </Button>
            </div>

            <div className="text-center mt-8">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/experiences')}
                className="text-muted-foreground hover:text-foreground"
              >
                Browse More Experiences
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutSuccess;