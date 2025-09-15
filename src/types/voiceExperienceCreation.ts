export interface VoiceExperienceDraft {
  title: string;
  location: {
    city: string;
    country: string;
  };
  dates: {
    startDate: Date | null;
    endDate: Date | null;
  };
  audience?: string[];
  vibe?: string[];
  category?: string;
  agendaDays: AgendaDay[];
  ticketTiers: TicketTier[];
  visibility: 'public' | 'private';
  ctaText: string;
  capacity: number;
  images?: string[];
  description?: string;
}

export interface AgendaDay {
  day: number;
  title?: string;
  items: AgendaItem[];
}

export interface AgendaItem {
  time: string;
  activity: string;
}

export interface TicketTier {
  name: string;
  price: number; // 0 = application-only
  quantity: number;
  description?: string;
}

export interface ExtractedExperienceData {
  title?: string;
  location?: {
    city?: string;
    country?: string;
  };
  dates?: {
    startDate?: Date;
    endDate?: Date;
  };
  audience?: string[];
  vibe?: string[];
  category?: string;
  agendaDays?: AgendaDay[];
  ticketTiers?: TicketTier[];
  visibility?: 'public' | 'private';
  ctaText?: string;
  images?: string[];
  description?: string;
  confidence?: {
    [key: string]: 'high' | 'medium' | 'low';
  };
}

export interface VoiceCreationState {
  step: 'intro' | 'recording' | 'transcribing' | 'parsing' | 'review' | 'followup' | 'prefill';
  recording?: any;
  transcript?: string;
  extractedData?: ExtractedExperienceData;
  followupQuestions?: FollowupQuestion[];
  currentFollowupIndex?: number;
  saveTranscript: boolean;
}

export interface FollowupQuestion {
  field: string;
  question: string;
  type: 'voice' | 'text';
  confidence: 'low' | 'missing';
}