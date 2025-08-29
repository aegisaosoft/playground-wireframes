import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Ticket, CreditCard, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TicketTier {
  id: string;
  name: string;
  price_cents: number;
  quantity: number;
  description?: string;
}

interface TicketTierDisplayProps {
  tiers: TicketTier[];
  experienceId: string;
  hostPayoutsEnabled?: boolean;
  className?: string;
}

export const TicketTierDisplay: React.FC<TicketTierDisplayProps> = ({
  tiers,
  experienceId,
  hostPayoutsEnabled = false,
  className = ""
}) => {
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const { toast } = useToast();

  const handleBuyTicket = async (tierId: string) => {
    if (!hostPayoutsEnabled) {
      toast({
        title: "Payments Unavailable",
        description: "Host hasn't enabled payouts yet.",
        variant: "destructive",
      });
      return;
    }

    setLoadingTier(tierId);
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/checkout/session', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ experienceId, tierId })
      // });
      // const { url } = await response.json();
      
      // Mock checkout URL for demo
      const mockCheckoutUrl = `https://checkout.stripe.com/pay/mock-session-${tierId}`;
      
      if (mockCheckoutUrl) {
        // Open Stripe checkout in a new tab
        window.open(mockCheckoutUrl, '_blank');
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      toast({
        title: "Checkout Failed",
        description: "Checkout couldn't be created. Please try later.",
        variant: "destructive",
      });
    } finally {
      setLoadingTier(null);
    }
  };

  const handleApply = (tierId: string) => {
    // Handle free tier application
    console.log('Applying for free tier:', tierId);
    toast({
      title: "Application Submitted",
      description: "Your application has been submitted successfully.",
    });
  };

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(0)}`;
  };

  if (!tiers || tiers.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Ticket className="w-5 h-5 text-neon-cyan" />
        <h3 className="text-lg font-semibold text-foreground">Choose Your Tier</h3>
      </div>
      
      <div className="grid gap-4">
        {tiers.map((tier) => {
          const isPaid = tier.price_cents > 0;
          const isLoading = loadingTier === tier.id;
          const canPurchase = isPaid && hostPayoutsEnabled;
          
          return (
            <div
              key={tier.id}
              className="p-4 bg-white/5 border border-white/10 rounded-lg hover:border-white/20 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground">{tier.name}</h4>
                    {isPaid && (
                      <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
                        {formatPrice(tier.price_cents)}
                      </Badge>
                    )}
                    {!isPaid && (
                      <Badge variant="outline" className="text-muted-foreground">
                        Free
                      </Badge>
                    )}
                  </div>
                  
                  {tier.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {tier.description}
                    </p>
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    {tier.quantity} spots available
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                {isPaid ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex-1">
                          <Button
                            onClick={() => handleBuyTicket(tier.id)}
                            disabled={isLoading || !canPurchase}
                            className="w-full bg-neon-green text-background hover:bg-neon-green/90 font-medium rounded-full"
                          >
                            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            <CreditCard className="w-4 h-4 mr-2" />
                            {isLoading ? 'Creating...' : 'Buy Now'}
                          </Button>
                        </div>
                      </TooltipTrigger>
                      {!canPurchase && (
                        <TooltipContent>
                          <p>Payments unavailable—host hasn't enabled payouts yet.</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <Button
                    onClick={() => handleApply(tier.id)}
                    className="w-full bg-white/10 text-foreground hover:bg-white/20 font-medium rounded-full"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Apply Now
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};