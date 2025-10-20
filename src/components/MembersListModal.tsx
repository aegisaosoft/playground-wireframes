import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useNotification } from '@/contexts/NotificationContext';
import { brandsService, BrandMemberDto } from '@/services/brands.service';
import { Users, X, Loader2, Trash2 } from 'lucide-react';

interface MembersListModalProps {
  isOpen: boolean;
  onClose: () => void;
  brandId: string;
  brandName: string;
}

export const MembersListModal: React.FC<MembersListModalProps> = ({ 
  isOpen, 
  onClose, 
  brandId, 
  brandName 
}) => {
  const [members, setMembers] = useState<BrandMemberDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const { toast } = useToast();
  const { showConfirm, showSuccess, showError } = useNotification();

  useEffect(() => {
    if (isOpen && brandId) {
      loadMembers();
    }
  }, [isOpen, brandId]);

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const membersList = await brandsService.getBrandMembers(brandId);
      setMembers(membersList);
    } catch (error: any) {
      console.error('Failed to load members:', error);
      toast({
        title: "Error",
        description: "Failed to load members. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string, userName: string) => {
    showConfirm(
      'Remove Member',
      `Are you sure you want to remove ${userName} from this brand?`,
      async () => {
        setRemovingMemberId(userId);
        try {
          await brandsService.removeMemberFromBrand(brandId, userId);
          showSuccess(
            'Member Removed',
            `${userName} has been removed from the brand.`
          );
          // Reload members list
          await loadMembers();
        } catch (error: any) {
          console.error('Failed to remove member:', error);
          showError(
            'Failed to Remove Member',
            error.message || "Failed to remove member. Please try again."
          );
        } finally {
          setRemovingMemberId(null);
        }
      }
    );
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return 'default';
      case 'admin':
        return 'secondary';
      case 'editor':
        return 'outline';
      case 'member':
      default:
        return 'outline';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return 'text-yellow-400';
      case 'admin':
        return 'text-red-400';
      case 'editor':
        return 'text-blue-400';
      case 'member':
      default:
        return 'text-gray-400';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-background text-foreground border-white/10 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-neon-cyan flex items-center gap-2">
            <Users className="w-5 h-5" />
            Members of {brandName}
          </DialogTitle>
          <DialogDescription>
            View and manage all members of this brand
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[500px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-neon-cyan" />
              <span className="ml-2 text-muted-foreground">Loading members...</span>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No members found for this brand.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.Id || member.id}
                  className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/8 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={member.UserAvatar || member.userAvatar} alt={member.UserName || member.userName || 'User'} />
                      <AvatarFallback className="bg-neon-purple/20 text-neon-purple text-sm">
                        {(member.UserName || member.userName || 'User').split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{member.UserName || member.userName || 'Unknown User'}</p>
                        <Badge 
                          variant={getRoleBadgeVariant(member.Role || member.role)}
                          className={`text-xs ${getRoleColor(member.Role || member.role)}`}
                        >
                          {member.Role || member.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{member.UserEmail || member.userEmail}</p>
                      <p className="text-xs text-muted-foreground">
                        Joined: {new Date(member.CreatedAt || member.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMember(member.UserId || member.userId, member.UserName || member.userName || 'User')}
                    disabled={removingMemberId === (member.UserId || member.userId)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    {removingMemberId === (member.UserId || member.userId) ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-white/10">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-white/20 text-foreground hover:bg-white/10"
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
