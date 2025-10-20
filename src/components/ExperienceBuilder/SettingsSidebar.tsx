import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Globe, Lock, Link2 } from 'lucide-react';
import { HostSelector, HostData } from './HostSelector';
import { useUser } from '@/contexts/UserContext';


interface SettingsSidebarProps {
  isPublic: boolean;
  onToggleVisibility: (isPublic: boolean) => void;
  selectedHost: HostData;
  onHostChange: (host: HostData) => void;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  isPublic,
  onToggleVisibility,
  selectedHost,
  onHostChange,
}) => {
  const { isAuthenticated } = useUser();
  

  return (
    <div className="w-80 bg-black/20 border-l border-white/10 p-6">
      <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
        <div className="w-2 h-2 bg-neon-yellow rounded-full animate-pulse" />
        Settings
      </h2>

      {/* Host Selection */}
      <div className="mb-8">
        <HostSelector 
          selectedHost={selectedHost}
          onHostChange={onHostChange}
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

    </div>
  );
};