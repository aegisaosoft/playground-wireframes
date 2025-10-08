import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { PaymentsCard } from '@/components/PaymentsCard';
import { HostSelector, HostData } from './HostSelector';
import { TeamManagement, TeamMember } from './TeamManagement';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SettingsSidebarProps {
  selectedHost: HostData;
  onHostChange: (host: HostData) => void;
  teamMembers: TeamMember[];
  onAddTeamMember: (member: Omit<TeamMember, 'id'>) => void;
  onRemoveTeamMember: (id: string) => void;
  onUpdateTeamMemberRole: (id: string, role: 'co-host' | 'admin') => void;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  selectedHost,
  onHostChange,
  teamMembers,
  onAddTeamMember,
  onRemoveTeamMember,
  onUpdateTeamMemberRole,
}) => {
  const [tipsOpen, setTipsOpen] = useState(false);

  return (
    <div className="w-72 bg-black/20 border-l border-white/10 p-6 space-y-6">
      {/* Team & Permissions - Merged Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          Team & Permissions
        </h3>
        
        <HostSelector 
          selectedHost={selectedHost}
          onHostChange={onHostChange}
        />
        
        <TeamManagement
          teamMembers={teamMembers}
          onAddMember={onAddTeamMember}
          onRemoveMember={onRemoveTeamMember}
          onUpdateMemberRole={onUpdateTeamMemberRole}
        />
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Payments Section */}
      <div>
        <PaymentsCard variant="sidebar" />
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Collapsible Tips Section */}
      <Collapsible open={tipsOpen} onOpenChange={setTipsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between text-sm font-medium text-muted-foreground hover:text-foreground p-0"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-neon-yellow" />
              <span>Building Tips</span>
            </div>
            {tipsOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-4 space-y-3">
          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <h4 className="text-sm font-medium text-foreground mb-1">📸 Great Photos</h4>
            <p className="text-xs text-muted-foreground">
              Use high-quality images that showcase the experience location and vibe.
            </p>
          </div>

          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <h4 className="text-sm font-medium text-foreground mb-1">📅 Clear Schedule</h4>
            <p className="text-xs text-muted-foreground">
              Break down daily agendas so guests know what to expect each day.
            </p>
          </div>

          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <h4 className="text-sm font-medium text-foreground mb-1">💰 Smart Pricing</h4>
            <p className="text-xs text-muted-foreground">
              Offer early bird discounts and limit quantities to create urgency.
            </p>
          </div>

          <div className="p-3 bg-white/5 rounded-lg border border-white/10">
            <h4 className="text-sm font-medium text-foreground mb-1">❓ Answer Questions</h4>
            <p className="text-xs text-muted-foreground">
              Use FAQ to address common concerns about food, accommodation, etc.
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
