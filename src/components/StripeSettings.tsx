import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Loader2,
  DollarSign,
  TrendingUp,
  Trash2,
  Settings,
  RefreshCcw,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { paymentsService, StripeStatus } from '@/services/payments.service';
import { brandsService } from '@/services/brands.service';
import { userService } from '@/services/user.service';
import { useToast } from '@/hooks/use-toast';
import { maskStripeAccountId, getDisplayAccountId } from '@/utils/account-masking';

interface StripeSettingsProps {
  brandId?: string;
  onStatusChange?: (status: StripeStatus) => void;
}

export const StripeSettings: React.FC<StripeSettingsProps> = ({ brandId, onStatusChange }) => {
  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditingAccountId, setIsEditingAccountId] = useState(false);
  const [newAccountId, setNewAccountId] = useState('');
  const [isSavingAccountId, setIsSavingAccountId] = useState(false);
  const [maskedAccountId, setMaskedAccountId] = useState<string | null>(null);
  const [currentAccountId, setCurrentAccountId] = useState<string | null>(null);
  const { toast } = useToast();

  const loadStripeStatus = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const status = await paymentsService.getStripeStatus();
      setStripeStatus(status);
      onStatusChange?.(status);
    } catch (err) {
      // Treat failures as not connected; do not show errors
      setStripeStatus({
        hasAccount: false,
        onboardingCompleted: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
      } as StripeStatus);
    } finally {
      setIsLoading(false);
    }
  };

  const loadBrandData = async () => {
    try {
      if (brandId) {
        // Brand-level settings
        const brand = await brandsService.getMyBrand();
        if (brand?.data?.stripeAccountId) {
          setMaskedAccountId(maskStripeAccountId(brand.data.stripeAccountId));
        }
        
        // Load current account ID for comparison
        const currentId = await brandsService.getCurrentStripeAccountId(brandId);
        setCurrentAccountId(currentId);
      } else {
        // User-level settings
        const userAccountId = await userService.getStripeAccountId();
        if (userAccountId) {
          setMaskedAccountId(maskStripeAccountId(userAccountId));
          setCurrentAccountId(userAccountId);
        }
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  };

  useEffect(() => {
    loadStripeStatus();
    loadBrandData();
  }, [brandId]);

  const handleConnectStripe = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      const response = await paymentsService.createAccountLink();
      
      // Open Stripe onboarding in a new window
      const onboardingWindow = window.open(response.onboarding_url, '_blank', 'width=800,height=600');
      
      toast({
        title: "Stripe Onboarding",
        description: "Complete your Stripe setup in the new window. You can close it when done.",
      });
      
      // Check for completion periodically
      const checkCompletion = setInterval(async () => {
        if (onboardingWindow?.closed) {
          clearInterval(checkCompletion);
          // Wait a moment for Stripe to process, then check status
          setTimeout(async () => {
            try {
              const newStatus = await paymentsService.getStripeStatus();
              setStripeStatus(newStatus);
              onStatusChange?.(newStatus);
              
              // If onboarding is complete, save the account ID
              if (newStatus.chargesEnabled && newStatus.payoutsEnabled && newStatus.accountId) {
                if (brandId) {
                  // Brand-level connection
                  await brandsService.saveStripeAccountId(brandId, newStatus.accountId);
                  toast({
                    title: "Stripe Connected!",
                    description: "Your Stripe account has been successfully connected to your brand.",
                  });
                } else {
                  // User-level connection
                  await userService.saveStripeAccountId(newStatus.accountId);
                  toast({
                    title: "Stripe Connected!",
                    description: "Your Stripe account has been successfully connected.",
                  });
                }
              }
            } catch (error) {
              console.error('Failed to check Stripe status after onboarding:', error);
            }
          }, 2000);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Failed to create Stripe account link:', error);
      setError('Failed to initiate Stripe connection. Please try again.');
      toast({
        title: "Error",
        description: "Failed to initiate Stripe connection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDeleteStripeAccount = async () => {
    try {
      setIsDeleting(true);
      
      if (brandId) {
        // Brand-level settings
        await brandsService.deleteStripeAccountId(brandId);
        toast({
          title: "Stripe Account Removed",
          description: "Your Stripe account has been disconnected from your brand.",
        });
      } else {
        // User-level settings
        await userService.deleteStripeAccountId();
        toast({
          title: "Stripe Account Removed",
          description: "Your Stripe account has been disconnected.",
        });
      }
      
      // Refresh status and data
      await loadStripeStatus();
      await loadBrandData();
      
    } catch (error) {
      console.error('Failed to delete Stripe account:', error);
      toast({
        title: "Error",
        description: "Failed to remove Stripe account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditAccountId = () => {
    setIsEditingAccountId(true);
    setNewAccountId('');
  };

  const handleCancelEdit = () => {
    setIsEditingAccountId(false);
    setNewAccountId('');
  };

  const handleSaveAccountId = async () => {
    if (!newAccountId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid Stripe account ID.",
        variant: "destructive",
      });
      return;
    }

    const trimmedNewId = newAccountId.trim();
    
    // Check if the account ID has actually changed
    if (currentAccountId === trimmedNewId) {
      toast({
        title: "No Changes",
        description: "The account ID is the same as the current one.",
        variant: "default",
      });
      setIsEditingAccountId(false);
      setNewAccountId('');
      return;
    }

    try {
      setIsSavingAccountId(true);
      
      if (brandId) {
        // Brand-level settings
        await brandsService.saveStripeAccountId(brandId, trimmedNewId);
        toast({
          title: "Account ID Updated",
          description: "Your brand's Stripe account ID has been updated successfully.",
        });
      } else {
        // User-level settings
        await userService.saveStripeAccountId(trimmedNewId);
        toast({
          title: "Account ID Updated",
          description: "Your Stripe account ID has been updated successfully.",
        });
      }
      
      // Refresh data to get the new masked ID
      await loadBrandData();
      
      setIsEditingAccountId(false);
      setNewAccountId('');
      
    } catch (error) {
      console.error('Failed to save Stripe account ID:', error);
      toast({
        title: "Error",
        description: "Failed to update Stripe account ID. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSavingAccountId(false);
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
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-neon-cyan mr-2" />
          <span className="text-muted-foreground">Loading Stripe settings...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 border-white/10 rounded-2xl">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-3">
          <Settings className="w-5 h-5" />
          Stripe Payment Settings
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm">{getStatusMessage()}</p>

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

        {/* Account ID Section */}
        {(maskedAccountId || isEditingAccountId) && (
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-neon-cyan" />
                <span className="text-sm font-medium text-foreground">
                  {maskedAccountId ? "Connected Account ID" : "Stripe Account ID"}
                </span>
              </div>
              {!isEditingAccountId && maskedAccountId && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleEditAccountId}
                  className="text-neon-cyan hover:bg-neon-cyan/10"
                >
                  <Edit3 className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              )}
            </div>
            
            {isEditingAccountId ? (
              <div className="space-y-3">
                <Input
                  value={newAccountId}
                  onChange={(e) => setNewAccountId(e.target.value)}
                  placeholder="Enter Stripe account ID (e.g., acct_1234567890)"
                  className="bg-white/5 border-white/20 text-foreground"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveAccountId}
                    disabled={isSavingAccountId || !newAccountId.trim()}
                    className="bg-neon-cyan text-background hover:bg-neon-cyan/90"
                  >
                    {isSavingAccountId ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Save className="w-3 h-3 mr-1" />
                    )}
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="border-white/20 text-foreground hover:bg-white/10"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : maskedAccountId ? (
              <div className="bg-white/3 rounded-lg p-3 border border-white/10">
                <code className="text-foreground font-mono text-sm">{getDisplayAccountId(maskedAccountId)}</code>
              </div>
            ) : null}
          </div>
        )}

        <div className="pt-4 border-t border-white/10 space-y-3">
          {(!stripeStatus?.chargesEnabled || !stripeStatus?.payoutsEnabled) && !maskedAccountId ? (
            <div className="space-y-3">
              <Button
                onClick={handleConnectStripe}
                disabled={isConnecting}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold"
              >
                {isConnecting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {stripeStatus?.hasAccount ? "Continue Setup" : "Connect Stripe Account"}
              </Button>
              
              <div className="text-center text-muted-foreground text-sm">or</div>
              
              <Button
                onClick={handleEditAccountId}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Add Existing Stripe Account ID
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={loadStripeStatus}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                <RefreshCcw className="w-4 h-4 mr-2" /> Refresh Status
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove Stripe Account</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to disconnect your Stripe account from this brand? 
                      This will prevent you from receiving payments for your experiences.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteStripeAccount}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Remove Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
          
          <p className="text-xs text-muted-foreground text-center">
            {(!stripeStatus?.chargesEnabled || !stripeStatus?.payoutsEnabled) 
              ? "You'll be redirected to Stripe to complete the setup process"
              : "Your Stripe account is connected and ready for payments"
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
