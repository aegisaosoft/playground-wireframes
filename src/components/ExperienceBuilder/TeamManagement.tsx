import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users, Plus, X, UserCheck, Shield, Info } from 'lucide-react';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'co-host' | 'admin';
  avatar?: string;
}

interface TeamManagementProps {
  teamMembers: TeamMember[];
  onAddMember: (member: Omit<TeamMember, 'id'>) => void;
  onRemoveMember: (id: string) => void;
  onUpdateMemberRole: (id: string, role: 'co-host' | 'admin') => void;
}

export const TeamManagement: React.FC<TeamManagementProps> = ({
  teamMembers,
  onAddMember,
  onRemoveMember,
  onUpdateMemberRole,
}) => {
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'co-host' | 'admin'>('co-host');
  const [emailError, setEmailError] = useState('');
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddMember = () => {
    const email = newMemberEmail.trim();
    
    if (!email) {
      setEmailError('Enter a valid email');
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError('Enter a valid email');
      return;
    }

    onAddMember({
      name: email.split('@')[0], // Mock name from email
      email,
      role: newMemberRole,
    });

    // Show success toast
    toast({
      title: `Invite sent to ${email} as ${newMemberRole === 'co-host' ? 'Co-Host' : 'Admin'}`,
      duration: 3000,
    });

    // Reset form
    setNewMemberEmail('');
    setNewMemberRole('co-host');
    setEmailError('');
    setIsAddingMember(false);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMemberEmail(e.target.value);
    if (emailError) setEmailError('');
  };

  const handleCancel = () => {
    setIsAddingMember(false);
    setNewMemberEmail('');
    setNewMemberRole('co-host');
    setEmailError('');
  };

  const isFormValid = newMemberEmail.trim() && validateEmail(newMemberEmail.trim()) && newMemberRole;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-4 h-4 text-neon-purple" />
        <h3 className="font-medium text-foreground">Admins & Co-hosts</h3>
      </div>

      {/* Team List */}
      {teamMembers.length > 0 && (
        <div className="space-y-2">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="p-3 bg-white/5 border border-white/10 rounded-lg flex items-center gap-3 overflow-hidden"
            >
              {/* Avatar */}
              <div className="w-8 h-8 bg-gradient-to-br from-neon-purple to-neon-pink rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium text-white">
                  {member.name.charAt(0).toUpperCase()}
                </span>
              </div>
              
              {/* Member Info */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate" title={member.name}>
                  {member.name}
                </div>
                <div className="text-xs text-muted-foreground truncate" title={member.email}>
                  {member.email}
                </div>
              </div>
              
              {/* Role Badge */}
              <Badge 
                variant={member.role === 'admin' ? 'secondary' : 'default'}
                className={`flex items-center gap-1 text-xs px-2 py-1 flex-shrink-0 ${
                  member.role === 'admin' 
                    ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20' 
                    : 'bg-green-400/10 text-green-400 border-green-400/20'
                }`}
              >
                {member.role === 'admin' ? (
                  <Shield className="w-3 h-3" />
                ) : (
                  <UserCheck className="w-3 h-3" />
                )}
                {member.role === 'admin' ? 'Admin' : 'Co-Host'}
              </Badge>

              {/* Role Selector */}
              <Select
                value={member.role}
                onValueChange={(value: 'co-host' | 'admin') => onUpdateMemberRole(member.id, value)}
              >
                <SelectTrigger className="w-20 h-8 text-xs bg-white/5 border-white/20 flex-shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-50 bg-background border-white/20">
                  <SelectItem value="co-host" className="text-sm">
                    Co-Host
                  </SelectItem>
                  <SelectItem value="admin" className="text-sm">
                    Admin
                  </SelectItem>
                </SelectContent>
              </Select>
              
              {/* Remove Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveMember(member.id)}
                className="w-8 h-8 p-0 text-muted-foreground hover:text-red-400 flex-shrink-0"
                aria-label={`Remove ${member.name}`}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Invite Card */}
      {isAddingMember ? (
        <div className="p-5 bg-white/5 border border-white/10 rounded-lg space-y-4 overflow-hidden">
          {/* Row 1: Email Input */}
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Enter email address"
              value={newMemberEmail}
              onChange={handleEmailChange}
              className={`h-12 text-base bg-white/5 border-white/20 text-foreground placeholder:text-muted-foreground ${
                emailError ? 'border-red-400' : ''
              }`}
              aria-label="Email address"
            />
            <div className="flex items-start justify-between min-h-[1rem]">
              <p className="text-xs text-neutral-400">
                We'll email an invite. Must accept to gain access.
              </p>
              {emailError && (
                <p className="text-xs text-red-400 whitespace-nowrap">{emailError}</p>
              )}
            </div>
          </div>

          {/* Row 2: Role Selector + Info + Actions */}
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Select 
                value={newMemberRole} 
                onValueChange={(value: 'co-host' | 'admin') => setNewMemberRole(value)}
              >
                <SelectTrigger 
                  className="h-12 bg-white/5 border-white/20 text-base min-w-0 flex-1"
                  aria-label="Select role"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-50 bg-background border-white/20">
                  <SelectItem value="co-host" className="text-sm">
                    Co-Host
                  </SelectItem>
                  <SelectItem value="admin" className="text-sm">
                    Admin
                  </SelectItem>
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-6 h-6 p-0 text-muted-foreground hover:text-foreground flex-shrink-0"
                    aria-label="Role information"
                  >
                    <Info className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-80 max-w-[320px] p-4 bg-background border-white/20 overflow-hidden"
                  role="dialog"
                  aria-label="Role explanations"
                >
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <h4 className="font-medium text-sm">Co-Host</h4>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Full editing + guest management. Shown as co-host on the experience page. No payout control.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                        <h4 className="font-medium text-sm">Admin</h4>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Editing + guest management. Not shown publicly. No payment/payout control.
                      </p>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1 sm:flex-none bg-white/5 border-white/20 text-foreground hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddMember}
                disabled={!isFormValid}
                className="flex-1 sm:flex-none bg-gradient-to-r from-pink-500 to-teal-500 hover:from-pink-600 hover:to-teal-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Invite
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setIsAddingMember(true)}
          variant="outline"
          size="sm"
          className="w-full bg-white/5 border-white/10 text-foreground hover:bg-white/10 flex items-center gap-2"
        >
          <Plus className="w-3 h-3" />
          Add Team Member
        </Button>
      )}

      {/* Empty State */}
      {teamMembers.length === 0 && !isAddingMember && (
        <div className="p-4 bg-white/5 border border-white/10 rounded-lg text-center">
          <div className="text-sm text-muted-foreground">
            No co-hosts or admins yet.
          </div>
        </div>
      )}
    </div>
  );
};