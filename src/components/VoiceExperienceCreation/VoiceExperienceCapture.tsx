import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, Square, Play, Pause, ArrowLeft, AlertCircle, Volume2, FileText, Link as LinkIcon, Upload, X } from 'lucide-react';
import { AudioRecordingState } from '@/types/voiceOnboarding';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';

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
  const [transcript, setTranscript] = useState('');
  const [showTranscriptEditor, setShowTranscriptEditor] = useState(false);
  const [accumulatedRecordings, setAccumulatedRecordings] = useState<any[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; file: File }>>([]);
  const [pastedLinks, setPastedLinks] = useState<string[]>([]);
  const [linkInputValue, setLinkInputValue] = useState('');
  const [inputMode, setInputMode] = useState<'voice' | 'file' | 'link'>('voice');
  const [isDragging, setIsDragging] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  
  // Use real voice recognition
  const {
    isListening: isVoiceRecognitionActive,
    transcript: liveTranscript,
    startListening: startVoiceRecognition,
    stopListening: stopVoiceRecognition,
    resetTranscript: resetVoiceTranscript,
    isSupported: isVoiceSupported,
    error: voiceError
  } = useVoiceRecognition({ continuous: true, interimResults: true });

  useEffect(() => {
    checkMicrophonePermission();
    return () => {
      cleanup();
    };
  }, []);

  // Show voice recognition errors
  useEffect(() => {
    if (voiceError && isVoiceRecognitionActive) {
      toast({
        title: "Voice Recognition Issue",
        description: voiceError,
        variant: "destructive",
      });
    }
  }, [voiceError, isVoiceRecognitionActive, toast]);

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
      setError('Microphone access is required to record. You can still use file upload or link options.');
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
        
        // Use real transcript from voice recognition (with fallback to mock for demo)
        const capturedTranscript = liveTranscript || "I want to create a 7-day hacker house experience in Lisbon, Portugal from October 15th to 22nd. It's for developers, entrepreneurs, and remote workers who want to collaborate on projects. The vibe should be innovative and social. Day 1 we'll have a welcome dinner at 6pm and networking until 8pm. Day 2 starts with morning standup at 9am, then focus work sessions, ending with demo presentations at 6pm. For pricing, early bird tickets are 799 euros for 10 spots, and standard tickets are 899 euros for 15 spots. This should be a public experience with the call-to-action 'Join the House'.";
        
        stream.getTracks().forEach(track => track.stop());
        
        // Add to accumulated recordings
        setAccumulatedRecordings(prev => [...prev, { audioBlob, duration, timestamp: new Date() }]);
        
        // Append transcript and show editor
        setTranscript(prev => prev ? `${prev}\n\n${capturedTranscript}` : capturedTranscript);
        setShowTranscriptEditor(true);
        setInputMode('voice');
        
        // Stop voice recognition
        stopVoiceRecognition();
        
        console.log('🎤 Voice recognition captured:', liveTranscript ? 'REAL TRANSCRIPT' : 'FALLBACK TO MOCK');
      };

      mediaRecorderRef.current.start();
      setRecordingState('recording');
      startTimer();
      startAudioAnalysis();
      
      // Start voice recognition
      resetVoiceTranscript();
      startVoiceRecognition();
      console.log('🎤 Starting voice recognition...');
      
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
      setRecordingState('idle');
      setDuration(0);
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const handleRecordMore = () => {
    setShowTranscriptEditor(false);
    startRecording();
  };

  const handleContinue = () => {
    onComplete(
      { 
        recordings: accumulatedRecordings,
        uploadedFiles,
        pastedLinks,
        timestamp: new Date() 
      }, 
      transcript
    );
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

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf', 'image/webp'];
    
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload images (PNG, JPG, WEBP) or PDF files.",
        variant: "destructive"
      });
      return;
    }

    setUploadedFiles(prev => [...prev, { name: file.name, file }]);
    toast({
      title: "File added",
      description: `${file.name} will be included in your experience generation.`,
    });
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleLinkAdd = () => {
    if (!linkInputValue.trim()) {
      toast({
        title: "Link required",
        description: "Please enter a valid URL.",
        variant: "destructive"
      });
      return;
    }

    setPastedLinks(prev => [...prev, linkInputValue]);
    setLinkInputValue('');
    toast({
      title: "Link added",
      description: "Link will be included in your experience generation.",
    });
  };

  const removePastedLink = (index: number) => {
    setPastedLinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  return (
    <div className="space-y-8 p-6">
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold text-foreground">Describe Your Experience</h2>
        <p className="text-sm text-muted-foreground">Record up to 5 minutes about your experience</p>
        
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-left max-w-2xl mx-auto">
          <p className="text-xs text-muted-foreground/70 italic">
            Try saying something like: <span className="text-muted-foreground">"7-day hacker house in Lisbon, October 15–22 for developers and entrepreneurs. Early bird at €799, standard at €899, public experience with welcome dinner, daily standups, and demo day."</span>
          </p>
        </div>
      </div>

      {/* Transcript Editor (shown after recording) */}
      {showTranscriptEditor && transcript && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Your Experience Description</label>
              <p className="text-xs text-muted-foreground">Edit the transcription or add more details</p>
            </div>
            <Textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="min-h-[200px] bg-white/5 border-white/20 text-foreground resize-none"
              placeholder="Transcription will appear here..."
            />

            {/* Upload & Link Section */}
            <div className="space-y-4 pt-2">
              <div className="flex gap-3">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="flex-1 border-white/20 hover:bg-white/10 hover:border-white/30"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </Button>
                <Button
                  onClick={() => {
                    const input = prompt("Paste a link to your content (Notion, website, etc.):");
                    if (input) {
                      setLinkInputValue(input);
                      handleLinkAdd();
                    }
                  }}
                  variant="outline"
                  className="flex-1 border-white/20 hover:bg-white/10 hover:border-white/30"
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Paste Link
                </Button>
              </div>

              {/* Uploaded Files Chips */}
              {uploadedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {uploadedFiles.map((file, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-white/10 text-foreground border-white/20 pr-1 flex items-center gap-2"
                    >
                      <FileText className="w-3 h-3" />
                      <span className="text-xs">{file.name}</span>
                      <button
                        onClick={() => removeUploadedFile(index)}
                        className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Pasted Links Chips */}
              {pastedLinks.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {pastedLinks.map((link, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-white/10 text-foreground border-white/20 pr-1 flex items-center gap-2 max-w-xs"
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span className="text-xs truncate">{link}</span>
                      <button
                        onClick={() => removePastedLink(index)}
                        className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button
                onClick={handleRecordMore}
                variant="outline"
                className="border-white/20 hover:bg-white/10 hover:border-white/30"
              >
                <Mic className="w-4 h-4 mr-2" />
                Record More
              </Button>
              <Button
                onClick={handleContinue}
                className="bg-gradient-neon text-background hover:opacity-90 shadow-neon"
              >
                Generate Experience
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Voice Recording Section */}
      {inputMode === 'voice' && !showTranscriptEditor && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-8 text-center space-y-6">
            <div className="relative">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto transition-all duration-200 ${
                recordingState === 'recording' 
                  ? 'bg-red-500/20 border-2 border-red-500 animate-pulse shadow-[0_0_40px_rgba(239,68,68,0.4)]' 
                  : 'bg-gradient-neon shadow-neon'
              }`}>
                <Mic className={`w-16 h-16 ${recordingState === 'recording' ? 'text-red-400' : 'text-background'}`} />
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

            <div className="text-3xl font-mono text-foreground font-bold">
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

            <div className="flex gap-4 justify-center">
              {recordingState === 'idle' && (
                <Button 
                  onClick={startRecording}
                  disabled={!hasPermission}
                  className="bg-gradient-neon text-background hover:opacity-90 shadow-neon px-8 h-12"
                >
                  <Mic className="w-5 h-5 mr-2" />
                  Start Recording
                </Button>
              )}

              {recordingState === 'recording' && (
                <>
                  <Button onClick={pauseRecording} variant="outline" className="border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10">
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                  <Button onClick={stopRecording} variant="outline" className="border-red-500/40 text-red-400 hover:bg-red-500/10">
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
                  <Button onClick={stopRecording} variant="outline" className="border-red-500/40 text-red-400 hover:bg-red-500/10">
                    <Square className="w-4 h-4 mr-2" />
                    Stop & Continue
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Upload Section - Only when explicitly in file mode and not editing transcript */}
      {inputMode === 'file' && !showTranscriptEditor && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-8">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${
                isDragging 
                  ? 'border-primary bg-primary/10 shadow-neon' 
                  : 'border-white/20 hover:border-white/40 hover:bg-white/5'
              }`}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-foreground font-medium mb-2">Drop files here or click to browse</p>
              <p className="text-sm text-muted-foreground">
                Supports: Screenshots, PDFs, Photos (PNG, JPG, WEBP)
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Link Input Section - Only when explicitly in link mode and not editing transcript */}
      {inputMode === 'link' && !showTranscriptEditor && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-8 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <LinkIcon className="w-6 h-6 text-primary" />
              <div>
                <p className="text-foreground font-medium">Paste a link</p>
                <p className="text-sm text-muted-foreground">Notion doc, event page, or website</p>
              </div>
            </div>
            <Input
              type="url"
              placeholder="https://notion.so/your-event-page"
              value={linkInputValue}
              onChange={(e) => setLinkInputValue(e.target.value)}
              className="bg-white/5 border-white/20"
            />
            <Button 
              onClick={handleLinkAdd}
              className="w-full bg-gradient-neon text-background hover:opacity-90 shadow-neon"
            >
              Add Link
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Input Mode Options - Only show if not in transcript editor mode */}
      {!showTranscriptEditor && (
        <div className="flex gap-4 justify-center pt-4">
        <Button
          variant={inputMode === 'file' ? 'default' : 'outline'}
          onClick={() => setInputMode('file')}
          className={`transition-all ${inputMode === 'file' ? 'bg-gradient-neon text-background shadow-neon' : 'border-white/20 hover:bg-white/10 hover:border-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]'}`}
        >
          <FileText className="w-4 h-4 mr-2" />
          Upload Files
        </Button>
        <Button
          variant={inputMode === 'link' ? 'default' : 'outline'}
          onClick={() => setInputMode('link')}
          className={`transition-all ${inputMode === 'link' ? 'bg-gradient-neon text-background shadow-neon' : 'border-white/20 hover:bg-white/10 hover:border-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]'}`}
        >
          <LinkIcon className="w-4 h-4 mr-2" />
          Paste Link
        </Button>
        </div>
      )}
    </div>
  );
};
