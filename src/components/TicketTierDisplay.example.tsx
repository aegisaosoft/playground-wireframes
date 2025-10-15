/**
 * EXAMPLE: TicketTierDisplay with Real API Integration
 * 
 * This shows how to update TicketTierDisplay.tsx to use the real .NET backend API.
 * 
 * Key changes:
 * - Uses paymentsService.createCheckoutSession() instead of mock
 * - Real Stripe checkout flow
 * - Proper error handling
 */

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, Loader2, Users } from "lucide-react";
import { paymentsService } from "@/services/payments.service";

export interface TicketTier {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  capacity: number;
  spotsTaken: number;
  benefits: string[];
  isPopular?: boolean;
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
      // Call real API to create checkout session
      const { url } = await paymentsService.createCheckoutSession({
        experienceId,
        tierId,
      });
      
      if (url) {
        // Redirect to Stripe checkout
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      toast({
        title: "Checkout Failed",
        description: error instanceof Error ? error.message : "Checkout couldn't be created. Please try later.",
        variant: "destructive",
      });
    } finally {
      setLoadingTier(null);
    }
  };

  const handleApply = async (tierId: string) => {
    // Handle free tier application
    setLoadingTier(tierId);
    try {
      // TODO: Call your application API endpoint
      // await apiClient.post('/api/applications', { experienceId, tierId });
      
      console.log('Applying for free tier:', tierId);
      toast({
        title: "Application Submitted",
        description: "Your application has been submitted successfully.",
      });
    } catch (error) {
      console.error('Failed to submit application:', error);
      toast({
        title: "Application Failed",
        description: error instanceof Error ? error.message : "Failed to submit application.",
        variant: "destructive",
      });
    } finally {
      setLoadingTier(null);
    }
  };

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(0)}`;
  };

  if (!tiers || tiers.length === 0) {
    return null;
  }

  return (
    <div className={`grid gap-6 md:grid-cols-${Math.min(tiers.length, 3)} ${className}`}>
      {tiers.map((tier) => {
        const isFree = tier.priceInCents === 0;
        const isSoldOut = tier.spotsTaken >= tier.capacity;
        const spotsLeft = tier.capacity - tier.spotsTaken;
        const isLoading = loadingTier === tier.id;

        return (
          <Card 
            key={tier.id} 
            className={`relative flex flex-col ${tier.isPopular ? 'border-primary shadow-lg' : ''}`}
          >
            {tier.isPopular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                Most Popular
              </Badge>
            )}
            
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl">{tier.name}</CardTitle>
              <CardDescription>{tier.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  {isFree ? "Free" : formatPrice(tier.priceInCents)}
                </span>
                {!isFree && <span className="text-muted-foreground">/person</span>}
              </div>
            </CardHeader>

            <CardContent className="flex-1 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>
                    {isSoldOut ? (
                      "Sold Out"
                    ) : (
                      `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left`
                    )}
                  </span>
                </div>
                <span className="text-muted-foreground">
                  {tier.spotsTaken}/{tier.capacity}
                </span>
              </div>

              <div className="space-y-2">
                {tier.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </CardContent>

            <CardFooter className="pt-4">
              <Button 
                className="w-full" 
                variant={tier.isPopular ? "default" : "outline"}
                onClick={() => isFree ? handleApply(tier.id) : handleBuyTicket(tier.id)}
                disabled={isSoldOut || isLoading || (tier.priceInCents > 0 && !hostPayoutsEnabled)}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : isSoldOut ? (
                  "Sold Out"
                ) : isFree ? (
                  "Apply Now"
                ) : (
                  "Buy Ticket"
                )}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

