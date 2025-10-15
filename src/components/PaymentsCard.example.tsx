/**
 * EXAMPLE: PaymentsCard with Real API Integration
 * 
 * This shows how to update PaymentsCard.tsx to use the real .NET backend API.
 * 
 * Key changes:
 * - Uses paymentsService instead of mock API calls
 * - Real error handling from the backend
 * - Actual Stripe Connect integration
 */

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { paymentsService, type StripeStatus } from "@/services/payments.service";

interface PaymentsCardProps {
  variant?: 'full' | 'compact';
}

export const PaymentsCard: React.FC<PaymentsCardProps> = ({ variant = 'full' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkStripeStatus();
  }, []);

  const checkStripeStatus = async () => {
    try {
      const status = await paymentsService.getStripeStatus();
      setStripeStatus(status);
    } catch (error) {
      console.error('Failed to check Stripe status:', error);
      toast({
        title: "Error",
        description: "Failed to load payment status.",
        variant: "destructive",
      });
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

    if (stripeStatus.payouts_enabled && stripeStatus.charges_enabled) {
      return (
        <Badge variant="default" className="bg-green-500 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Active
        </Badge>
      );
    } else if (stripeStatus.details_submitted) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Setup Incomplete
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Not Connected
        </Badge>
      );
    }
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center gap-3">
          <CreditCard className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-medium">Stripe Connect</p>
            {getStatusBadge()}
          </div>
        </div>
        {!stripeStatus?.payouts_enabled && (
          <Button onClick={handleConnectStripe} disabled={isLoading} size="sm">
            {stripeStatus?.details_submitted ? "Resume Setup" : "Connect"}
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            <CardTitle>Payment Settings</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
        <CardDescription>
          Manage your Stripe Connect account to accept payments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!stripeStatus ? (
          <div className="text-center py-4 text-muted-foreground">
            Loading payment status...
          </div>
        ) : stripeStatus.payouts_enabled ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-green-900">Stripe Connected</p>
                <p className="text-sm text-green-700">
                  Your account is set up and ready to accept payments.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border rounded-lg">
                <p className="text-sm text-muted-foreground">Charges</p>
                <div className="flex items-center gap-2 mt-1">
                  {stripeStatus.charges_enabled ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Enabled</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium">Disabled</span>
                    </>
                  )}
                </div>
              </div>
              <div className="p-3 border rounded-lg">
                <p className="text-sm text-muted-foreground">Payouts</p>
                <div className="flex items-center gap-2 mt-1">
                  {stripeStatus.payouts_enabled ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Enabled</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium">Disabled</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleResumeSetup}
              disabled={isLoading}
              className="w-full"
            >
              Manage Stripe Account
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-yellow-900">
                  {stripeStatus.details_submitted ? "Setup Incomplete" : "Stripe Not Connected"}
                </p>
                <p className="text-sm text-yellow-700">
                  {stripeStatus.details_submitted 
                    ? "Complete your Stripe setup to start accepting payments."
                    : "Connect your Stripe account to accept payments for your experiences."}
                </p>
              </div>
            </div>
            <Button 
              onClick={handleConnectStripe}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Connecting..." : (
                stripeStatus.details_submitted ? "Resume Stripe Setup" : "Connect Stripe"
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

