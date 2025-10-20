import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { paymentsService } from '@/services/payments.service';
import { useUser } from '@/contexts/UserContext';

interface PaymentsCardProps {
  variant?: 'sidebar' | 'full';
}

interface StripeStatus {
  charges_enabled: boolean;
  payouts_enabled: boolean;
}

export const PaymentsCard: React.FC<PaymentsCardProps> = ({ variant = 'full' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated } = useUser();

  useEffect(() => {
    if (isAuthenticated) {
      checkStripeStatus();
    }
  }, [isAuthenticated]);

  const checkStripeStatus = async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      const status = await paymentsService.getStripeStatus();
      setStripeStatus(status);
    } catch (error) {
      console.error('Failed to check Stripe status:', error);
      // Temporarily hide error message - only log to console
      // toast({
      //   title: "Error",
      //   description: "Failed to load payment status.",
      //   variant: "destructive",
      // });
    }
  };

  const handleConnectStripe = async () => {
    setIsLoading(true);
    try {
      const { onboarding_url } = await paymentsService.createAccountLink();
      
      if (onboarding_url) {
        // Redirect to Stripe onboarding
        window.location.href = onboarding_url;
      } else {
        throw new Error('No onboarding URL received');
      }
    } catch (error) {
      console.error('Failed to start Stripe onboarding:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Stripe onboarding couldn't start. Try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeSetup = () => {
    handleConnectStripe();
  };

  const getStatusBadge = () => {
    if (!stripeStatus) return null;
    
    if (stripeStatus.charges_enabled && stripeStatus.payouts_enabled) {
      return <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">Active</Badge>;
    } else if (stripeStatus.charges_enabled || stripeStatus.payouts_enabled) {
      return <Badge className="bg-neon-yellow/20 text-neon-yellow border-neon-yellow/30">Pending</Badge>;
    } else {
      return <Badge variant="outline" className="text-muted-foreground">Not set up</Badge>;
    }
  };

  const isActive = stripeStatus?.charges_enabled && stripeStatus?.payouts_enabled;
  const isPending = stripeStatus && (stripeStatus.charges_enabled || stripeStatus.payouts_enabled) && !isActive;

  if (variant === 'sidebar') {
    return (
      <>
        <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-neon-cyan" />
              <span className="font-medium text-foreground text-sm">Payments</span>
            </div>
            {getStatusBadge()}
          </div>
          
          {!isActive && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Connect Stripe to receive payments directly
              </p>
              <Button
                size="sm"
                onClick={isPending ? handleResumeSetup : handleConnectStripe}
                disabled={isLoading}
                className="w-full bg-neon-cyan/20 border border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/30 text-xs"
              >
                {isLoading && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
                {isPending ? 'Resume Setup' : 'Connect Stripe'}
              </Button>
              
              <button
                onClick={() => setShowConnectModal(true)}
                className="text-xs text-neon-cyan hover:underline"
              >
                What is Stripe Connect?
              </button>
            </div>
          )}
          
          {isActive && (
            <p className="text-xs text-neon-green">
              ✓ Ready to receive payments
            </p>
          )}
        </div>

        {/* Stripe Connect Info Modal */}
        {showConnectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowConnectModal(false)}>
            <div className="bg-card border border-white/10 rounded-lg p-6 max-w-md mx-4" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-foreground mb-3">What is Stripe Connect?</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• You're paid directly to your Stripe account.</p>
                <p>• Playground charges an application fee on each order.</p>
                <p>• Stripe handles KYC and payouts.</p>
              </div>
              <Button
                onClick={() => setShowConnectModal(false)}
                className="w-full mt-4"
                variant="outline"
              >
                Got it
              </Button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <CreditCard className="w-5 h-5 text-neon-cyan" />
            Enable payouts with Stripe
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Connect your Stripe account to receive payments directly.
        </p>
        
        {!isActive && (
          <Button
            onClick={isPending ? handleResumeSetup : handleConnectStripe}
            disabled={isLoading}
            className="w-full bg-neon-cyan text-background hover:bg-neon-cyan/90 font-medium rounded-full"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isPending ? 'Resume Setup' : 'Connect with Stripe'}
          </Button>
        )}
        
        {isActive && (
          <div className="flex items-center gap-2 text-neon-green">
            <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
            <span className="text-sm font-medium">Ready to receive payments</span>
          </div>
        )}
        
        <button
          onClick={() => setShowConnectModal(true)}
          className="text-sm text-neon-cyan hover:underline flex items-center gap-1"
        >
          What is Stripe Connect? <ExternalLink className="w-3 h-3" />
        </button>
      </CardContent>
    </Card>
  );
};