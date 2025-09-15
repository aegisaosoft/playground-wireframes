import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, FileText, X, Sparkles } from 'lucide-react';
import { VoiceCapture } from './VoiceCapture';
import { VoiceReview } from './VoiceReview';
import { VoiceOnboardingState, ExtractedProfileData } from '@/types/voiceOnboarding';
import { useToast } from '@/hooks/use-toast';

interface VoiceOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (profileData: ExtractedProfileData) => void;
  isFirstSignIn?: boolean;
}

export const VoiceOnboardingModal: React.FC<VoiceOnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  isFirstSignIn = false
}) => {
  const [state, setState] = useState<VoiceOnboardingState>({
    step: 'intro',
    saveTranscript: false
  });
  const { toast } = useToast();

  const handleStartVoiceSetup = () => {
    setState(prev => ({ ...prev, step: 'recording' }));
  };

  const handleUseTextInstead = () => {
    toast({
      title: "Redirecting to text form",
      description: "You can complete your profile using the text form in My Account.",
    });
    onClose();
  };

  const handleRecordingComplete = (recording: any, transcript: any) => {
    setState(prev => ({
      ...prev,
      step: 'processing',
      recording,
      transcript
    }));

    // Simulate processing and extraction
    setTimeout(() => {
      const mockExtractedData: ExtractedProfileData = {
        bio: transcript.text.slice(0, 200) + "...",
        interests: ["AI", "Travel", "Wellness", "Technology"],
        skills: ["Product Design", "Marketing", "Leadership"],
        preferredLocations: ["Lisbon", "Bali", "Remote"],
        experienceTypes: ["Hacker Houses", "Wellness Retreats", "Skill Building"],
        availabilityWindow: {
          startDate: new Date(),
          endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
        }
      };

      setState(prev => ({
        ...prev,
        step: 'review',
        extractedData: mockExtractedData
      }));
    }, 2000);
  };

  const handleSaveProfile = (finalData: ExtractedProfileData, saveTranscript: boolean) => {
    // Update local storage with profile data
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      const updatedUser = {
        ...user,
        profile: {
          ...finalData,
          transcript: saveTranscript ? state.transcript?.text : undefined,
          onboardingCompleted: true
        }
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }

    onComplete?.(finalData);
    toast({
      title: "Profile saved!",
      description: "Your voice profile has been saved successfully.",
    });
    onClose();
  };

  const renderContent = () => {
    switch (state.step) {
      case 'intro':
        return (
          <div className="text-center space-y-6 p-6">
            <div className="w-20 h-20 bg-gradient-neon rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Sparkles className="w-10 h-10 text-background" />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-foreground">
                {isFirstSignIn ? "Welcome! Let's get to know you" : "Update your profile with voice"}
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                Tell us about yourself in your own voice. Share your interests, skills, and what kind of experiences you're looking for.
              </p>
            </div>

            <div className="grid gap-4 max-w-sm mx-auto">
              <Button 
                onClick={handleStartVoiceSetup}
                className="bg-gradient-neon text-background hover:opacity-90 shadow-neon flex items-center gap-2 h-12"
              >
                <Mic className="w-5 h-5" />
                Quick Setup (Voice) — Recommended
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleUseTextInstead}
                className="border-white/20 text-foreground hover:bg-white/5 h-12"
              >
                <FileText className="w-5 h-5 mr-2" />
                Type Instead
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Voice setup takes about 2 minutes and creates a more personalized experience
            </p>
          </div>
        );

      case 'recording':
        return (
          <VoiceCapture
            onComplete={handleRecordingComplete}
            onBack={() => setState(prev => ({ ...prev, step: 'intro' }))}
          />
        );

      case 'processing':
        return (
          <div className="text-center space-y-6 p-8">
            <div className="w-16 h-16 bg-gradient-neon rounded-full flex items-center justify-center mx-auto animate-spin">
              <Mic className="w-8 h-8 text-background" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">Processing your voice...</h3>
              <p className="text-muted-foreground">
                We're analyzing your recording and extracting key information about your interests and preferences.
              </p>
            </div>
          </div>
        );

      case 'review':
        if (!state.extractedData || !state.transcript) return null;
        return (
          <VoiceReview
            extractedData={state.extractedData}
            transcript={state.transcript}
            onSave={handleSaveProfile}
            onReRecord={() => setState(prev => ({ ...prev, step: 'recording' }))}
            onBack={() => setState(prev => ({ ...prev, step: 'intro' }))}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-lg border-white/10">
        {/* Close button */}
        {!isFirstSignIn && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
        
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};