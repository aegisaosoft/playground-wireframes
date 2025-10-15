import React, { useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useToast } from '@/hooks/use-toast';

interface VoiceInputProps {
  onTranscriptChange?: (transcript: string) => void;
  onFinalTranscript?: (transcript: string) => void;
  language?: string;
  className?: string;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscriptChange,
  onFinalTranscript,
  language = 'en-US',
  className = ''
}) => {
  const { toast } = useToast();
  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
    error
  } = useVoiceRecognition({ language, continuous: true, interimResults: true });

  // Notify parent of transcript changes
  useEffect(() => {
    if (onTranscriptChange) {
      onTranscriptChange(transcript + interimTranscript);
    }
  }, [transcript, interimTranscript, onTranscriptChange]);

  // Notify parent of final transcript
  useEffect(() => {
    if (transcript && onFinalTranscript) {
      onFinalTranscript(transcript);
    }
  }, [transcript, onFinalTranscript]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast({
        title: "Voice Recognition Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Show browser not supported warning
  useEffect(() => {
    if (!isSupported) {
      toast({
        title: "Voice Recognition Not Supported",
        description: "Your browser doesn't support voice recognition. Please use Chrome, Edge, or Safari.",
        variant: "destructive",
      });
    }
  }, [isSupported, toast]);

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Voice Control Button */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleToggleListening}
          disabled={!isSupported}
          className={`relative ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-neon-cyan hover:bg-neon-cyan/80'
          }`}
          size="lg"
        >
          {isListening ? (
            <>
              <MicOff className="w-5 h-5 mr-2" />
              Stop Recording
            </>
          ) : (
            <>
              <Mic className="w-5 h-5 mr-2" />
              Start Voice Input
            </>
          )}
        </Button>

        {isListening && (
          <div className="flex items-center gap-2 text-sm text-red-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="font-medium">Listening...</span>
          </div>
        )}
      </div>

      {/* Live Transcript Display */}
      {(transcript || interimTranscript) && (
        <div className="bg-black/40 border border-white/10 rounded-lg p-4">
          <div className="text-sm font-medium text-neon-cyan mb-2">
            Voice Transcript:
          </div>
          <div className="text-gray-300 leading-relaxed">
            {transcript}
            {interimTranscript && (
              <span className="text-gray-500 italic">
                {interimTranscript}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      {!isListening && !transcript && (
        <div className="text-xs text-gray-500 text-center">
          Click the button above to start voice dictation. Speak clearly about your experience.
        </div>
      )}
    </div>
  );
};

