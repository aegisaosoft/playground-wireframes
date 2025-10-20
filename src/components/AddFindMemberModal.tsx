import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { brandsService, BrandMemberDto } from '@/services/brands.service';
import { userService, UserSearchResult } from '@/services/user.service';
import { UserPlus, Loader2, Search, Users, X } from 'lucide-react';

interface AddFindMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandId: string;
  brandName: string;
  onMemberAdded: () => void;
}

export const AddFindMemberModal: React.FC<AddFindMemberModalProps> = ({
  isOpen,
  onClose,
  brandId,
  brandName,
  onMemberAdded
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [role, setRole] = useState('member');
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  // Debounced search effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      await performSearch(searchQuery.trim());
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const results = await userService.searchUsers(query);
      setSearchResults(results);
      setHasSearched(true);
    } catch (error: any) {
      console.error('Failed to search users:', error);
      toast({
        title: "Search Error",
        description: error.message || "Failed to search users. Please try again.",
        variant: "destructive",
      });
      setSearchResults([]);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserSelect = (user: UserSearchResult) => {
    setSelectedUser(user);
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
  };

  const handleRemoveSelectedUser = () => {
    setSelectedUser(null);
  };

  const handleSubmit = async () => {
    if (!selectedUser) {
      toast({
        title: "Error",
        description: "Please select a user to add.",
        variant: "destructive",
      });
      return;
    }

    setIsAdding(true);
    try {
      // Add user to brand using the selected user's ID
      await brandsService.addMemberToBrand(brandId, selectedUser.id, role);
      
      toast({
        title: "Success",
        description: `${selectedUser.name} has been added as a ${role} to ${brandName}.`,
      });
      
      setSelectedUser(null);
      setRole('member');
      setSearchQuery('');
      setSearchResults([]);
      setHasSearched(false);
      onClose();
      onMemberAdded?.();
    } catch (error: any) {
      console.error('Failed to add member:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    if (!isAdding) {
      setSelectedUser(null);
      setRole('member');
      setSearchQuery('');
      setSearchResults([]);
      setHasSearched(false);
      onClose();
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-background text-foreground border-white/10 rounded-2xl flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-neon-cyan flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Add Member to {brandName}
          </DialogTitle>
          <DialogDescription>
            Search for users by name or email to add them to your brand team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1">
          {/* Search Section */}
          <div className="space-y-2">
            <Label htmlFor="search" className="text-muted-foreground">
              Search Users
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-foreground focus:ring-neon-cyan focus:border-neon-cyan"
                placeholder="Search by name or email..."
                disabled={!!selectedUser || isAdding}
                autoFocus
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-neon-cyan" />
              )}
            </div>
          </div>

          {/* Selected User Display */}
          {selectedUser && (
            <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={selectedUser.avatarUrl} alt={selectedUser.name} />
                    <AvatarFallback className="bg-neon-cyan/20 text-neon-cyan text-xs">
                      {getInitials(selectedUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground text-sm">{selectedUser.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveSelectedUser}
                  disabled={isAdding}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Search Results */}
          {!selectedUser && (
            <div className="flex-1 min-h-[200px] max-h-[300px]">
              {!hasSearched && !searchQuery.trim() ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Start typing to search for users</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Search by name or email address
                  </p>
                </div>
              ) : !hasSearched && searchQuery.trim() ? (
                <div className="flex items-center justify-center h-full py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-neon-cyan" />
                  <span className="ml-3 text-muted-foreground">Searching...</span>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No users found</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try searching with a different name or email
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-full">
                  <div className="space-y-2">
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/8 transition-colors cursor-pointer"
                        onClick={() => handleUserSelect(user)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.avatarUrl} alt={user.name} />
                            <AvatarFallback className="bg-neon-cyan/20 text-neon-cyan text-xs">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground text-sm">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-neon-green text-background hover:bg-neon-green/90"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUserSelect(user);
                          }}
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Select
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          )}

          {/* Role Selection */}
          {selectedUser && (
            <div className="space-y-2">
              <Label htmlFor="role" className="text-muted-foreground">
                Role
              </Label>
              <Select value={role} onValueChange={setRole} disabled={true}>
                <SelectTrigger id="role" className="bg-white/5 border-white/10 text-foreground focus:ring-neon-cyan focus:border-neon-cyan">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent className="bg-background border-white/10 text-foreground">
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose} 
            disabled={isAdding}
            className="border-white/20 text-foreground hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit} 
            disabled={isAdding || !selectedUser}
            className="bg-neon-green text-background hover:bg-neon-green/90"
          >
            {isAdding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Member
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
