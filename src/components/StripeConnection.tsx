import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Loader2,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { paymentsService, StripeStatus } from '@/services/payments.service';

interface StripeConnectionProps {
  onStatusChange?: (status: StripeStatus) => void;
}

export const StripeConnection: React.FC<StripeConnectionProps> = ({ onStatusChange }) => {
  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadStripeStatus();
  }, []);

  const loadStripeStatus = async () => {
    try {
      setIsLoading(true);
      const status = await paymentsService.getStripeStatus();
      setStripeStatus(status);
      onStatusChange?.(status);
    } catch (error) {
      console.error('Failed to load Stripe status:', error);
      toast({
        title: "Error",
        description: "Failed to load payment status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectStripe = async () => {
    try {
      setIsConnecting(true);
      const response = await paymentsService.createAccountLink();
      
      // Open Stripe onboarding in a new window
      window.open(response.onboarding_url, '_blank', 'width=800,height=600');
      
      toast({
        title: "Stripe Onboarding",
        description: "Complete your Stripe setup in the new window. You can close it when done.",
      });
      
      // Refresh status after a delay to allow for completion
      setTimeout(() => {
        loadStripeStatus();
      }, 3000);
      
    } catch (error) {
      console.error('Failed to create Stripe account link:', error);
      toast({
        title: "Error",
        description: "Failed to start Stripe setup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const getStatusBadge = () => {
    if (!stripeStatus) return null;
    
    if (stripeStatus.chargesEnabled && stripeStatus.payoutsEnabled) {
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Connected
        </Badge>
      );
    } else if (stripeStatus.detailsSubmitted) {
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
          <AlertCircle className="w-3 h-3 mr-1" />
          Pending Review
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
          <AlertCircle className="w-3 h-3 mr-1" />
          Not Connected
        </Badge>
      );
    }
  };

  const getStatusMessage = () => {
    if (!stripeStatus) return "Loading payment status...";
    
    if (stripeStatus.chargesEnabled && stripeStatus.payoutsEnabled) {
      return "Your Stripe account is fully set up and ready to receive payments.";
    } else if (stripeStatus.detailsSubmitted) {
      return "Your account details have been submitted and are under review by Stripe.";
    } else {
      return "Connect your Stripe account to start receiving payments for your experiences.";
    }
  };

  const getStatusIcon = () => {
    if (!stripeStatus) return <Loader2 className="w-5 h-5 animate-spin" />;
    
    if (stripeStatus.chargesEnabled && stripeStatus.payoutsEnabled) {
      return <CheckCircle2 className="w-5 h-5 text-green-400" />;
    } else if (stripeStatus.detailsSubmitted) {
      return <AlertCircle className="w-5 h-5 text-yellow-400" />;
    } else {
      return <AlertCircle className="w-5 h-5 text-red-400" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white/5 border-white/10 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-neon-cyan" />
            <span className="text-muted-foreground">Loading payment status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 border-white/10 rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-foreground">Payment Processing</CardTitle>
              <p className="text-sm text-muted-foreground">Stripe Connect Integration</p>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          {getStatusIcon()}
          <div className="flex-1">
            <p className="text-muted-foreground text-sm">
              {getStatusMessage()}
            </p>
          </div>
        </div>

        {stripeStatus && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-neon-cyan" />
              <span className="text-sm text-muted-foreground">Charges</span>
              <Badge 
                variant="outline" 
                className={stripeStatus.chargesEnabled ? "border-green-500/30 text-green-400" : "border-red-500/30 text-red-400"}
              >
                {stripeStatus.chargesEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-neon-cyan" />
              <span className="text-sm text-muted-foreground">Payouts</span>
              <Badge 
                variant="outline" 
                className={stripeStatus.payoutsEnabled ? "border-green-500/30 text-green-400" : "border-red-500/30 text-red-400"}
              >
                {stripeStatus.payoutsEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </div>
        )}

        {(!stripeStatus?.chargesEnabled || !stripeStatus?.payoutsEnabled) && (
          <div className="pt-4 border-t border-white/10">
            <Button
              onClick={handleConnectStripe}
              disabled={isConnecting}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Connect Stripe Account
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              You'll be redirected to Stripe to complete the setup process
            </p>
          </div>
        )}

        {stripeStatus?.chargesEnabled && stripeStatus?.payoutsEnabled && (
          <div className="pt-4 border-t border-white/10">
            <Button
              onClick={loadStripeStatus}
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10"
            >
              Refresh Status
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
