import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Ticket, CreditCard, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { applicationsService } from '@/services/applications.service';
import { experiencesService } from '@/services/experiences.service';

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
  const [tierCapacity, setTierCapacity] = useState<Array<{ tierId: string; tierName: string; tierCapacity: number; sold: number; available: number }> | null>(null);
  const [loadingCapacity, setLoadingCapacity] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load per-tier capacity
  useEffect(() => {
    const loadTierCapacity = async () => {
      try {
        setLoadingCapacity(true);
        const capacity = await experiencesService.getTierCapacity(experienceId);
        setTierCapacity(capacity);
      } catch (error) {
        // Continue without capacity data - don't block the UI
      } finally {
        setLoadingCapacity(false);
      }
    };

    loadTierCapacity();
  }, [experienceId]);

  const handleBuyTicket = (tierId: string) => {
    if (!hostPayoutsEnabled) {
      toast({
        title: "Payments Unavailable",
        description: "Host hasn't enabled payouts yet.",
        variant: "destructive",
      });
      return;
    }

    // Check if this specific tier is sold out
    const tierInfo = tierCapacity?.find(t => t.tierId === tierId);
    if (tierInfo && tierInfo.available <= 0) {
      toast({
        title: "Tier Sold Out",
        description: `The ${tierInfo.tierName} tier is fully booked.`,
        variant: "destructive",
      });
      return;
    }

    // Navigate to payment page with experience and tier information
    navigate(`/payment/${experienceId}?tier=${tierId}`);
  };

  const handleApply = async (tierId: string) => {
    setLoadingTier(tierId);
    try {
      
      // Create application via API
      const application = await applicationsService.createApplication({
        experienceId,
        message: `Application for ${tiers.find(t => t.id === tierId)?.name || 'free'} tier`
      });
      
      
      // Show success feedback (but no toast as per user request)
      // Application created successfully
      
    } catch (error) {
      toast({
        title: "Application Failed",
        description: error instanceof Error ? error.message : "Failed to submit application. Please try again.",
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

  // Debug logging removed to prevent console spam

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
                 const tierInfo = tierCapacity?.find(t => t.tierId === tier.id);
                 const isTierSoldOut = tierInfo ? tierInfo.available <= 0 : false;
                 const canPurchase = isPaid && hostPayoutsEnabled && !isTierSoldOut;
          
          return (
                 <div
                   key={tier.id}
                   className={`p-4 bg-white/5 border rounded-lg transition-colors ${
                     isTierSoldOut 
                       ? 'border-red-500/30 bg-red-500/5 opacity-60' 
                       : 'border-white/10 hover:border-white/20'
                   }`}
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
                           {loadingCapacity ? (
                             'Loading availability...'
                           ) : isTierSoldOut ? (
                             <span className="text-red-400">Tier Sold Out</span>
                           ) : (
                             `${tierInfo?.available || 0} of ${tierInfo?.tierCapacity || 0} spots available`
                           )}
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
                                   className={`w-full font-medium rounded-full ${
                                     isTierSoldOut 
                                       ? 'bg-gray-500 text-gray-300 cursor-not-allowed' 
                                       : 'bg-neon-green text-background hover:bg-neon-green/90'
                                   }`}
                                 >
                                   {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                   <CreditCard className="w-4 h-4 mr-2" />
                                   {isLoading ? 'Creating...' : isTierSoldOut ? 'Sold Out' : 'Buy Now'}
                                 </Button>
                        </div>
                      </TooltipTrigger>
                      {!canPurchase && (
                        <TooltipContent>
                          <p>
                            {isTierSoldOut 
                              ? 'This tier is sold out' 
                              : 'Payments unavailable—host hasn\'t enabled payouts yet.'
                            }
                          </p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <Button
                    onClick={() => handleApply(tier.id)}
                    disabled={isLoading}
                    className="w-full bg-white/10 text-foreground hover:bg-white/20 font-medium rounded-full"
                  >
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    <FileText className="w-4 h-4 mr-2" />
                    {isLoading ? 'Applying...' : 'Apply Now'}
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