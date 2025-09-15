export interface VoiceRecording {
  audioBlob: Blob;
  duration: number;
  timestamp: Date;
}

export interface VoiceTranscript {
  text: string;
  confidence?: number;
  timestamp: Date;
}

export interface ExtractedProfileData {
  bio: string;
  interests: string[];
  skills: string[];
  preferredLocations: string[];
  experienceTypes: string[];
  availabilityWindow?: {
    startDate?: Date;
    endDate?: Date;
  };
}

export interface VoiceOnboardingState {
  step: 'intro' | 'recording' | 'processing' | 'review' | 'save';
  recording?: VoiceRecording;
  transcript?: VoiceTranscript;
  extractedData?: ExtractedProfileData;
  saveTranscript: boolean;
}

export type AudioRecordingState = 'idle' | 'recording' | 'paused' | 'stopped' | 'processing';