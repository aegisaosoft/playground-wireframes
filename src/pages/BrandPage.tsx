import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RetreatCard } from "@/components/RetreatCard";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Save, Edit3, Camera, MapPin, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BrandData } from "@/components/BrandEditor";

interface BrandPageProps {
  retreats?: any[];
  savedRetreats?: number[];
  followedHosts?: string[];
  onToggleSaveRetreat?: (retreatId: number) => void;
  onToggleFollowHost?: (hostName: string) => void;
}

export const BrandPage = ({ 
  retreats = [], 
  savedRetreats = [], 
  followedHosts = [],
  onToggleSaveRetreat,
  onToggleFollowHost 
}: BrandPageProps) => {
  const { brandId } = useParams<{ brandId: string }>();
  const { toast } = useToast();
  
  // Get current user from localStorage to determine if they own this brand page
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Brand data state
  const [brandData, setBrandData] = useState<BrandData>({
    name: "Mindful Wellness Co.",
    description: "Creating transformative experiences that connect mind, body, and spirit. Our retreats are designed to help you disconnect from the chaos of daily life and reconnect with your inner wisdom through mindfulness, meditation, and holistic wellness practices.",
    logo: "/placeholder.svg",
    banner: "/placeholder.svg"
  });
  
  const [categoryTitle, setCategoryTitle] = useState("Retreat Organizer & Wellness Coach");
  
  // Editable state for brand info
  const [editableName, setEditableName] = useState(brandData.name);
  const [editableDescription, setEditableDescription] = useState(brandData.description);
  const [editableCategoryTitle, setEditableCategoryTitle] = useState(categoryTitle);
  const [logoPreview, setLogoPreview] = useState<string | null>(brandData.logo || null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(brandData.banner || null);
  
  // Sample brand retreats
  const brandRetreats = retreats.filter(r => r.organizer?.name === brandData.name);
  const isFollowing = followedHosts.includes(brandData.name);
  
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUser(user);
      
      // Check if this user owns the brand page
      const userBrandId = user.email?.replace('@', '_').replace('.', '_');
      setIsOwner(userBrandId === brandId);
    }
  }, [brandId]);

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBannerPreview(e.target?.result as string);
        setHasUnsavedChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
        setHasUnsavedChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = () => {
    const updatedBrandData: BrandData = {
      name: editableName,
      description: editableDescription,
      logo: logoPreview || undefined,
      banner: bannerPreview || undefined
    };
    
    setBrandData(updatedBrandData);
    setCategoryTitle(editableCategoryTitle);
    setIsEditing(false);
    setHasUnsavedChanges(false);
    
    // Brand page updated successfully
  };

  const toggleFollow = () => {
    if (onToggleFollowHost) {
      onToggleFollowHost(brandData.name);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Cover Image Section */}
      <div className="relative h-80 bg-gradient-subtle overflow-hidden">
        {bannerPreview && (
          <img
            src={bannerPreview}
            alt="Brand banner"
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Cover image upload button for owners */}
        {isOwner && (
          <div className="absolute top-4 right-4">
            <label htmlFor="cover-upload" className="cursor-pointer">
              <Button size="sm" variant="secondary" className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Change Cover
              </Button>
              <input
                id="cover-upload"
                type="file"
                accept="image/*"
                onChange={handleCoverImageUpload}
                className="hidden"
              />
            </label>
          </div>
        )}
        
        {/* Save button */}
        {isOwner && hasUnsavedChanges && (
          <div className="absolute bottom-4 right-4">
            <Button onClick={handleSaveChanges} className="bg-coral hover:bg-coral-dark text-white flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Brand Info Section */}
      <div className="max-w-6xl mx-auto px-6 -mt-20 relative z-10">
        <Card className="bg-background shadow-lg">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
                  <AvatarImage src={logoPreview || undefined} alt={brandData.name} />
                  <AvatarFallback className="text-3xl bg-coral text-white">
                    {brandData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                {/* Logo upload button for owners */}
                {isOwner && (
                  <label htmlFor="logo-upload" className="absolute bottom-2 right-2 cursor-pointer">
                    <div className="bg-coral hover:bg-coral-dark text-white rounded-full p-2 shadow-lg transition-colors">
                      <Upload className="w-4 h-4" />
                    </div>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              {/* Brand Details */}
              <div className="flex-1">
                {isOwner && isEditing ? (
                  <div className="space-y-4">
                    <Input
                      value={editableName}
                      onChange={(e) => {
                        setEditableName(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      className="text-3xl font-bold border-none p-0 focus:ring-0"
                      placeholder="Brand name"
                    />
                    <Input
                      value={editableCategoryTitle}
                      onChange={(e) => {
                        setEditableCategoryTitle(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      className="text-lg text-muted-foreground border-none p-0 focus:ring-0"
                      placeholder="Category title (e.g., Wellness and Retreat Coach)"
                    />
                    <Textarea
                      value={editableDescription}
                      onChange={(e) => {
                        setEditableDescription(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      className="text-lg text-muted-foreground border-none p-0 focus:ring-0 resize-none"
                      placeholder="Brand description"
                      rows={3}
                    />
                  </div>
                ) : (
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
                      {brandData.name}
                      {isOwner && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setIsEditing(true)}
                          className="opacity-60 hover:opacity-100"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      )}
                    </h1>
                    <p className="text-muted-foreground text-lg mb-4">
                      {categoryTitle}
                    </p>
                    <p className="text-foreground leading-relaxed max-w-3xl">
                      {brandData.description}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              {!isOwner && (
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={toggleFollow}
                    variant={isFollowing ? "outline" : "default"}
                    className={isFollowing ? "" : "bg-coral hover:bg-coral-dark text-white"}
                  >
                    {isFollowing ? "Unfollow" : "Follow"}
                  </Button>
                  <Button variant="outline">
                    Contact
                  </Button>
                </div>
              )}
              
              {isOwner && isEditing && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEditableName(brandData.name);
                      setEditableDescription(brandData.description);
                      setEditableCategoryTitle(categoryTitle);
                      setHasUnsavedChanges(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveChanges}
                    className="bg-coral hover:bg-coral-dark text-white"
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
            
            {/* Stats */}
            <div className="flex items-center gap-6 mt-6 pt-6 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold text-coral">{brandRetreats.length}</p>
                <p className="text-sm text-muted-foreground">Retreats</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-coral">42</p>
                <p className="text-sm text-muted-foreground">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-coral">4.9</p>
                <p className="text-sm text-muted-foreground">Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Retreats Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Retreats by {brandData.name}</h2>
          <Badge variant="secondary">
            {brandRetreats.length} retreat{brandRetreats.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        
        {brandRetreats.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground text-lg">No retreats available yet.</p>
              <p className="text-muted-foreground">Check back soon for upcoming retreats!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brandRetreats.map((retreat) => (
              <RetreatCard
                key={retreat.id}
                image={retreat.image}
                location={retreat.location}
                date={retreat.date}
                title={retreat.title}
                isSaved={savedRetreats.includes(retreat.id)}
                onToggleSave={() => onToggleSaveRetreat?.(retreat.id)}
                onClick={() => window.open(`/retreat/${retreat.id}`, '_blank')}
                organizer={retreat.organizer}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};