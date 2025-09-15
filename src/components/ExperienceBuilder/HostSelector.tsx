import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { User, Plus, Upload, X, Building2, Info, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export interface HostData {
  type: 'personal' | 'brand';
  name: string;
  avatar?: string;
  brandId?: string;
}

interface HostSelectorProps {
  selectedHost: HostData;
  onHostChange: (host: HostData) => void;
}

export const HostSelector: React.FC<HostSelectorProps> = ({
  selectedHost,
  onHostChange,
}) => {
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [brandName, setBrandName] = useState('');
  const [brandLogo, setBrandLogo] = useState<string | null>(null);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  
  // Authentication state
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBrandLogo(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateBrand = () => {
    if (!brandName.trim()) return;

    const newBrand: HostData = {
      type: 'brand',
      name: brandName,
      avatar: brandLogo || undefined,
      brandId: `brand-${Date.now()}` // Simple ID generation for demo
    };

    onHostChange(newBrand);
    setShowBrandForm(false);
    setBrandName('');
    setBrandLogo(null);
  };

  const handleSelectPersonal = () => {
    if (!user) return;
    
    const personalHost: HostData = {
      type: 'personal',
      name: user.name,
    };
    
    onHostChange(personalHost);
    setShowBrandForm(false);
  };

  const handleCancelBrandForm = () => {
    setShowBrandForm(false);
    setBrandName('');
    setBrandLogo(null);
  };

  if (!user) {
    return (
      <TooltipProvider>
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-neon-cyan" />
            <h3 className="font-medium text-foreground">Authentication Required</h3>
          </div>

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

                  <Button
                    type="submit"
                    className="w-full bg-gradient-neon text-background hover:opacity-90 font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Please wait...' : (authMode === 'login' ? 'Sign In' : 'Create Account')}
                  </Button>
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

      {/* Brand Option */}
      {selectedHost.type === 'brand' && !showBrandForm ? (
        <Card className="bg-neon-purple/10 border-neon-purple/40 ring-1 ring-neon-purple/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={selectedHost.avatar} alt={selectedHost.name} />
                <AvatarFallback className="bg-neon-purple/20 text-neon-purple text-sm">
                  {selectedHost.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">{selectedHost.name}</p>
                <p className="text-xs text-muted-foreground">Brand profile</p>
              </div>
              <div className="w-2 h-2 bg-neon-purple rounded-full" />
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Create Brand Button or Form */}
      {!showBrandForm && selectedHost.type !== 'brand' ? (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowBrandForm(true)}
            className="flex-1 border-white/20 text-foreground hover:bg-white/10 justify-start"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create a Host Brand
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                type="button"
                className="flex items-center justify-center p-2 hover:bg-white/10 rounded transition-colors"
              >
                <Info className="w-3 h-3 text-muted-foreground hover:text-foreground cursor-help" />
              </button>
            </TooltipTrigger>
            <TooltipContent 
              side="top"
              className="bg-[#111] text-white border border-white/20 rounded-lg px-3 py-2 shadow-lg max-w-xs"
            >
              <p className="text-xs">Create a business profile for professional hosting</p>
            </TooltipContent>
          </Tooltip>
        </div>
      ) : null}

      {/* Brand Creation Form */}
      {showBrandForm && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-neon-purple" />
              <p className="font-medium text-foreground text-sm">Create Host Brand</p>
            </div>

            {/* Brand Name */}
            <div className="space-y-2">
              <Label htmlFor="brand-name" className="text-xs text-foreground">Brand Name *</Label>
              <Input
                id="brand-name"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Zen Wellness Co."
                className="bg-white/5 border-white/20 text-foreground text-sm h-9"
              />
            </div>

            {/* Brand Logo */}
            <div className="space-y-2">
              <Label className="text-xs text-foreground">Brand Logo</Label>
              <div className="border-2 border-dashed border-white/20 rounded-lg p-3">
                {brandLogo ? (
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={brandLogo} alt="Brand logo" />
                      <AvatarFallback className="text-xs">
                        {brandName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-foreground">Logo uploaded</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setBrandLogo(null)}
                      className="h-8 w-8 p-0 hover:bg-white/10"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      <span className="text-neon-purple hover:underline text-xs">
                        Upload logo
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
                      PNG, JPG up to 5MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="ghost" 
                size="sm"
                onClick={handleCancelBrandForm}
                className="flex-1 text-muted-foreground hover:text-foreground hover:bg-white/10 h-8 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCreateBrand}
                disabled={!brandName.trim()}
                className="flex-1 bg-gradient-neon text-background hover:opacity-90 h-8 text-xs font-medium"
              >
                Create Brand
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      </div>
    </TooltipProvider>
  );
};