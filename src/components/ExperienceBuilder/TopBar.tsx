import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Eye, ArrowLeft } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';

interface TopBarProps {
  onSaveDraft: () => void;
  onPublish: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onSaveDraft,
  onPublish,
  showBackButton,
  onBack,
}) => {
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

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={onSaveDraft}
          className="bg-white/5 border-white/10 text-foreground hover:bg-white/10 hover:border-white/20"
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