import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  ArrowLeft,
  Calendar,
  MapPin,
  Clock
} from 'lucide-react';
import { paymentsService } from '@/services/payments.service';
import { experiencesService } from '@/services/experiences.service';
import { brandsService, BrandData } from '@/services/brands.service';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51234567890abcdef');

interface Experience {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  featuredImageUrl?: string;
  basePriceCents?: number;
  ticketTiers?: TicketTier[];
  hostId?: string;
  host?: {
    id?: string;
    name: string;
    avatar?: string;
  };
}

interface TicketTier {
  id: string;
  name: string;
  priceCents: number;
  description?: string;
  capacity?: number;
  benefits?: string[];
}

interface PaymentFormData {
  quantity: number;
  ticketTierId?: string;
}

const PaymentForm: React.FC<{
  experience: Experience;
  selectedTierId?: string | null;
  onSuccess: (sessionId: string) => void;
  onError: (error: string) => void;
}> = ({ experience, selectedTierId, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<PaymentFormData>({
    quantity: 1,
    ticketTierId: selectedTierId || experience.ticketTiers?.find(tier => tier.priceCents > 0)?.id
  });
  const [tierCapacity, setTierCapacity] = useState<{ available: number } | null>(null);

  // Load tier capacity when component mounts or tier changes
  useEffect(() => {
    const loadTierCapacity = async () => {
      if (!formData.ticketTierId) return;
      
      try {
        const capacityData = await experiencesService.getTierCapacity(experience.id);
        const tierInfo = capacityData.find(t => t.tierId === formData.ticketTierId);
        if (tierInfo) {
          setTierCapacity({ available: tierInfo.available });
        }
      } catch (error) {
        console.error('Failed to load tier capacity:', error);
        // Continue without capacity data
      }
    };

    loadTierCapacity();
  }, [experience.id, formData.ticketTierId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create checkout session
      const sessionResponse = await paymentsService.createCheckoutSession({
        experienceId: experience.id,
        ticketTierId: formData.ticketTierId || undefined,
        quantity: formData.quantity,
        successUrl: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/payment/cancel`
      });

      // Redirect to Stripe Checkout using modern approach
      if (sessionResponse.url) {
        // Use the checkout URL directly
        window.location.href = sessionResponse.url;
        onSuccess(sessionResponse.sessionId);
      } else {
        console.error('Session response:', sessionResponse);
        onError('No checkout URL received from server');
      }
    } catch (error) {
      console.error('Payment error:', error);
      onError('Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedTier = experience.ticketTiers?.find(tier => tier.id === formData.ticketTierId);
  const totalAmount = selectedTier 
    ? (selectedTier.priceCents * formData.quantity) / 100
    : ((experience.basePriceCents || 0) * formData.quantity) / 100;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Experience Summary */}
      <Card className="bg-white/5 border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-neon-cyan" />
            Experience Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            {experience.featuredImageUrl && (
              <img 
                src={experience.featuredImageUrl} 
                alt={experience.title}
                className="w-20 h-20 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">{experience.title}</h3>
              <div className="flex items-center gap-4 text-sm text-white/70 mt-2">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {experience.location}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(experience.startDate).toLocaleDateString()} - {new Date(experience.endDate).toLocaleDateString()}
                </div>
              </div>
              {experience.host && (
                <div className="flex items-center gap-2 mt-2">
                  <User className="w-4 h-4 text-white/70" />
                  <span className="text-sm text-white/70">Hosted by {experience.host.name}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ticket Selection */}
      {experience.ticketTiers && experience.ticketTiers.length > 0 && (
        <Card className="bg-white/5 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Select Ticket Tier</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {experience.ticketTiers.filter(tier => tier.priceCents > 0).length > 0 ? (
              experience.ticketTiers.filter(tier => tier.priceCents > 0).map((tier) => (
              <div 
                key={tier.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  formData.ticketTierId === tier.id
                    ? 'border-neon-cyan bg-neon-cyan/10'
                    : 'border-white/20 hover:border-white/40'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, ticketTierId: tier.id }))}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-white">{tier.name}</h4>
                    {tier.description && (
                      <p className="text-sm text-white/70 mt-1">{tier.description}</p>
                    )}
                    {tier.benefits && tier.benefits.length > 0 && (
                      <ul className="text-xs text-white/60 mt-2 space-y-1">
                        {tier.benefits.map((benefit, index) => (
                          <li key={index}>• {benefit}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <Badge variant="outline" className="text-neon-cyan border-neon-cyan">
                    ${(tier.priceCents / 100).toFixed(2)}
                  </Badge>
                </div>
              </div>
              ))
            ) : (
              <div className="text-center py-8 text-white/60">
                <p>No paid ticket tiers available for this experience.</p>
                <p className="text-sm mt-2">Please contact the organizer for more information.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quantity Selection */}
      <Card className="bg-white/5 border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Quantity</CardTitle>
          {tierCapacity && (
            <p className="text-sm text-white/60 mt-1">
              {tierCapacity.available} tickets available for this tier
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFormData(prev => ({ 
                ...prev, 
                quantity: Math.max(1, prev.quantity - 1) 
              }))}
              disabled={formData.quantity <= 1}
              className="border-white/20 text-white hover:bg-white/10"
            >
              -
            </Button>
            <span className="text-white font-semibold min-w-[2rem] text-center">
              {formData.quantity}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFormData(prev => ({ 
                ...prev, 
                quantity: Math.min(tierCapacity?.available || 10, prev.quantity + 1) 
              }))}
              disabled={formData.quantity >= (tierCapacity?.available || 10)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              +
            </Button>
          </div>
        </CardContent>
      </Card>



      {/* Payment Summary */}
      <Card className="bg-white/5 border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Payment Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-white/70">
            <span>{selectedTier?.name || 'General Admission'}</span>
            <span>${((selectedTier?.priceCents || experience.basePriceCents || 0) / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-white/70">
            <span>Quantity</span>
            <span>{formData.quantity}</span>
          </div>
          <Separator className="bg-white/20" />
          <div className="flex justify-between text-white font-semibold text-lg">
            <span>Total</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-neon-cyan text-background hover:bg-neon-cyan/90 h-12 text-lg font-semibold"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5 mr-2" />
            Pay ${totalAmount.toFixed(2)}
          </>
        )}
      </Button>

      {/* Security Notice */}
      <div className="flex items-center justify-center gap-2 text-sm text-white/60">
        <Lock className="w-4 h-4" />
        <span>Your payment information is secure and encrypted</span>
      </div>
    </form>
  );
};

export const PaymentPage: React.FC = () => {
  const { experienceId } = useParams<{ experienceId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get tier from URL parameters
  const selectedTierId = searchParams.get('tier');
  
  const [experience, setExperience] = useState<Experience | null>(null);
  const [hostBrand, setHostBrand] = useState<BrandData | null>(null);
  const [stripeStatus, setStripeStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchExperienceAndCheckPaymentSetup = async () => {
      if (!experienceId) {
        setError('Experience ID is required');
        setIsLoading(false);
        return;
      }

      try {
        // Fetch experience details
        const exp = await experiencesService.getById(experienceId);
        setExperience(exp);

        // Get host ID (either from hostId or host.id)
        const hostId = exp.hostId || exp.host?.id;
        if (!hostId) {
          setError('Host information not available');
          setIsLoading(false);
          return;
        }

        // Check if host has a brand
        const brand = await brandsService.getBrandByUserId(hostId);
        setHostBrand(brand);

        if (!brand) {
          setError('No payment setup - Host has not created a brand page');
          setIsLoading(false);
          return;
        }

        // Note: Stripe status validation will be handled by the backend during checkout
        // No need to check Stripe status here as it will be validated when creating the checkout session

      } catch (err) {
        console.error('Failed to fetch experience:', err);
        setError('Failed to load experience details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExperienceAndCheckPaymentSetup();
  }, [experienceId]);

  const handlePaymentSuccess = (sessionId: string) => {
    toast({
      title: "Payment Initiated",
      description: "Redirecting to secure payment page...",
    });
  };

  const handlePaymentError = (error: string) => {
    toast({
      title: "Payment Error",
      description: error,
      variant: "destructive",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-white">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading payment details...</span>
        </div>
      </div>
    );
  }

  if (error || !experience) {
    const isPaymentSetupError = error?.includes('No payment setup');
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/50 flex items-center justify-center">
        <Card className="bg-white/5 border-white/20 max-w-md">
          <CardContent className="p-6 text-center">
            {isPaymentSetupError ? (
              <>
                <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">No Payment Setup</h2>
                <p className="text-white/70 mb-4">
                  This experience host has not set up payment processing yet. 
                  Please contact the host directly or check back later.
                </p>
              </>
            ) : (
              <>
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">Payment Error</h2>
                <p className="text-white/70 mb-4">{error || 'Experience not found'}</p>
              </>
            )}
            <Button 
              onClick={() => navigate('/experiences')}
              className="bg-neon-cyan text-background hover:bg-neon-cyan/90"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Experiences
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="text-white/70 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-white mb-2">Complete Your Purchase</h1>
          <p className="text-white/70">Secure payment powered by Stripe</p>
        </div>

        {/* Payment Form */}
        <div className="max-w-2xl mx-auto">
          <Elements stripe={stripePromise}>
            <PaymentForm 
              experience={experience}
              selectedTierId={selectedTierId}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </Elements>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
