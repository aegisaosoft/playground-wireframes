import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, Type, Send, SkipForward } from 'lucide-react';
import { FollowupQuestion } from '@/types/voiceExperienceCreation';

interface VoiceExperienceFollowupProps {
  question: FollowupQuestion;
  onComplete: (answer: string) => void;
  onSkip: () => void;
  progress: {
    current: number;
    total: number;
  };
}

export const VoiceExperienceFollowup: React.FC<VoiceExperienceFollowupProps> = ({
  question,
  onComplete,
  onSkip,
  progress
}) => {
  const [answer, setAnswer] = useState('');
  const [mode, setMode] = useState<'voice' | 'text'>('voice');

  const handleSubmit = () => {
    if (answer.trim()) {
      onComplete(answer.trim());
      setAnswer('');
    }
  };

  const handleVoiceAnswer = () => {
    // Mock voice answer for now
    const mockAnswers: { [key: string]: string } = {
      ticketTiers: "Actually, let's do Early Bird for €750 with 12 spots, and Standard for €850 with 18 spots. That gives us 30 total capacity.",
      dates: "The exact dates are October 15th to October 22nd, 2024.",
      location: "It's in Lisbon, Portugal - specifically in the Príncipe Real area.",
      capacity: "We're targeting 30 total participants."
    };
    
    const mockAnswer = mockAnswers[question.field] || "Here's the additional information you requested.";
    onComplete(mockAnswer);
  };

  return (
    <div className="space-y-6 p-8 max-w-2xl mx-auto">
      {/* Progress */}
      <div className="text-center">
        <Badge variant="secondary" className="bg-white/10 text-muted-foreground">
          Question {progress.current} of {progress.total}
        </Badge>
      </div>

      {/* Question */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="pt-6 text-center">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-gradient-neon rounded-full flex items-center justify-center mx-auto">
              <Type className="w-6 h-6 text-background" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">
              Need more details
            </h3>
            <p className="text-muted-foreground text-lg">
              {question.question}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Mode Selection */}
      <div className="flex gap-2 justify-center">
        <Button
          variant={mode === 'voice' ? 'default' : 'outline'}
          onClick={() => setMode('voice')}
          className={mode === 'voice' ? 'bg-gradient-neon text-background' : 'border-white/20'}
        >
          <Mic className="w-4 h-4 mr-2" />
          Voice
        </Button>
        <Button
          variant={mode === 'text' ? 'default' : 'outline'}
          onClick={() => setMode('text')}
          className={mode === 'text' ? 'bg-gradient-neon text-background' : 'border-white/20'}
        >
          <Type className="w-4 h-4 mr-2" />
          Type
        </Button>
      </div>

      {/* Answer Input */}
      {mode === 'text' ? (
        <div className="space-y-4">
          <Input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="bg-white/5 border-white/10 text-lg p-4"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <div className="flex gap-3 justify-center">
            <Button
              onClick={handleSubmit}
              disabled={!answer.trim()}
              className="bg-gradient-neon text-background hover:opacity-90"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Answer
            </Button>
            <Button onClick={onSkip} variant="outline" className="border-white/20">
              <SkipForward className="w-4 h-4 mr-2" />
              Skip
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-neon rounded-full flex items-center justify-center mx-auto animate-pulse cursor-pointer" onClick={handleVoiceAnswer}>
            <Mic className="w-8 h-8 text-background" />
          </div>
          <p className="text-muted-foreground text-sm">
            Click the microphone to record your answer
          </p>
          <Button onClick={onSkip} variant="outline" className="border-white/20">
            <SkipForward className="w-4 h-4 mr-2" />
            Skip this question
          </Button>
        </div>
      )}
    </div>
  );
};