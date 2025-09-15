import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, Square, Play, Pause, ArrowLeft, AlertCircle, Volume2 } from 'lucide-react';
import { AudioRecordingState } from '@/types/voiceOnboarding';
import { useToast } from '@/hooks/use-toast';

interface VoiceExperienceCaptureProps {
  onComplete: (recording: any, transcript: string) => void;
  onBack: () => void;
}

export const VoiceExperienceCapture: React.FC<VoiceExperienceCaptureProps> = ({ onComplete, onBack }) => {
  const [recordingState, setRecordingState] = useState<AudioRecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const { toast } = useToast();

  useEffect(() => {
    checkMicrophonePermission();
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current) audioContextRef.current.close();
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      setHasPermission(false);
      setError('Microphone access is required to create with voice. Please enable microphone permissions and try again.');
    }
  };

  const startRecording = async () => {
    if (!hasPermission) {
      await checkMicrophonePermission();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const mockTranscript = "I want to create a 7-day hacker house experience in Lisbon, Portugal from October 15th to 22nd. It's for developers, entrepreneurs, and remote workers who want to collaborate on projects. The vibe should be innovative and social. Day 1 we'll have a welcome dinner at 6pm and networking until 8pm. Day 2 starts with morning standup at 9am, then focus work sessions, ending with demo presentations at 6pm. For pricing, early bird tickets are 799 euros for 10 spots, and standard tickets are 899 euros for 15 spots. This should be a public experience with the call-to-action 'Join the House'.";
        
        stream.getTracks().forEach(track => track.stop());
        onComplete({ audioBlob, duration, timestamp: new Date() }, mockTranscript);
      };

      mediaRecorderRef.current.start();
      setRecordingState('recording');
      startTimer();
      startAudioAnalysis();
      
    } catch (err) {
      setError('Failed to start recording. Please try again.');
      setRecordingState('idle');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause();
      setRecordingState('paused');
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume();
      setRecordingState('recording');
      startTimer();
    }
  };

  const stopRecording = () => {
    if (duration < 5) {
      toast({
        title: "Recording too short",
        description: "Please record for at least 5 seconds to continue.",
        variant: "destructive"
      });
      return;
    }
    
    if (mediaRecorderRef.current?.state === 'recording' || mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.stop();
      setRecordingState('stopped');
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setDuration(prev => {
        if (prev >= 300) { // 5 minutes max
          stopRecording();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const startAudioAnalysis = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const analyze = () => {
      if (!analyserRef.current || recordingState !== 'recording') return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
      setAudioLevel(average / 255);
      
      animationFrameRef.current = requestAnimationFrame(analyze);
    };

    analyze();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (hasPermission === false) {
    return (
      <div className="text-center space-y-6 p-8">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-foreground">Microphone Access Required</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            To create your experience with voice, we need access to your microphone.
          </p>
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
        </div>
        <div className="flex gap-4 justify-center">
          <Button onClick={checkMicrophonePermission} className="bg-gradient-neon text-background">
            Enable Microphone
          </Button>
          <Button variant="outline" onClick={onBack}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Describe Your Experience</h2>
          <p className="text-sm text-muted-foreground">Record up to 5 minutes about your experience</p>
        </div>
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-8 text-center space-y-6">
          <div className="relative">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto transition-all duration-200 ${
              recordingState === 'recording' 
                ? 'bg-red-500/20 border-2 border-red-500 animate-pulse' 
                : 'bg-gradient-neon'
            }`}>
              <Mic className={`w-12 h-12 ${recordingState === 'recording' ? 'text-red-400' : 'text-background'}`} />
            </div>
            
            {recordingState === 'recording' && (
              <>
                <div 
                  className="absolute inset-0 rounded-full border-2 border-red-400/30 animate-ping"
                  style={{
                    transform: `scale(${1 + audioLevel * 0.5})`,
                  }}
                />
                <div 
                  className="absolute inset-0 rounded-full border border-red-400/20"
                  style={{
                    transform: `scale(${1.2 + audioLevel * 0.3})`,
                  }}
                />
              </>
            )}
          </div>

          <div className="text-2xl font-mono text-foreground">
            {formatTime(duration)} / 5:00
          </div>

          {recordingState === 'recording' && (
            <div className="flex items-center gap-2 justify-center">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
              <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-neon transition-all duration-100"
                  style={{ width: `${audioLevel * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            {recordingState === 'idle' && (
              <p className="text-muted-foreground">
                Ready to record. Describe your experience in detail.
              </p>
            )}
            {recordingState === 'recording' && (
              <p className="text-red-400 font-medium">
                Recording in progress...
              </p>
            )}
            {recordingState === 'paused' && (
              <p className="text-yellow-400 font-medium">
                Recording paused
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 justify-center">
        {recordingState === 'idle' && (
          <Button 
            onClick={startRecording}
            className="bg-gradient-neon text-background hover:opacity-90 shadow-neon px-8"
          >
            <Mic className="w-4 h-4 mr-2" />
            Start Recording
          </Button>
        )}

        {recordingState === 'recording' && (
          <>
            <Button onClick={pauseRecording} variant="outline" className="border-yellow-500/40 text-yellow-400">
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
            <Button onClick={stopRecording} variant="outline" className="border-red-500/40 text-red-400">
              <Square className="w-4 h-4 mr-2" />
              Stop & Continue
            </Button>
          </>
        )}

        {recordingState === 'paused' && (
          <>
            <Button onClick={resumeRecording} className="bg-gradient-neon text-background">
              <Play className="w-4 h-4 mr-2" />
              Resume
            </Button>
            <Button onClick={stopRecording} variant="outline" className="border-red-500/40 text-red-400">
              <Square className="w-4 h-4 mr-2" />
              Stop & Continue
            </Button>
          </>
        )}
      </div>
    </div>
  );
};