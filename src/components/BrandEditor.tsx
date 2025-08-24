import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface BrandData {
  name: string;
  logo?: string;
  banner?: string;
  description: string;
}

interface BrandEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (brandData: BrandData) => void;
  initialData?: BrandData;
  hostName: string;
}

export const BrandEditor = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  hostName 
}: BrandEditorProps) => {
  const [brandName, setBrandName] = useState(initialData?.name || hostName);
  const [description, setDescription] = useState(initialData?.description || "");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.logo || null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(initialData?.banner || null);
  const [showPreview, setShowPreview] = useState(false);

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

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const removeBanner = () => {
    setBannerFile(null);
    setBannerPreview(null);
  };

  const handleSave = () => {
    const brandData: BrandData = {
      name: brandName,
      logo: logoPreview || undefined,
      banner: bannerPreview || undefined,
      description
    };
    onSave(brandData);
    onClose();
  };

  if (showPreview) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              Brand Page Preview
              <Button
                variant="outline"
                onClick={() => setShowPreview(false)}
              >
                Back to Editor
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Preview */}
            <div className="bg-gradient-subtle rounded-lg p-6">
              {/* Banner */}
              {bannerPreview && (
                <div className="w-full h-48 mb-6 rounded-lg overflow-hidden">
                  <img
                    src={bannerPreview}
                    alt="Brand banner"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              {/* Profile Section */}
              <div className="bg-background rounded-2xl shadow-sm border border-border p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={logoPreview || undefined} alt={brandName} />
                    <AvatarFallback className="text-2xl">
                      {brandName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                      {brandName}
                    </h1>
                    <p className="text-muted-foreground text-lg mb-4">
                      Retreat Organizer & Wellness Coach
                    </p>
                    <p className="text-foreground leading-relaxed max-w-2xl">
                      {description || "Creating transformative experiences that connect mind, body, and spirit."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleSave} className="bg-coral hover:bg-coral-dark text-white">
                Save Brand Page
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Your Brand Page</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Brand Name */}
          <div className="space-y-2">
            <Label htmlFor="brandName">Brand Name *</Label>
            <Input
              id="brandName"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Enter your brand name"
              required
            />
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <Label>Brand Logo</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4">
              {logoPreview ? (
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={logoPreview} alt="Brand logo" />
                    <AvatarFallback>
                      {brandName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Logo uploaded</p>
                    <p className="text-xs text-muted-foreground">
                      This will appear on your brand page and retreat cards
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeLogo}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                  <div className="mt-2">
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      <span className="text-coral hover:underline">
                        Upload brand logo
                      </span>
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Banner Upload */}
          <div className="space-y-2">
            <Label>Brand Banner (Optional)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4">
              {bannerPreview ? (
                <div className="relative">
                  <img
                    src={bannerPreview}
                    alt="Brand banner"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeBanner}
                    className="absolute top-2 right-2 bg-background/80 hover:bg-background rounded-full p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                  <div className="mt-2">
                    <label htmlFor="banner-upload" className="cursor-pointer">
                      <span className="text-coral hover:underline">
                        Upload banner image
                      </span>
                      <input
                        id="banner-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleBannerUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, GIF up to 10MB • Recommended: 1200x400px
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Brand Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell people about your brand, mission, and what makes your retreats special..."
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <Button 
              variant="outline"
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview
            </Button>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                className="bg-coral hover:bg-coral-dark text-white"
              >
                Save Brand Page
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};