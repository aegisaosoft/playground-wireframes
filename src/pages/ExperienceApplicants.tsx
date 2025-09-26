import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ApplicantManagement } from '@/components/ApplicantManagement';
import { RetreatWithApplicants, Applicant } from '@/types/applicant';
import { useToast } from '@/hooks/use-toast';

// Mock data for applicants - in real app, this would come from API
const mockApplicantsData: RetreatWithApplicants[] = [
  {
    id: 1,
    title: 'Creative Writing Workshop',
    location: 'Portland, USA',
    date: 'May 1-8, 2024',
    image: '/src/assets/retreat-portugal.jpg',
    applicants: [
      {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        retreatId: 1,
        status: 'pending',
        applicationAnswers: [
          { question: 'Why are you interested in this workshop?', answer: 'I\'ve been writing for 5 years and want to improve my craft. I\'m particularly interested in developing my character development skills and learning new narrative techniques.' },
          { question: 'What\'s your writing experience?', answer: 'I have published several short stories in literary magazines including "The Paris Review" and "Granta". I\'m currently working on my debut novel.' }
        ],
        appliedAt: '2024-03-15T10:30:00Z',
        profile: {
          profilePicture: '/src/assets/retreat-bali.jpg',
          bio: 'Passionate storyteller and emerging novelist with a love for literary fiction. I believe in the power of words to transform both writer and reader.',
          interests: ['Literary Fiction', 'Poetry', 'Narrative Theory', 'Character Development'],
          skills: ['Creative Writing', 'Editing', 'Workshop Facilitation', 'Literary Analysis'],
          preferredLocations: ['Portland', 'San Francisco', 'Europe'],
          experienceTypes: ['Writing Workshops', 'Literary Retreats', 'Author Talks'],
          socialAccounts: {
            linkedinUrl: 'https://linkedin.com/in/sarahjohnson',
            instagramUrl: 'https://instagram.com/sarahwriteswords',
            xUrl: 'https://x.com/sarahjwriter'
          },
          voiceIntro: {
            audioUrl: '/mock-audio.mp3',
            duration: 45
          },
          previousApplications: 0
        },
        organizerNotes: ''
      },
      {
        id: '2',
        name: 'Mike Chen',
        email: 'mike.chen@example.com',
        retreatId: 1,
        status: 'approved',
        applicationAnswers: [
          { question: 'Why are you interested in this workshop?', answer: 'I want to transition from technical writing to creative writing and explore storytelling techniques.' },
          { question: 'What\'s your writing experience?', answer: 'Mostly technical documentation for the past 8 years, but I have some personal creative projects and have completed several online writing courses.' }
        ],
        appliedAt: '2024-03-10T14:15:00Z',
        processedAt: '2024-03-12T09:00:00Z',
        profile: {
          bio: 'Technical writer by day, creative storyteller by night. Making the transition from APIs to narratives.',
          interests: ['Science Fiction', 'Technology', 'World Building', 'Character Arcs'],
          skills: ['Technical Writing', 'Research', 'Documentation', 'Project Management'],
          preferredLocations: ['Seattle', 'Portland', 'San Francisco'],
          experienceTypes: ['Writing Workshops', 'Online Courses', 'Writing Groups'],
          socialAccounts: {
            linkedinUrl: 'https://linkedin.com/in/mikechen',
            xUrl: 'https://x.com/mikechen_writes'
          },
          previousApplications: 1
        },
        organizerNotes: 'Strong technical background, eager to learn creative writing. Good candidate for mentorship.'
      },
      {
        id: '3',
        name: 'Emma Rodriguez',
        email: 'emma.r@example.com',
        retreatId: 1,
        status: 'rejected',
        applicationAnswers: [
          { question: 'Why are you interested in this workshop?', answer: 'I love writing and want to learn more.' },
          { question: 'What\'s your writing experience?', answer: 'I write in my journal sometimes and have written a few blog posts.' }
        ],
        appliedAt: '2024-03-20T16:45:00Z',
        processedAt: '2024-03-22T11:30:00Z',
        profile: {
          bio: 'Aspiring writer with a passion for personal storytelling and lifestyle content.',
          interests: ['Lifestyle Writing', 'Personal Essays', 'Travel Writing'],
          skills: ['Blogging', 'Social Media', 'Content Creation'],
          preferredLocations: ['Los Angeles', 'New York', 'Miami'],
          experienceTypes: ['Writing Workshops', 'Blogging Courses'],
          socialAccounts: {
            instagramUrl: 'https://instagram.com/emmawrites',
            xUrl: 'https://x.com/emma_rodriguez'
          },
          previousApplications: 0
        },
        organizerNotes: 'Application lacks depth and specific writing experience. Consider for future beginner-level workshops.'
      }
    ]
  },
  {
    id: 2,
    title: 'Photography Masterclass',
    location: 'San Francisco, USA',
    date: 'June 15-22, 2024',
    image: '/src/assets/retreat-bali.jpg',
    applicants: [
      {
        id: '4',
        name: 'David Kim',
        email: 'david.kim@example.com',
        retreatId: 2,
        status: 'pending',
        applicationAnswers: [
          { question: 'What\'s your photography experience?', answer: 'I\'ve been doing photography as a hobby for 3 years, focusing on street and portrait photography. I shoot with a Canon 5D Mark IV and have basic Lightroom skills.' },
          { question: 'What type of photography interests you most?', answer: 'Portrait and street photography. I\'m fascinated by capturing human emotion and candid moments in urban environments.' }
        ],
        appliedAt: '2024-03-25T12:00:00Z',
        profile: {
          profilePicture: '/src/assets/retreat-greece.jpg',
          bio: 'Urban photographer passionate about capturing the human condition through street and portrait photography.',
          interests: ['Street Photography', 'Portrait Photography', 'Urban Exploration', 'Photo Essays'],
          skills: ['Photography', 'Lightroom', 'Photo Editing', 'Composition'],
          preferredLocations: ['San Francisco', 'New York', 'Tokyo', 'Berlin'],
          experienceTypes: ['Photography Workshops', 'Photo Walks', 'Masterclasses'],
          socialAccounts: {
            instagramUrl: 'https://instagram.com/davidkimphotography',
            linkedinUrl: 'https://linkedin.com/in/davidkim-photographer'
          },
          voiceIntro: {
            audioUrl: '/mock-audio-david.mp3',
            duration: 38
          },
          previousApplications: 2
        },
        organizerNotes: ''
      }
    ]
  }
];

