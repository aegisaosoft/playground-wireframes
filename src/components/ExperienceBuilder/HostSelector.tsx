import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { User, Info, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { brandsService, BrandData } from '@/services/brands.service';
import { useUser } from '@/contexts/UserContext';

export interface HostData {
  type: 'personal' | 'brand';
  name: string;
  avatar?: string;
  id?: string; // For API compatibility
  brandId?: string; // For backward compatibility
}

interface HostSelectorProps {
  selectedHost: HostData;
  onHostChange: (host: HostData) => void;
}

export const HostSelector: React.FC<HostSelectorProps> = ({
  selectedHost,
  onHostChange,
}) => {
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [userBrands, setUserBrands] = useState<BrandData[]>([]);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  
  // Authentication state
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get user from context
  const { user: contextUser, isAuthenticated } = useUser();

  useEffect(() => {
    // Use context user if available, otherwise fall back to localStorage
    if (contextUser) {
      setUser({
        id: contextUser.id,
        name: contextUser.name,
        email: contextUser.email
      });
    } else {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, [contextUser]);

  // Load user's brands when user is authenticated
  useEffect(() => {
    const loadUserBrands = async () => {
      if (isAuthenticated && contextUser) {
        setIsLoadingBrands(true);
        try {
          // First call debug endpoint to see what's in the database
          const debugInfo = await brandsService.debugMyBrands();
          
          const brands = await brandsService.getMyBrands();
          setUserBrands(brands);
        } catch (error) {
          setUserBrands([]);
        } finally {
          setIsLoadingBrands(false);
        }
      } else {
        setUserBrands([]);
      }
    };

    loadUserBrands();
  }, [isAuthenticated, contextUser]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (authMode === 'signup') {
      // Mock signup
      const newUser = {
        name: name,
        email: email,
      };
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
    } else {
      // Mock login
      const mockUser = {
        name: name || 'John Doe',
        email: email,
      };
      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
    }
    
    setIsLoading(false);
    // Reset form
    setEmail('');
    setPassword('');
    setName('');
  };



  const handleSelectPersonal = () => {
    if (!user) return;
    
    const personalHost: HostData = {
      type: 'personal',
      name: user.name,
      id: user.id, // Use user ID for personal host
    };
    
    onHostChange(personalHost);
  };

  const handleSelectBrand = (brand: BrandData) => {
    const brandHost: HostData = {
      type: 'brand',
      name: brand.name,
      avatar: brand.logo,
      id: brand.id, // Use brand ID for brand host
      brandId: brand.id, // For backward compatibility
    };
    
    onHostChange(brandHost);
  };


  if (!user) {
    return (
      <TooltipProvider>
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-neon-cyan" />
            <h3 className="font-medium text-foreground">Who is hosting this experience?</h3>
          </div>

          {!showAuthForm ? (
            // Simple Sign In Button
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">Please log in to select a host</p>
                  <Button
                    onClick={() => setShowAuthForm(true)}
                    className="w-full bg-gradient-neon text-background hover:opacity-90 font-semibold"
                  >
                    Sign In
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Full Authentication Form
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h4 className="text-lg font-semibold text-foreground mb-2">
                      {authMode === 'login' ? 'Sign In' : 'Create Account'}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {authMode === 'login' 
                        ? 'Welcome back! Sign in to select a host'
                        : 'Create an account to start hosting experiences'
                      }
                    </p>
                  </div>

                  <form onSubmit={handleAuth} className="space-y-4">
                    {authMode === 'signup' && (
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm text-foreground">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="name"
                            type="text"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-white/5 border-white/10 text-foreground pl-10 focus:ring-neon-cyan/50"
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm text-foreground">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-white/5 border-white/10 text-foreground pl-10 focus:ring-neon-cyan/50"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm text-foreground">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="bg-white/5 border-white/10 text-foreground pl-10 pr-10 focus:ring-neon-cyan/50"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowAuthForm(false)}
                        className="flex-1 text-muted-foreground hover:text-foreground hover:bg-white/10"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-neon text-background hover:opacity-90 font-semibold"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Please wait...' : (authMode === 'login' ? 'Sign In' : 'Create Account')}
                      </Button>
                    </div>
                  </form>

                  <div className="text-center pt-4 border-t border-white/10">
                    <p className="text-sm text-muted-foreground">
                      {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}
                      <button
                        type="button"
                        onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                        className="ml-2 text-neon-cyan hover:text-neon-pink transition-colors font-medium"
                      >
                        {authMode === 'login' ? 'Sign Up' : 'Sign In'}
                      </button>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-neon-cyan" />
          <h3 className="font-medium text-foreground">Who is hosting this experience?</h3>
        </div>

      {/* Personal Profile Option */}
      <Card 
        className={`cursor-pointer transition-all ${
          selectedHost.type === 'personal' 
            ? 'bg-neon-cyan/10 border-neon-cyan/40 ring-1 ring-neon-cyan/20' 
            : 'bg-white/5 border-white/10 hover:bg-white/8'
        }`}
        onClick={handleSelectPersonal}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-neon-pink/20 text-neon-pink text-sm">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground text-sm">{user.name}</p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      type="button"
                      className="flex items-center justify-center p-0.5 hover:bg-white/10 rounded transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Info className="w-3 h-3 text-muted-foreground hover:text-foreground cursor-help" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top"
                    className="bg-[#111] text-white border border-white/20 rounded-lg px-3 py-2 shadow-lg max-w-xs"
                  >
                    <p className="text-xs">Host as yourself with your profile name</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-xs text-muted-foreground">Personal profile</p>
            </div>
            {selectedHost.type === 'personal' && (
              <div className="w-2 h-2 bg-neon-cyan rounded-full" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* User's Brands Section */}
      
      {userBrands.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Your brands:</p>
          {userBrands.map((brand) => {
            return (
            <Card 
              key={brand.id}
              className={`cursor-pointer transition-all ${
                selectedHost.type === 'brand' && selectedHost.brandId === brand.id
                  ? 'bg-neon-purple/10 border-neon-purple/40 ring-1 ring-neon-purple/20' 
                  : 'bg-white/5 border-white/10 hover:bg-white/8'
              }`}
              onClick={() => handleSelectBrand(brand)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={brand.logo} alt={brand.name || 'Brand'} />
                    <AvatarFallback className="bg-neon-purple/20 text-neon-purple text-sm">
                      {(brand.name || 'Brand').split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground text-sm">{brand.name || 'Unnamed Brand'}</p>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button 
                            type="button"
                            className="flex items-center justify-center p-0.5 hover:bg-white/10 rounded transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Info className="w-3 h-3 text-muted-foreground hover:text-foreground cursor-help" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent 
                          side="top"
                          className="bg-[#111] text-white border border-white/20 rounded-lg px-3 py-2 shadow-lg max-w-xs"
                        >
                          <p className="text-xs">Host as {brand.role?.toLowerCase() || 'member'} of this brand</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {brand.role === 'Owner' ? 'Your brand' : `${brand.role} brand`}
                    </p>
                  </div>
                  {selectedHost.type === 'brand' && selectedHost.brandId === brand.id && (
                    <div className="w-2 h-2 bg-neon-purple rounded-full" />
                  )}
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}

      {/* Debug: Show when no brands found */}
      {userBrands.length === 0 && !isLoadingBrands && isAuthenticated && (
        <div className="p-4 border border-yellow-500/20 bg-yellow-500/5 rounded-lg">
          <p className="text-xs text-yellow-500">
            🔍 Debug: No brands found. userBrands.length = {userBrands.length}
          </p>
        </div>
      )}

      {/* Loading state for brands */}
      {isLoadingBrands && (
        <div className="flex items-center justify-center p-4">
          <div className="text-sm text-muted-foreground">Loading your brands...</div>
        </div>
      )}


      </div>
    </TooltipProvider>
  );
};