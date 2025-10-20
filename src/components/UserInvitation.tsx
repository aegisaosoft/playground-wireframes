import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, UserPlus, Mail, Users, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usersService, UserSearchResult, BrandMember } from '@/services/users.service';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isInvited?: boolean;
}

interface UserInvitationProps {
  brandId?: string;
  brandName?: string;
}

export const UserInvitation: React.FC<UserInvitationProps> = ({ brandId, brandName }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [brandMembers, setBrandMembers] = useState<BrandMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // Search users using real API
  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await usersService.searchUsers(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Failed to search users:', error);
      toast({
        title: "Search Error",
        description: "Failed to search users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Load existing brand members
  useEffect(() => {
    const loadBrandMembers = async () => {
      if (!brandId) return;
      
      setIsLoadingMembers(true);
      try {
        const members = await usersService.getBrandMembers(brandId);
        setBrandMembers(members);
      } catch (error) {
        console.error('Failed to load brand members:', error);
        toast({
          title: "Error",
          description: "Failed to load team members",
          variant: "destructive",
        });
      } finally {
        setIsLoadingMembers(false);
      }
    };

    loadBrandMembers();
  }, [brandId, toast]);

  // Handle search input with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleAddUserToBrand = async (user: User) => {
    if (!brandId) {
      toast({
        title: "Error",
        description: "Brand ID is required to add team members.",
        variant: "destructive",
      });
      return;
    }

    setIsInviting(true);
    try {
      // Add user directly to brand members
      await usersService.addUserToBrand({
        userId: user.id,
        brandId: brandId,
        role: 'member'
      });
      
      // Refresh brand members list
      const updatedMembers = await usersService.getBrandMembers(brandId);
      setBrandMembers(updatedMembers);
      
      // Remove from search results
      setSearchResults(prev => prev.filter(u => u.id !== user.id));
      
      toast({
        title: "Team Member Added",
        description: `${user.name} has been added to your brand team`,
      });
    } catch (error) {
      console.error('Failed to add user to brand:', error);
      toast({
        title: "Failed to Add Member",
        description: "Failed to add user to brand team. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveUserFromBrand = async (userId: string, userName: string) => {
    if (!brandId) {
      toast({
        title: "Error",
        description: "Brand ID is required to remove team members.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Remove user from brand members
      await usersService.removeUserFromBrand(brandId, userId);
      
      // Refresh brand members list
      const updatedMembers = await usersService.getBrandMembers(brandId);
      setBrandMembers(updatedMembers);
      
      toast({
        title: "Team Member Removed",
        description: `${userName} has been removed from your brand team`,
      });
    } catch (error) {
      console.error('Failed to remove user from brand:', error);
      toast({
        title: "Failed to Remove Member",
        description: "Failed to remove user from brand team. Please try again.",
        variant: "destructive",
      });
    }
  };


  return (
    <Card className="bg-white/5 border-white/10 rounded-2xl">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Users className="w-5 h-5 text-neon-cyan" />
          Team Members
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Team Members List */}
        {isLoadingMembers ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-neon-cyan" />
            <span className="ml-2 text-muted-foreground">Loading team members...</span>
          </div>
        ) : brandMembers.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground text-sm">Team Members</h4>
            <div className="space-y-2">
              {brandMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-white/3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={member.userAvatar} />
                      <AvatarFallback className="bg-neon-cyan/20 text-neon-cyan text-xs">
                        {member.userName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground text-sm">{member.userName}</p>
                      <p className="text-muted-foreground text-xs">{member.userEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                      <Users className="w-3 h-3 mr-1" />
                      {member.role}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveUserFromBrand(member.userId, member.userName)}
                      className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground text-sm">No team members yet</p>
          </div>
        )}

        {/* Invite New Users */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/10"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Team Members
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-background border-white/20">
            <DialogHeader>
              <DialogTitle className="text-foreground">Add Team Members</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/20 text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* Search Results */}
              {isSearching && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-neon-cyan" />
                  <span className="ml-2 text-muted-foreground">Searching...</span>
                </div>
              )}

              {!isSearching && searchResults.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {searchResults.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-white/3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-neon-cyan/20 text-neon-cyan text-xs">
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground text-sm">{user.name}</p>
                          <p className="text-muted-foreground text-xs">{user.email}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddUserToBrand(user)}
                        disabled={isInviting}
                        className="bg-neon-cyan text-background hover:bg-neon-cyan/90"
                      >
                        {isInviting ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <UserPlus className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {!isSearching && searchQuery && searchResults.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No users found matching "{searchQuery}"</p>
                </div>
              )}

              {!searchQuery && (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">Start typing to search for users</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Info Text */}
        <p className="text-xs text-muted-foreground">
          Add team members to collaborate on your brand and experiences. They'll be added directly to your team.
        </p>
      </CardContent>
    </Card>
  );
};
