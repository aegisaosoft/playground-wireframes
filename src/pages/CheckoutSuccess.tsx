import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Download, Calendar, MapPin } from 'lucide-react';
import { Layout } from '@/components/Layout';

interface OrderDetails {
  experience_title: string;
  tier_name: string;
  amount_total: number;
  currency: string;
  session_id: string;
}

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      fetchOrderDetails(sessionId);
    } else {
      setIsLoading(false);
    }
  }, [sessionId]);

  const fetchOrderDetails = async (sessionId: string) => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/checkout/session/${sessionId}`);
      // const details = await response.json();
      
      // Mock order details for demo
      const mockDetails: OrderDetails = {
        experience_title: 'Mindful Retreat in Bali',
        tier_name: 'Early Bird',
        amount_total: 79900, // $799.00 in cents
        currency: 'usd',
        session_id: sessionId
      };
      
      setOrderDetails(mockDetails);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (amountInCents: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amountInCents / 100);
  };

  const handleViewExperience = () => {
    // Navigate back to the experience page
    // In a real app, you'd get the experience ID from the order details
    navigate('/');
  };

  const handleDownloadReceipt = () => {
    // TODO: Implement receipt download
    console.log('Downloading receipt for session:', sessionId);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#0b0b12] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-cyan"></div>
        </div>
      </Layout>
    );
  }

  if (!sessionId) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#0b0b12] flex items-center justify-center">
          <Card className="max-w-md mx-4 bg-card border-border">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Invalid Session
              </h2>
              <p className="text-muted-foreground mb-4">
                No valid checkout session found.
              </p>
              <Button onClick={() => navigate('/')} className="w-full">
                Return Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#0b0b12] flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <Card className="bg-card border-border shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-neon-green" />
              </div>
              
              <CardTitle className="text-2xl font-bold text-foreground mb-2">
                Payment Successful!
              </CardTitle>
              
              <p className="text-muted-foreground">
                Your booking has been confirmed. You'll receive a confirmation email shortly.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {orderDetails && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">
                        {orderDetails.experience_title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30">
                          {orderDetails.tier_name}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-white/10 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Paid:</span>
                      <span className="text-xl font-bold text-neon-green">
                        {formatAmount(orderDetails.amount_total, orderDetails.currency)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Session ID: {orderDetails.session_id}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="bg-neon-cyan/10 border border-neon-cyan/20 rounded-lg p-4">
                  <h4 className="font-medium text-neon-cyan mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    What's Next?
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Check your email for booking confirmation</li>
                    <li>• You'll receive detailed information about the experience</li>
                    <li>• The organizer will contact you closer to the date</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleViewExperience}
                    className="flex-1 bg-neon-cyan text-background hover:bg-neon-cyan/90 font-medium"
                  >
                    View Experience
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  
                  <Button
                    onClick={handleDownloadReceipt}
                    variant="outline"
                    className="border-white/20 text-foreground hover:bg-white/10"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>

                <div className="text-center">
                  <Button
                    onClick={() => navigate('/')}
                    variant="ghost"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Return to Homepage
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutSuccess;