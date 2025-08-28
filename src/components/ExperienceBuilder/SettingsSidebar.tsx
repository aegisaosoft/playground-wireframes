import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Globe, Lock, Link2, Lightbulb } from 'lucide-react';

interface SettingsSidebarProps {
  isPublic: boolean;
  onToggleVisibility: (isPublic: boolean) => void;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  isPublic,
  onToggleVisibility,
}) => {
  return (
    <div className="w-80 bg-black/20 border-l border-white/10 p-6">
      <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
        <div className="w-2 h-2 bg-neon-yellow rounded-full animate-pulse" />
        Settings & Tips
      </h2>

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
              : 'Only you can see this experience'
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
              Copy Link
            </Button>
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-4 h-4 text-neon-yellow" />
          <h3 className="font-medium text-foreground">Building Tips</h3>
        </div>

        <div className="space-y-3">
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
        </div>
      </div>
    </div>
  );
};