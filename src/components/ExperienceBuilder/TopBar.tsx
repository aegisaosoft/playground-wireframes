import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Save, Eye, ArrowLeft, Globe, Lock, Link2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TopBarProps {
  onSaveDraft: () => void;
  onPublish: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
  isPublic?: boolean;
  onToggleVisibility?: (isPublic: boolean) => void;
  experienceSlug?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  onSaveDraft,
  onPublish,
  showBackButton,
  onBack,
  isPublic = false,
  onToggleVisibility,
  experienceSlug,
}) => {
  const { toast } = useToast();

  const handleCopyLink = () => {
    const url = experienceSlug 
      ? `${window.location.origin}/experience/${experienceSlug}`
      : window.location.href;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied!",
      description: isPublic ? "Public link copied to clipboard" : "Private link copied to clipboard",
    });
  };

  return (
    <div className="h-16 bg-black/40 border-b border-white/10 flex items-center justify-between px-6 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        {showBackButton && onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Visibility Toggle */}
        {onToggleVisibility && (
          <div className="flex items-center gap-3 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              {isPublic ? (
                <Globe className="w-4 h-4 text-neon-green" />
              ) : (
                <Lock className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-foreground font-medium">
                {isPublic ? 'Public' : 'Private'}
              </span>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={onToggleVisibility}
            />
          </div>
        )}

        {/* Share Link Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          className="bg-white/5 border-white/10 text-foreground hover:bg-white/10"
        >
          <Link2 className="w-4 h-4 mr-2" />
          Copy Link
        </Button>

        <Button
          variant="outline"
          onClick={onSaveDraft}
          className="bg-white/5 border-white/10 text-foreground hover:bg-white/10"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Draft
        </Button>
        <Button
          onClick={onPublish}
          className="bg-gradient-neon text-black font-semibold hover:opacity-90 shadow-neon"
        >
          <Eye className="w-4 h-4 mr-2" />
          Publish
        </Button>
      </div>
    </div>
  );
};