export default function ExperienceApplicants() {
  const { experienceId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [experienceData, setExperienceData] = useState<RetreatWithApplicants | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (experienceId) {
      // Find the experience data
      const experience = mockApplicantsData.find(exp => exp.id.toString() === experienceId);
      if (experience) {
        setExperienceData(experience);
      } else {
        toast({
          title: "Experience not found",
          description: "The experience you're looking for doesn't exist.",
          variant: "destructive",
        });
        navigate('/account?tab=hosting');
      }
    }
    setLoading(false);
  }, [experienceId, navigate, toast]);

  const handleUpdateApplicant = (applicantId: string, status: 'approved' | 'rejected') => {
    if (!experienceData) return;

    setExperienceData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        applicants: prev.applicants.map(applicant =>
          applicant.id === applicantId
            ? { ...applicant, status, processedAt: new Date().toISOString() }
            : applicant
        )
      };
    });
  };

  const handleAddApplicants = (retreatId: number, newApplicants: Omit<Applicant, 'id' | 'retreatId' | 'appliedAt'>[]) => {
    if (!experienceData) return;

    const applicantsWithIds = newApplicants.map((applicant, index) => ({
      ...applicant,
      id: `imported-${Date.now()}-${index}`,
      retreatId,
      appliedAt: new Date().toISOString()
    }));

    setExperienceData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        applicants: [...prev.applicants, ...applicantsWithIds]
      };
    });
  };

  const handleUpdateNotes = (applicantId: string, notes: string) => {
    if (!experienceData) return;

    setExperienceData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        applicants: prev.applicants.map(applicant =>
          applicant.id === applicantId
            ? { ...applicant, organizerNotes: notes }
            : applicant
        )
      };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b12] flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  if (!experienceData) {
    return (
      <div className="min-h-screen bg-[#0b0b12] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Experience Not Found</h1>
          <Button onClick={() => navigate('/account?tab=hosting')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hosting
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b12]">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/account?tab=hosting')}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Hosting
              </Button>
              <div className="h-6 w-px bg-white/20" />
              <h1 className="text-xl font-semibold text-foreground">
                Applicant Management
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ApplicantManagement
          retreat={experienceData}
          onUpdateApplicant={handleUpdateApplicant}
          onAddApplicants={handleAddApplicants}
          onUpdateNotes={handleUpdateNotes}
        />
      </div>
    </div>
  );
}