import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mic, X, Sparkles } from 'lucide-react';
import { VoiceExperienceCapture } from './VoiceExperienceCapture';
import { VoiceExperienceReview } from './VoiceExperienceReview';
import { VoiceExperienceFollowup } from './VoiceExperienceFollowup';
import { VoiceCreationState, ExtractedExperienceData, VoiceExperienceDraft } from '@/types/voiceExperienceCreation';
import { useToast } from '@/hooks/use-toast';

interface VoiceExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrefillBuilder?: (draft: VoiceExperienceDraft) => void;
}

export const VoiceExperienceModal: React.FC<VoiceExperienceModalProps> = ({
  isOpen,
  onClose,
  onPrefillBuilder
}) => {
  const [state, setState] = useState<VoiceCreationState>({
    step: 'intro',
    saveTranscript: false
  });
  const { toast } = useToast();

  const handleStartRecording = () => {
    setState(prev => ({ ...prev, step: 'recording' }));
  };

  const handleRecordingComplete = (recording: any, transcript: string) => {
    setState(prev => ({
      ...prev,
      step: 'transcribing',
      recording,
      transcript
    }));

    // Simulate transcription and AI parsing
    setTimeout(() => {
      setState(prev => ({ ...prev, step: 'parsing' }));
      
      setTimeout(() => {
        const mockExtractedData: ExtractedExperienceData = {
          title: "Hacker House Lisbon",
          location: {
            city: "Lisbon",
            country: "Portugal"
          },
          dates: {
            startDate: new Date('2024-10-15'),
            endDate: new Date('2024-10-22')
          },
          audience: ["developers", "entrepreneurs", "remote workers"],
          vibe: ["collaborative", "innovative", "social"],
          category: "Tech",
          agendaDays: [
            {
              day: 1,
              title: "Welcome & Setup",
              items: [
                { time: "18:00", activity: "Welcome dinner and introductions" },
                { time: "20:00", activity: "Networking and project pitches" }
              ]
            },
            {
              day: 2,
              title: "Build Day",
              items: [
                { time: "09:00", activity: "Morning standup and coffee" },
                { time: "10:00", activity: "Focus work sessions" },
                { time: "18:00", activity: "Demo day presentations" }
              ]
            }
          ],
          ticketTiers: [
            { name: "Early Bird", price: 799, quantity: 10 },
            { name: "Standard", price: 899, quantity: 15 }
          ],
          visibility: "public",
          ctaText: "Join the House",
          description: "A week-long collaborative experience for developers and entrepreneurs in Lisbon's vibrant tech scene.",
          confidence: {
            title: 'high',
            location: 'high',
            dates: 'medium',
            ticketTiers: 'low'
          }
        };

        // Generate follow-up questions for low confidence items
        const followupQuestions = Object.entries(mockExtractedData.confidence || {})
          .filter(([_, confidence]) => confidence === 'low')
          .map(([field]) => ({
            field,
            question: getFollowupQuestion(field),
            type: 'voice' as const,
            confidence: 'low' as const
          }));

        setState(prev => ({
          ...prev,
          step: followupQuestions.length > 0 ? 'followup' : 'review',
          extractedData: mockExtractedData,
          followupQuestions,
          currentFollowupIndex: 0
        }));
      }, 1500);
    }, 2000);
  };

  const getFollowupQuestion = (field: string): string => {
    const questions: { [key: string]: string } = {
      ticketTiers: "Could you clarify the ticket pricing and quantities?",
      dates: "What are the exact start and end dates?",
      location: "Which city and country will this take place in?",
      capacity: "How many participants are you expecting?"
    };
    return questions[field] || `Could you provide more details about ${field}?`;
  };

  const handleFollowupComplete = (answer: string) => {
    const currentIndex = state.currentFollowupIndex || 0;
    const hasMoreQuestions = currentIndex + 1 < (state.followupQuestions?.length || 0);
    
    if (hasMoreQuestions) {
      setState(prev => ({
        ...prev,
        currentFollowupIndex: currentIndex + 1
      }));
    } else {
      setState(prev => ({ ...prev, step: 'review' }));
    }
  };

  const handleCreateDraft = (finalData: ExtractedExperienceData, saveTranscript: boolean) => {
    // Convert extracted data to Builder format
    const draft: VoiceExperienceDraft = {
      title: finalData.title || '',
      location: {
        city: finalData.location?.city || '',
        country: finalData.location?.country || ''
      },
      dates: {
        startDate: finalData.dates?.startDate || null,
        endDate: finalData.dates?.endDate || null
      },
      audience: finalData.audience || [],
      vibe: finalData.vibe || [],
      category: finalData.category,
      agendaDays: finalData.agendaDays || [],
      ticketTiers: finalData.ticketTiers || [],
      visibility: finalData.visibility || 'public',
      ctaText: finalData.ctaText || 'Apply Now',
      capacity: finalData.ticketTiers?.reduce((sum, tier) => sum + tier.quantity, 0) || 0,
      images: finalData.images || [],
      description: finalData.description
    };

    onPrefillBuilder?.(draft);
    toast({
      title: "Experience created!",
      description: "Your voice-created experience has been loaded into the builder.",
    });
    onClose();
  };

  const renderContent = () => {
    switch (state.step) {
      case 'intro':
        return (
          <div className="text-center space-y-6 p-8">
            <div className="w-20 h-20 bg-gradient-neon rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Sparkles className="w-10 h-10 text-background" />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-foreground">
                Create Experience with Voice
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
                Describe your experience: name, city/country, dates, target audience, vibe, 
                daily agenda highlights, ticket tiers/prices, and visibility.
              </p>
            </div>

            <div className="bg-white/5 p-4 rounded-lg text-sm text-muted-foreground">
              <p className="font-medium mb-2">Try saying something like:</p>
              <p className="italic">
                "7-day hacker house in Lisbon, October 15-22. For developers and entrepreneurs. 
                Early bird €799, standard €899. Public experience with welcome dinner, daily standups, demo day."
              </p>
            </div>

            <Button 
              onClick={handleStartRecording}
              className="bg-gradient-neon text-background hover:opacity-90 shadow-neon flex items-center gap-2 h-12 px-8"
            >
              <Mic className="w-5 h-5" />
              Start Recording
            </Button>
          </div>
        );

      case 'recording':
        return (
          <VoiceExperienceCapture
            onComplete={handleRecordingComplete}
            onBack={() => setState(prev => ({ ...prev, step: 'intro' }))}
          />
        );

      case 'transcribing':
        return (
          <div className="text-center space-y-6 p-8">
            <div className="w-16 h-16 bg-gradient-neon rounded-full flex items-center justify-center mx-auto animate-spin">
              <Mic className="w-8 h-8 text-background" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">Transcribing your voice...</h3>
              <p className="text-muted-foreground">
                Converting your audio to text for processing.
              </p>
            </div>
          </div>
        );

      case 'parsing':
        return (
          <div className="text-center space-y-6 p-8">
            <div className="w-16 h-16 bg-gradient-neon rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Sparkles className="w-8 h-8 text-background" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">Extracting experience details...</h3>
              <p className="text-muted-foreground">
                AI is analyzing your description and organizing the information.
              </p>
            </div>
          </div>
        );

      case 'followup':
        if (!state.followupQuestions || !state.extractedData) return null;
        return (
          <VoiceExperienceFollowup
            question={state.followupQuestions[state.currentFollowupIndex || 0]}
            onComplete={handleFollowupComplete}
            onSkip={() => handleFollowupComplete('')}
            progress={{
              current: (state.currentFollowupIndex || 0) + 1,
              total: state.followupQuestions.length
            }}
          />
        );

      case 'review':
        if (!state.extractedData) return null;
        return (
          <VoiceExperienceReview
            extractedData={state.extractedData}
            transcript={state.transcript || ''}
            onCreateDraft={handleCreateDraft}
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
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-lg border-white/10">
        <DialogTitle className="sr-only">Create Experience with Voice</DialogTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </Button>
        
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};