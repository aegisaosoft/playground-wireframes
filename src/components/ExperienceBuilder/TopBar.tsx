import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Eye, Mic } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { VoiceExperienceModal } from '@/components/VoiceExperienceCreation';
import { VoiceExperienceDraft } from '@/types/voiceExperienceCreation';

interface TopBarProps {
  onSaveDraft: () => void;
  onPublish: () => void;
  onVoicePrefill?: (draft: VoiceExperienceDraft) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onSaveDraft,
  onPublish,
  onVoicePrefill,
}) => {
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  const handleVoicePrefill = (draft: VoiceExperienceDraft) => {
    onVoicePrefill?.(draft);
    setShowVoiceModal(false);
  };

  return (
    <>
      <div className="h-16 bg-black/40 border-b border-white/10 flex items-center justify-between px-6 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <BrandLogo />
          <Button
            variant="outline"
            onClick={() => setShowVoiceModal(true)}
            className="bg-white/5 border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/10"
          >
            <Mic className="w-4 h-4 mr-2" />
            Create with Voice
          </Button>
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

      <VoiceExperienceModal 
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onPrefillBuilder={handleVoicePrefill}
      />
    </>
  );
};