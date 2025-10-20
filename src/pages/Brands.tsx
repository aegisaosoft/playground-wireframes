import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  Building2, 
  Plus, 
  Search, 
  Crown, 
  Users, 
  Star, 
  MapPin, 
  Calendar,
  Edit3,
  Settings,
  Eye,
  MoreHorizontal,
  Loader2,
  Filter,
  User,
  Clock,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { brandsService, BrandData } from '@/services/brands.service';
import { experiencesService, Experience } from '@/services/experiences.service';

const Brands: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUser();
  
  // State management
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'owner' | 'member'>('all');
  const [selectedBrand, setSelectedBrand] = useState<BrandData | null>(null);
  const [brandExperiences, setBrandExperiences] = useState<Experience[]>([]);
  const [isLoadingExperiences, setIsLoadingExperiences] = useState(false);

  // Load experiences for selected brand
  const loadBrandExperiences = async (brandId: string) => {
    try {
      setIsLoadingExperiences(true);
      const experiences = await experiencesService.getExperiences();
      // Filter experiences created by this brand
      const brandExp = experiences.filter(exp => exp.creatorId === brandId);
      setBrandExperiences(brandExp);
    } catch (error) {
      console.error('Failed to load brand experiences:', error);
      toast({
        title: "Error",
        description: "Failed to load brand experiences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingExperiences(false);
    }
  };

  // Load brands on component mount
  useEffect(() => {
    const loadBrands = async () => {
      try {
        setIsLoading(true);
        const userBrands = await brandsService.getMyBrands();
        
        // Sort brands: owned brands first, then member brands
        const ownedBrands = userBrands.filter(brand => user && brand.ownerId && user.id === brand.ownerId);
        const memberBrands = userBrands.filter(brand => !(user && brand.ownerId && user.id === brand.ownerId));
        const sortedBrands = [...ownedBrands, ...memberBrands];
        
        setBrands(sortedBrands);
        
        // Auto-select first brand if available
        if (sortedBrands.length > 0) {
          setSelectedBrand(sortedBrands[0]);
          loadBrandExperiences(sortedBrands[0].id!);
        }
      } catch (error) {
        console.error('Failed to load brands:', error);
        toast({
          title: "Error",
          description: "Failed to load your brands. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadBrands();
    }
  }, [user, toast]);

  // Filter brands based on search and role
  const filteredBrands = brands.filter(brand => {
    const matchesSearch = brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         brand.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const isOwner = user && brand.ownerId && user.id === brand.ownerId;
    const matchesRole = filterRole === 'all' || 
                       (filterRole === 'owner' && isOwner) ||
                       (filterRole === 'member' && !isOwner);
    
    return matchesSearch && matchesRole;
  });

  // Get role badge for a brand
  const getRoleBadge = (brand: BrandData) => {
    const isOwner = user && brand.ownerId && user.id === brand.ownerId;
    
    return isOwner ? (
      <Badge variant="default" className="bg-neon-yellow/20 text-neon-yellow border-neon-yellow/30">
        <Crown className="w-3 h-3 mr-1" />
        Owner
      </Badge>
    ) : (
      <Badge variant="outline" className="border-neon-cyan/40 text-neon-cyan">
        <Users className="w-3 h-3 mr-1" />
        Member
      </Badge>
    );
  };

  // Handle brand selection
  const handleBrandSelect = (brand: BrandData) => {
    setSelectedBrand(brand);
    if (brand.id) {
      loadBrandExperiences(brand.id);
    }
  };

  // Handle create brand
  const handleCreateBrand = () => {
    navigate('/brand/create');
  };

  // Handle edit brand
  const handleEditBrand = (brand: BrandData, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/brand/${brand.id}/edit`);
  };

  // Handle view brand
  const handleViewBrand = (brand: BrandData, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/brand/${brand.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0b12] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-neon-cyan" />
          <span className="text-foreground">Loading your brands...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b12] flex">
      {/* Left Sidebar - Brands List */}
      <div className="w-80 bg-white/5 border-r border-white/10 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground">Your Brands</h1>
            <Button
              onClick={handleCreateBrand}
              size="sm"
              className="bg-neon-cyan text-background hover:bg-neon-cyan/90"
            >
              <Plus className="w-4 h-4 mr-1" />
              Create
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-foreground"
            />
          </div>
        </div>

        {/* Brands List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredBrands.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'No brands found' : 'No brands yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredBrands.map((brand) => (
                <Card
                  key={brand.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedBrand?.id === brand.id
                      ? 'bg-neon-cyan/10 border-neon-cyan/30'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                  onClick={() => handleBrandSelect(brand)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={brand.logoUrl || ''} alt={brand.name} />
                        <AvatarFallback className="bg-neon-cyan/20 text-neon-cyan text-sm">
                          {brand.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground text-sm truncate">
                            {brand.name}
                          </h3>
                          {getRoleBadge(brand)}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {brand.tagline || 'No tagline'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Brand Experiences */}
      <div className="flex-1 flex flex-col">
        {selectedBrand ? (
          <>
            {/* Brand Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedBrand.logoUrl || ''} alt={selectedBrand.name} />
                  <AvatarFallback className="bg-neon-cyan/20 text-neon-cyan text-xl">
                    {selectedBrand.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-foreground">{selectedBrand.name}</h2>
                    {getRoleBadge(selectedBrand)}
                    {selectedBrand.isVerified && (
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">{selectedBrand.description || 'No description'}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleViewBrand(selectedBrand, e)}
                    className="border-white/20 text-foreground hover:bg-white/10"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleEditBrand(selectedBrand, e)}
                    className="border-white/20 text-foreground hover:bg-white/10"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            </div>

            {/* Experiences List */}
            <div className="flex-1 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-foreground">Experiences</h3>
                <Button
                  onClick={() => navigate('/create')}
                  className="bg-neon-cyan text-background hover:bg-neon-cyan/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Experience
                </Button>
              </div>

              {isLoadingExperiences ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-neon-cyan mr-3" />
                  <span className="text-foreground">Loading experiences...</span>
                </div>
              ) : brandExperiences.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Experiences Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    This brand hasn't created any experiences yet.
                  </p>
                  <Button
                    onClick={() => navigate('/create')}
                    className="bg-neon-cyan text-background hover:bg-neon-cyan/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Experience
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {brandExperiences.map((experience) => (
                    <Card
                      key={experience.id}
                      className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-200 cursor-pointer"
                      onClick={() => navigate(`/experience/${experience.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-foreground line-clamp-2">
                            {experience.title}
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {experience.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{experience.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(experience.startDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              <span>${(experience.price || 0) / 100}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Select a Brand</h3>
              <p className="text-muted-foreground">
                Choose a brand from the sidebar to view its experiences.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Brands;
