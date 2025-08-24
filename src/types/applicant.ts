export interface ApplicationAnswer {
  question: string;
  answer: string;
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
}

export interface RetreatWithApplicants {
  id: number;
  title: string;
  location: string;
  date: string;
  image: string;
  applicants: Applicant[];
}