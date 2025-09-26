export interface ApplicationAnswer {
  question: string;
  answer: string;
}

export interface ApplicantProfile {
  profilePicture?: string;
  bio?: string;
  interests?: string[];
  skills?: string[];
  preferredLocations?: string[];
  experienceTypes?: string[];
  socialAccounts?: {
    linkedinUrl?: string;
    instagramUrl?: string;
    xUrl?: string;
  };
  voiceIntro?: {
    audioUrl: string;
    duration: number;
  };
  previousApplications?: number; // How many times they've applied before
}

export interface Applicant {
  id: string;
  name: string;
  email: string;
  retreatId: number;
  status: 'pending' | 'approved' | 'rejected';
  applicationAnswers: ApplicationAnswer[];
  appliedAt: string;
  processedAt?: string;
  profile?: ApplicantProfile;
  organizerNotes?: string; // Private notes from organizers
}

export interface RetreatWithApplicants {
  id: number;
  title: string;
  location: string;
  date: string;
  image: string;
  applicants: Applicant[];
}