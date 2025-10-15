import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { VoiceInput } from '@/components/VoiceInput';
import { Sparkles, Send } from 'lucide-react';

interface VoiceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transcript: string) => void;
}

export const VoiceInputModal: React.FC<VoiceInputModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [fullTranscript, setFullTranscript] = useState('');

  const handleTranscriptChange = useCallback((transcript: string) => {
    setFullTranscript(transcript);
  }, []);

  const handleSubmit = () => {
    if (fullTranscript.trim()) {
      onSubmit(fullTranscript);
      setFullTranscript('');
      onClose();
    }
  };

  const handleClose = () => {
    setFullTranscript('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-gradient-dark border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="w-6 h-6 text-neon-purple" />
            Voice Input for Experience
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Speak naturally about your experience. Describe the title, location, dates, activities, 
            and what makes it special. Our AI will help organize the information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <VoiceInput
            onTranscriptChange={handleTranscriptChange}
            language="en-US"
          />

          {/* Example Prompts */}
          <div className="bg-neon-purple/10 border border-neon-purple/20 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-neon-purple mb-2">
              💡 Try saying something like:
            </h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• "I'm hosting a wellness retreat in Bali from March 15th to 22nd..."</li>
              <li>• "This is a tech conference in San Francisco next month..."</li>
              <li>• "A 7-day yoga and meditation experience in the mountains..."</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="border-white/10 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!fullTranscript.trim()}
              className="bg-neon-cyan hover:bg-neon-cyan/80"
            >
              <Send className="w-4 h-4 mr-2" />
              Process with AI
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

