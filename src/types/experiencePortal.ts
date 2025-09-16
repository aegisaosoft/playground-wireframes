export interface ExperiencePortalUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  role: 'organizer' | 'co-host' | 'attendee';
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: Date;
  mentions?: string[];
  reactions?: { emoji: string; users: string[] }[];
  isPinned?: boolean;
  threadId?: string;
  isSystemMessage?: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  isPinned: boolean;
  isRead: boolean;
}

export interface LogisticsInfo {
  address?: string;
  meetupInstructions?: string;
  checkInNotes?: string;
  emergencyContact?: {
    name: string;
    phone: string;
  };
  additionalInfo?: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  url: string;
  description?: string;
  type: 'link' | 'file';
  addedBy: string;
  addedAt: Date;
}

export interface ExperiencePortalData {
  experienceId: string;
  title: string;
  location: string;
  dates: string;
  image: string;
  description: string;
  highlights: string[];
  organizer: ExperiencePortalUser;
  attendees: ExperiencePortalUser[];
  userRole: 'organizer' | 'co-host' | 'attendee' | 'pending';
  isApproved: boolean;
  agenda?: Array<{
    day: string;
    items: Array<{
      time: string;
      activity: string;
      description?: string;
      location?: string;
    }>;
  }>;
  ticketTier?: {
    name: string;
    price: number;
  };
  visibility: 'public' | 'private';
  logistics?: LogisticsInfo;
}