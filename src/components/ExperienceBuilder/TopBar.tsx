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
    <div className="h-14 bg-background border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        {showBackButton && onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onSaveDraft}
        >
          <Save className="w-4 h-4 mr-2" />
          Save Draft
        </Button>
        <Button
          size="sm"
          onClick={onPublish}
        >
          <Eye className="w-4 h-4 mr-2" />
          Publish
        </Button>
      </div>
    </div>
  );
};