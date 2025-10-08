import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Globe, Lock, Link2, Lightbulb, ChevronDown } from 'lucide-react';
import { PaymentsCard } from '@/components/PaymentsCard';
import { HostSelector, HostData } from './HostSelector';
import { TeamManagement, TeamMember } from './TeamManagement';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SettingsSidebarProps {
  isPublic: boolean;
  onToggleVisibility: (isPublic: boolean) => void;
  selectedHost: HostData;
  onHostChange: (host: HostData) => void;
  teamMembers: TeamMember[];
  onAddTeamMember: (member: Omit<TeamMember, 'id'>) => void;
  onRemoveTeamMember: (id: string) => void;
  onUpdateTeamMemberRole: (id: string, role: 'co-host' | 'admin') => void;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  isPublic,
  onToggleVisibility,
  selectedHost,
  onHostChange,
  teamMembers,
  onAddTeamMember,
  onRemoveTeamMember,
  onUpdateTeamMemberRole,
}) => {
  const [isTipsOpen, setIsTipsOpen] = useState(true);

  return (
    <div className="w-80 bg-black/20 border-l border-white/10 p-6">
      <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
        <div className="w-2 h-2 bg-neon-yellow rounded-full animate-pulse" />
        Settings & Tips
      </h2>

      {/* Host Selection */}
      <div className="mb-8">
        <HostSelector 
          selectedHost={selectedHost}
          onHostChange={onHostChange}
        />
      </div>

      {/* Team Management */}
      <div className="mb-8">
        <TeamManagement
          teamMembers={teamMembers}
          onAddMember={onAddTeamMember}
          onRemoveMember={onRemoveTeamMember}
          onUpdateMemberRole={onUpdateTeamMemberRole}
        />
      </div>

      {/* Visibility Toggle */}
      <div className="space-y-4 mb-8">
        <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {isPublic ? (
                <Globe className="w-4 h-4 text-neon-green" />
              ) : (
                <Lock className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="font-medium text-foreground">
                {isPublic ? 'Public' : 'Private'}
              </span>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={onToggleVisibility}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {isPublic 
              ? 'Anyone can discover and view this experience'
              : 'Only you and people you share the link with can see this experience'
            }
          </p>
        </div>

        {isPublic && (
          <div className="p-4 bg-neon-green/10 border border-neon-green/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Link2 className="w-4 h-4 text-neon-green" />
              <span className="font-medium text-neon-green text-sm">Share Link</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-white/5 border-white/10 text-foreground hover:bg-white/10 text-xs"
            >
              Copy Public Link
            </Button>
          </div>
        )}

        {!isPublic && (
          <div className="p-4 bg-neon-cyan/10 border border-neon-cyan/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Link2 className="w-4 h-4 text-neon-cyan" />
              <span className="font-medium text-neon-cyan text-sm">Private Link</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-white/5 border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/10 text-xs"
              onClick={() => {
                const privateSlug = `private-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                const privateUrl = `${window.location.origin}/experience/private/${privateSlug}`;
                navigator.clipboard.writeText(privateUrl);
              }}
            >
              Copy Private Link
            </Button>
          </div>
        )}
      </div>

      {/* Payments Section */}
      <div className="mb-8">
        <PaymentsCard variant="sidebar" />
      </div>

      {/* Tips Section */}
      <Collapsible open={isTipsOpen} onOpenChange={setIsTipsOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center gap-2 mb-4 cursor-pointer hover:opacity-80 transition-opacity">
            <Lightbulb className="w-4 h-4 text-neon-yellow" />
            <h3 className="font-medium text-foreground">Building Tips</h3>
            <ChevronDown 
              className={`w-4 h-4 text-muted-foreground ml-auto transition-transform ${
                isTipsOpen ? 'rotate-180' : ''
              }`} 
            />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-3">
          <div className="p-3 bg-gradient-dark rounded-lg border border-white/10">
            <h4 className="text-sm font-medium text-foreground mb-1">
              📸 Great Photos
            </h4>
            <p className="text-xs text-muted-foreground">
              Use high-quality images that showcase the experience location and vibe.
            </p>
          </div>

          <div className="p-3 bg-gradient-dark rounded-lg border border-white/10">
            <h4 className="text-sm font-medium text-foreground mb-1">
              📅 Clear Schedule
            </h4>
            <p className="text-xs text-muted-foreground">
              Break down daily agendas so guests know what to expect each day.
            </p>
          </div>

          <div className="p-3 bg-gradient-dark rounded-lg border border-white/10">
            <h4 className="text-sm font-medium text-foreground mb-1">
              💰 Smart Pricing
            </h4>
            <p className="text-xs text-muted-foreground">
              Offer early bird discounts and limit quantities to create urgency.
            </p>
          </div>

          <div className="p-3 bg-gradient-dark rounded-lg border border-white/10">
            <h4 className="text-sm font-medium text-foreground mb-1">
              ❓ Answer Questions
            </h4>
            <p className="text-xs text-muted-foreground">
              Use FAQ to address common concerns about food, accommodation, etc.
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};