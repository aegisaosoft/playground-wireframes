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
    <div className="w-80 bg-background border-l border-border p-6 overflow-y-auto">
      <h2 className="text-sm font-semibold text-foreground mb-6">
        Settings
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
      <div className="space-y-3 mb-8">
        <div className="p-4 bg-accent/50 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {isPublic ? (
                <Globe className="w-4 h-4" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
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
              : 'Only people with the link can see this'
            }
          </p>
        </div>

        {isPublic && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Link2 className="w-4 h-4 mr-2" />
            Copy Public Link
          </Button>
        )}

        {!isPublic && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              const privateSlug = `private-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
              const privateUrl = `${window.location.origin}/experience/private/${privateSlug}`;
              navigator.clipboard.writeText(privateUrl);
            }}
          >
            <Link2 className="w-4 h-4 mr-2" />
            Copy Private Link
          </Button>
        )}
      </div>

      {/* Payments Section */}
      <div className="mb-8">
        <PaymentsCard variant="sidebar" />
      </div>

      {/* Tips Section */}
      <Collapsible open={isTipsOpen} onOpenChange={setIsTipsOpen}>
        <CollapsibleTrigger className="w-full mb-3">
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity">
            <Lightbulb className="w-4 h-4" />
            <h3 className="text-sm font-medium">Building Tips</h3>
            <ChevronDown 
              className={`w-4 h-4 ml-auto transition-transform ${
                isTipsOpen ? 'rotate-180' : ''
              }`} 
            />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-2">
          <div className="p-3 rounded-lg border border-border">
            <h4 className="text-sm font-medium mb-1">
              📸 Great Photos
            </h4>
            <p className="text-xs text-muted-foreground">
              Use high-quality images that showcase the experience location and vibe.
            </p>
          </div>

          <div className="p-3 rounded-lg border border-border">
            <h4 className="text-sm font-medium mb-1">
              📅 Clear Schedule
            </h4>
            <p className="text-xs text-muted-foreground">
              Break down daily agendas so guests know what to expect each day.
            </p>
          </div>

          <div className="p-3 rounded-lg border border-border">
            <h4 className="text-sm font-medium mb-1">
              💰 Smart Pricing
            </h4>
            <p className="text-xs text-muted-foreground">
              Offer early bird discounts and limit quantities to create urgency.
            </p>
          </div>

          <div className="p-3 rounded-lg border border-border">
            <h4 className="text-sm font-medium mb-1">
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