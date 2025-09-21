import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, X, UserCheck, Shield } from 'lucide-react';

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

  const handleAddMember = () => {
    if (newMemberEmail.trim()) {
      onAddMember({
        name: newMemberEmail.split('@')[0], // Mock name from email
        email: newMemberEmail,
        role: newMemberRole,
      });
      setNewMemberEmail('');
      setNewMemberRole('co-host');
      setIsAddingMember(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-4 h-4 text-neon-purple" />
        <h3 className="font-medium text-foreground">Team & Co-hosts</h3>
      </div>

      {/* Current Team Members */}
      {teamMembers.length > 0 && (
        <div className="space-y-2">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="p-3 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-neon-purple to-neon-pink rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-white">
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">{member.name}</div>
                  <div className="text-xs text-muted-foreground">{member.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  {member.role === 'admin' ? (
                    <Shield className="w-3 h-3 text-neon-yellow" />
                  ) : (
                    <UserCheck className="w-3 h-3 text-neon-green" />
                  )}
                  <Select
                    value={member.role}
                    onValueChange={(value: 'co-host' | 'admin') => onUpdateMemberRole(member.id, value)}
                  >
                    <SelectTrigger className="w-20 h-6 text-xs bg-white/5 border-white/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="co-host">Co-Host</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveMember(member.id)}
                className="w-6 h-6 p-0 text-muted-foreground hover:text-red-400"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Member */}
      {isAddingMember ? (
        <div className="p-4 bg-neon-purple/10 border border-neon-purple/20 rounded-lg space-y-3">
          <Input
            placeholder="Enter email address"
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
            className="bg-white/5 border-white/20 text-foreground placeholder:text-muted-foreground"
          />
          <Select value={newMemberRole} onValueChange={(value: 'co-host' | 'admin') => setNewMemberRole(value)}>
            <SelectTrigger className="bg-white/5 border-white/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="co-host">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-3 h-3" />
                  <div>
                    <div className="text-sm">Co-Host</div>
                    <div className="text-xs text-muted-foreground">Can edit and manage applicants</div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="admin">
                <div className="flex items-center gap-2">
                  <Shield className="w-3 h-3" />
                  <div>
                    <div className="text-sm">Admin</div>
                    <div className="text-xs text-muted-foreground">Full control like organizer</div>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button
              onClick={handleAddMember}
              size="sm"
              className="flex-1 bg-neon-purple hover:bg-neon-purple/80 text-white"
            >
              Send Invite
            </Button>
            <Button
              onClick={() => {
                setIsAddingMember(false);
                setNewMemberEmail('');
                setNewMemberRole('co-host');
              }}
              variant="outline"
              size="sm"
              className="bg-white/5 border-white/20 text-foreground hover:bg-white/10"
            >
              Cancel
            </Button>
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

      {teamMembers.length === 0 && !isAddingMember && (
        <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-center">
          <div className="text-sm text-muted-foreground">
            No team members yet. Add co-hosts or admins to help manage this experience.
          </div>
        </div>
      )}
    </div>
  );
};