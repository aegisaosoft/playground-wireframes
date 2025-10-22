import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Upload, 
  Save, 
  X, 
  Camera, 
  Building, 
  Users, 
  Star,
  Eye,
  EyeOff,
  CreditCard,
  Settings,
  Mic,
  MicOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { brandsService, BrandDto } from '@/services/brands.service';
import { resolveApiResourceUrl } from '@/lib/api-client';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { StripeSettings } from '@/components/StripeSettings';
import { maskStripeAccountId } from '@/utils/account-masking';
import { getAvatarManifest } from '@/lib/avatars';

interface BrandData {
  id?: string;
  name: string;
  description: string;
  logo?: string;
  banner?: string;
  categoryTitle: string;
  followers: number;
  rating: number;
  experiencesCount: number;
  participantsCount: number;
  stripeAccountId?: string;
  tagline?: string;
  website?: string;
  email?: string;
  phone?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  facebook?: string;
  isVerified?: boolean;
}

interface EditBrandPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (brandData: BrandData) => void;
  initialData?: BrandData;
  userName?: string;
}

export const EditBrandPageModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData,
  userName 
}: EditBrandPageModalProps) => {
  const [brandData, setBrandData] = useState<BrandData>({
    name: '',
    description: '',
    logo: undefined,
    banner: undefined,
    categoryTitle: '',
    followers: 0,
    rating: 0,
    experiencesCount: 0,
    participantsCount: 0,
    stripeAccountId: '',
    tagline: '',
    website: '',
    email: '',
    phone: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    facebook: '',
    isVerified: false,
  });
  
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [selectedLogoUrl, setSelectedLogoUrl] = useState<string | null>(null);
  const [selectedBannerUrl, setSelectedBannerUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [availableAvatars, setAvailableAvatars] = useState<string[]>([]);

  // Voice recognition for description field
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript
  } = useVoiceRecognition();

  useEffect(() => {
    console.log('🔄 EditBrandPageModal useEffect - initialData:', initialData);
    console.log('🔄 EditBrandPageModal useEffect - userName:', userName);
    
    if (initialData) {
      console.log('📝 Setting brand data from initialData');
      console.log('📝 initialData.logo:', initialData.logo);
      console.log('📝 initialData.banner:', initialData.banner);
      setBrandData(initialData);
      const logoUrl = (resolveApiResourceUrl(initialData.logo) as string) || '';
      const bannerUrl = (resolveApiResourceUrl(initialData.banner) as string) || '';
      setLogoPreview(logoUrl || null);
      // Preview default banner image if none set; this is for display only
      setBannerPreview(bannerUrl || '/default-retreat-banner.png');
    } else {
      // Set empty values for new brand
      const defaultData = {
        name: `${userName || 'New'} Brand`,
        description: '',
        categoryTitle: '',
        followers: 0,
        rating: 0,
        experiencesCount: 0,
        participantsCount: 0,
        stripeAccountId: '',
        tagline: '',
        website: '',
        email: '',
        phone: '',
        instagram: '',
        twitter: '',
        linkedin: '',
        facebook: '',
        isVerified: false,
      };
      console.log('📝 Setting empty brand data for new brand:', defaultData);
      setBrandData(defaultData);
      setLogoPreview(null);
      setBannerPreview(null);
    }
  }, [initialData, userName]);

  // Load available avatars from manifest once modal mounts
  useEffect(() => {
    let mounted = true;
    getAvatarManifest().then((list) => {
      if (!mounted) return;
      setAvailableAvatars(list);
    }).catch(() => setAvailableAvatars([]));
    return () => { mounted = false; };
  }, []);

  // Update description when voice transcript changes
  useEffect(() => {
    if (transcript) {
      setBrandData(prev => ({
        ...prev,
        description: prev.description + (prev.description ? ' ' : '') + transcript
      }));
      // Reset transcript after using it
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setBannerPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      console.log('💾 Current brandData before save:', brandData);
      
      // Transform the brand data to match the API format
      const apiBrandData = {
        Name: brandData.name || '',
        Description: brandData.description || '',
        Tagline: brandData.tagline || '',
        Website: brandData.website || '',
        Email: brandData.email || '',
        Phone: brandData.phone || '',
        Instagram: brandData.instagram || '',
        Twitter: brandData.twitter || '',
        LinkedIn: brandData.linkedin || '',
        Facebook: brandData.facebook || '',
        StripeAccountId: brandData.stripeAccountId || ''
      };
      
      console.log('📤 API brand data being sent:', apiBrandData);

      // Save brand data with images in a single API call
      // Use createBrand for new brands, saveBrand for existing brands
      console.log('🔍 EditBrandPageModal - initialData:', initialData);
      console.log('🔍 EditBrandPageModal - Using method:', initialData ? 'saveBrand (edit)' : 'createBrand (new)');
      
      const response = initialData 
        ? await brandsService.saveBrand(apiBrandData, logoToUpload, bannerToUpload, initialData.id)
        : await brandsService.createBrand(apiBrandData, logoToUpload, bannerToUpload);
      
      console.log('🔄 Brand save response:', response);
      const respLogo = (response as any)?.data?.LogoUrl ?? (response as any)?.data?.logoUrl;
      const respBanner = (response as any)?.data?.CoverImageUrl ?? (response as any)?.data?.coverImageUrl;
      const resolvedLogo = resolveApiResourceUrl(respLogo) as string | undefined;
      const resolvedBanner = resolveApiResourceUrl(respBanner) as string | undefined;
      console.log('🖼️ Logo URL from response (resolved):', resolvedLogo);
      console.log('🖼️ Banner URL from response (resolved):', resolvedBanner);
      
      // Update brand data with the response - map backend BrandDto to frontend BrandData
      const updatedBrandData = {
        ...brandData,
        id: (response as any)?.data?.Id || (response as any)?.data?.id || brandData.id,
        name: (response as any)?.data?.Name || (response as any)?.data?.name || brandData.name,
        description: (response as any)?.data?.Description || (response as any)?.data?.description || brandData.description,
        logo: resolvedLogo ?? brandData.logo,
        banner: resolvedBanner ?? brandData.banner,
        followers: (response as any)?.data?.FollowersCount || (response as any)?.data?.followersCount || brandData.followers,
        rating: (response as any)?.data?.AverageRating || (response as any)?.data?.averageRating || brandData.rating,
        experiencesCount: (response as any)?.data?.ExperiencesCount || (response as any)?.data?.experiencesCount || brandData.experiencesCount,
        participantsCount: (response as any)?.data?.ParticipantsCount || (response as any)?.data?.participantsCount || brandData.participantsCount,
        tagline: (response as any)?.data?.Tagline || (response as any)?.data?.tagline || brandData.tagline,
        website: (response as any)?.data?.Website || (response as any)?.data?.website || brandData.website,
        email: (response as any)?.data?.Email || (response as any)?.data?.email || brandData.email,
        phone: (response as any)?.data?.Phone || (response as any)?.data?.phone || brandData.phone,
        instagram: (response as any)?.data?.Instagram || (response as any)?.data?.instagram || brandData.instagram,
        twitter: (response as any)?.data?.Twitter || (response as any)?.data?.twitter || brandData.twitter,
        linkedin: (response as any)?.data?.LinkedIn || (response as any)?.data?.linkedin || brandData.linkedin,
        facebook: (response as any)?.data?.Facebook || (response as any)?.data?.facebook || brandData.facebook,
        isVerified: (response as any)?.data?.IsVerified || (response as any)?.data?.isVerified || brandData.isVerified
      };

      await onSave(updatedBrandData);
      // Brand page updated successfully
      onClose();
    } catch (error) {
      console.error('Error saving brand:', error);
      toast({
        title: "❌ Error",
        description: "Failed to save brand page. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderPreview = () => (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative h-48 bg-gradient-to-r from-[#ff66c4] to-[#00FFFF] rounded-xl overflow-hidden">
        {bannerPreview ? (
          <img 
            src={bannerPreview} 
            alt="Brand banner" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[#ff66c4]/20 to-[#00FFFF]/20 flex items-center justify-center">
            <Building className="w-16 h-16 text-white/50" />
          </div>
        )}
        <div className="absolute bottom-4 left-6 right-6">
          <div className="flex items-end gap-4">
            <Avatar className="w-20 h-20 border-4 border-white/20">
              <AvatarImage src={logoPreview || undefined} />
              <AvatarFallback className="bg-gradient-to-r from-[#ff66c4] to-[#00FFFF] text-white text-2xl font-bold">
                {(brandData.name || 'B').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">{brandData.name || 'Brand Name'}</h2>
              <p className="text-white/80 text-sm mb-2">{brandData.categoryTitle}</p>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  <Users className="w-3 h-3 mr-1" />
                  {brandData.followers} followers
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  <Star className="w-3 h-3 mr-1" />
                  {brandData.rating} rating
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <Card className="bg-[hsl(var(--card))] border-white/10 rounded-2xl">
        <CardContent className="p-6 space-y-4">
          <div>
            <h4 className="font-semibold text-[hsl(var(--foreground))] mb-2">About</h4>
            <p className="text-[hsl(var(--muted-foreground))] text-sm leading-relaxed">
              {brandData.description}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-[hsl(var(--foreground))] mb-2">Experiences Hosted</h4>
            <p className="text-[hsl(var(--muted-foreground))] text-sm">
              {brandData.experiencesCount} experiences • {brandData.participantsCount} total participants
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (showPreview) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[hsl(var(--background))] border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-[hsl(var(--foreground))]">
              <span className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#00FFFF]" />
                Brand Page Preview
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(false)}
                className="text-[hsl(var(--muted-foreground))] hover:text-[#ff66c4]"
              >
                <EyeOff className="w-4 h-4" />
              </Button>
            </DialogTitle>
            <DialogDescription>
              Preview how your brand page will appear to visitors
            </DialogDescription>
          </DialogHeader>
          
          {renderPreview()}
          
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowPreview(false)}
              className="border-white/20 text-[hsl(var(--foreground))] hover:bg-white/10"
            >
              Back to Edit
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-gradient-to-r from-[#00FFFF] to-[#B366FF] hover:shadow-[0_0_30px_rgba(0,255,255,0.3)] text-white font-bold"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[hsl(var(--background))] border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[hsl(var(--foreground))]">
            <Building className="w-5 h-5 text-[#00FFFF]" />
            {initialData ? 'Edit Brand Page' : 'Create New Brand'}
          </DialogTitle>
          <DialogDescription>
            {initialData ? 'Update your brand information and settings' : 'Create a new brand page to showcase your experiences'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Brand Name & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand-name" className="text-[hsl(var(--foreground))]">Brand Name</Label>
              <Input
                id="brand-name"
                value={brandData.name || ''}
                onChange={(e) => setBrandData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your brand name"
                className="bg-[hsl(var(--input))] border-white/20 text-[hsl(var(--foreground))] focus:border-[#00FFFF] focus:ring-[#00FFFF]/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-title" className="text-[hsl(var(--foreground))]">Category Title</Label>
              <Input
                id="category-title"
                value={brandData.categoryTitle}
                onChange={(e) => setBrandData(prev => ({ ...prev, categoryTitle: e.target.value }))}
                placeholder="e.g., Professional Host, Wellness Coach"
                className="bg-[hsl(var(--input))] border-white/20 text-[hsl(var(--foreground))] focus:border-[#00FFFF] focus:ring-[#00FFFF]/20"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description" className="text-[hsl(var(--foreground))]">About Your Brand</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={isListening ? stopListening : startListening}
                className={`border-white/20 text-[hsl(var(--foreground))] hover:bg-white/10 ${
                  isListening ? 'border-[#ff66c4] text-[#ff66c4] bg-[#ff66c4]/10' : ''
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Voice Input
                  </>
                )}
              </Button>
            </div>
            <Textarea
              id="description"
              value={brandData.description}
              onChange={(e) => setBrandData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Tell people about your brand, mission, and what makes your experiences special..."
              rows={4}
              className="bg-[hsl(var(--input))] border-white/20 text-[hsl(var(--foreground))] focus:border-[#00FFFF] focus:ring-[#00FFFF]/20 resize-none"
            />
            {isListening && (
              <div className="flex items-center gap-2 text-[#ff66c4] text-sm">
                <div className="w-2 h-2 bg-[#ff66c4] rounded-full animate-pulse"></div>
                <span>Listening... Speak now</span>
              </div>
            )}
          </div>

          {/* Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Upload */}
            <div className="space-y-4">
              <Label className="text-[hsl(var(--foreground))]">Brand Logo</Label>
              <div className="space-y-3">
                <div className="w-24 h-24 bg-gradient-to-r from-[#ff66c4] to-[#00FFFF] rounded-full flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="Brand logo" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-2xl font-bold">
                      {(brandData.name || 'B').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                    className="border-white/20 text-[hsl(var(--foreground))] hover:bg-white/10"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Upload Logo
                  </Button>
                  {logoPreview && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setLogoPreview(null);
                        setLogoFile(null);
                        setSelectedLogoUrl(null);
                        setBrandData(prev => ({ ...prev, logo: undefined }));
                      }}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {/* Preset logo gallery (only if avatars exist on server) */}
                {availableAvatars.length > 0 && (
                  <div className="pt-1">
                    <Label className="text-xs text-[hsl(var(--foreground))]">Or choose from gallery</Label>
                    <div className="grid grid-cols-6 gap-2 mt-2">
                      {availableAvatars.map((url) => {
                        const file = url.split('/').pop() as string;
                        const isSelected = selectedLogoUrl === url;
                        return (
                          <button
                            key={url}
                            type="button"
                            onClick={() => { setSelectedLogoUrl(url); setLogoFile(null); setLogoPreview(url); }}
                            className={`rounded-full overflow-hidden border ${isSelected ? 'border-neon-cyan' : 'border-white/20'} w-10 h-10`}
                            title={file}
                          >
                            <img src={url} alt={file} className="w-full h-full object-cover" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Banner Upload */}
            <div className="space-y-4">
              <Label className="text-[hsl(var(--foreground))]">Brand Banner</Label>
              <div className="space-y-3">
                <div className="h-24 bg-gradient-to-r from-[#ff66c4]/20 to-[#00FFFF]/20 rounded-lg flex items-center justify-center overflow-hidden border border-white/10">
                  {bannerPreview ? (
                    <img 
                      src={bannerPreview} 
                      alt="Brand banner" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building className="w-8 h-8 text-white/50" />
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="file"
                    id="banner-upload"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('banner-upload')?.click()}
                    className="border-white/20 text-[hsl(var(--foreground))] hover:bg-white/10"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Banner
                  </Button>
                  {bannerPreview && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setBannerPreview(null);
                        setBannerFile(null);
                        setSelectedBannerUrl(null);
                        setBrandData(prev => ({ ...prev, banner: undefined }));
                      }}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {/* Banner preset gallery intentionally removed per request. Upload only. */}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="followers" className="text-[hsl(var(--foreground))]">Followers</Label>
              <Input
                id="followers"
                type="number"
                value={brandData.followers}
                onChange={(e) => setBrandData(prev => ({ ...prev, followers: parseInt(e.target.value) || 0 }))}
                className="bg-[hsl(var(--input))] border-white/20 text-[hsl(var(--foreground))] focus:border-[#00FFFF] focus:ring-[#00FFFF]/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating" className="text-[hsl(var(--foreground))]">Rating</Label>
              <Input
                id="rating"
                type="number"
                step="0.1"
                value={brandData.rating}
                onChange={(e) => setBrandData(prev => ({ ...prev, rating: parseFloat(e.target.value) || 0 }))}
                className="bg-[hsl(var(--input))] border-white/20 text-[hsl(var(--foreground))] focus:border-[#00FFFF] focus:ring-[#00FFFF]/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experiences" className="text-[hsl(var(--foreground))]">Experiences</Label>
              <Input
                id="experiences"
                type="number"
                value={brandData.experiencesCount}
                onChange={(e) => setBrandData(prev => ({ ...prev, experiencesCount: parseInt(e.target.value) || 0 }))}
                className="bg-[hsl(var(--input))] border-white/20 text-[hsl(var(--foreground))] focus:border-[#00FFFF] focus:ring-[#00FFFF]/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="participants" className="text-[hsl(var(--foreground))]">Participants</Label>
              <Input
                id="participants"
                type="number"
                value={brandData.participantsCount}
                onChange={(e) => setBrandData(prev => ({ ...prev, participantsCount: parseInt(e.target.value) || 0 }))}
                className="bg-[hsl(var(--input))] border-white/20 text-[hsl(var(--foreground))] focus:border-[#00FFFF] focus:ring-[#00FFFF]/20"
              />
            </div>
          </div>

          {/* Stripe Integration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">Stripe Integration</h3>
            </div>
            {/* Reuse the same StripeSettings component with brandId to get full Connect flow */}
            {(initialData?.id || brandData.id) && (
              <StripeSettings brandId={(initialData?.id || brandData.id)!} />
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-6 border-t border-white/10">
          <Button
            variant="outline"
            onClick={() => setShowPreview(true)}
            className="border-white/20 text-[hsl(var(--foreground))] hover:bg-white/10"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-white/20 text-[hsl(var(--foreground))] hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-gradient-to-r from-[#00FFFF] to-[#B366FF] hover:shadow-[0_0_30px_rgba(0,255,255,0.3)] text-white font-bold"
            >
              {isLoading ? (
                <>
                  <Save className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Brand Page
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
