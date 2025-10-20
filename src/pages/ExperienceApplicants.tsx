import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { ApplicantManagement } from '@/components/ApplicantManagement';
import { RetreatWithApplicants, Applicant } from '@/types/applicant';
import { useToast } from '@/hooks/use-toast';
import { experiencesService } from '@/services/experiences.service';
import { applicationsService } from '@/services/applications.service';

export default function ExperienceApplicants() {
  const { experienceId, applicationId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [experienceData, setExperienceData] = useState<RetreatWithApplicants | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(applicationId || null);

  useEffect(() => {
    const loadExperienceData = async () => {
      if (!experienceId) {
        navigate('/account?tab=hosting');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('📥 Loading experience and applicants:', experienceId);
        
        // Fetch experience details from API
        const experience = await experiencesService.getById(experienceId);
        console.log('✅ Experience loaded:', experience);
        
        // Fetch applications for this experience
        const applications = await applicationsService.getExperienceApplications(experienceId);
        console.log('✅ Applications loaded:', applications);
        
        // Transform applications to match the component's expected format
        const transformedApplicants: Applicant[] = applications.map((app: any) => ({
          id: app.id,
          name: app.applicantName || app.userName || app.user?.name || 'Unknown User',
          email: app.applicantEmail || app.userEmail || app.user?.email || '',
          retreatId: parseInt(experienceId),
          status: app.status || 'pending',
          applicationAnswers: app.responses ? Object.entries(app.responses).map(([question, answer]) => ({
            question,
            answer: String(answer)
          })) : [],
          appliedAt: app.appliedAt || app.createdAt,
          processedAt: app.reviewedAt,
          profile: {
            profilePicture: app.userProfileImageUrl || app.user?.profileImageUrl,
            bio: app.userBio || app.user?.bio || '',
            interests: app.userInterests || [],
            skills: app.userSkills || [],
            preferredLocations: app.userPreferredLocations || [],
            experienceTypes: app.userExperienceTypes || [],
            socialAccounts: app.userSocialAccounts || {},
            voiceIntro: app.userVoiceIntro || null,
            previousApplications: app.userPreviousApplications || 0
          },
          organizerNotes: app.adminNotes || ''
        }));

        // Transform to RetreatWithApplicants format
        const retreatWithApplicants: RetreatWithApplicants = {
          id: parseInt(experienceId),
          title: experience.title,
          location: experience.location,
          date: experience.startDate ? new Date(experience.startDate).toLocaleDateString() : 'TBA',
          image: experience.featuredImageUrl || experience.image,
          applicants: transformedApplicants
        };

        setExperienceData(retreatWithApplicants);
        console.log('✅ Experience data transformed and set:', retreatWithApplicants);
        
      } catch (err) {
        console.error('❌ Failed to load experience data:', err);
        setError('Failed to load experience data');
        toast({
          title: "Error",
          description: "Failed to load experience applications. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadExperienceData();
  }, [experienceId, navigate, toast]);

  const handleApplicationStatusUpdate = async (applicantId: string, status: string, notes?: string) => {
    try {
      console.log('📝 Updating application status:', { applicantId, status, notes });
      
      await applicationsService.updateApplicationStatus(applicantId, {
        status,
        adminNotes: notes
      });

      // Refresh the data
      if (experienceId) {
        const applications = await applicationsService.getExperienceApplications(experienceId);
        const updatedApplicants = applications.map((app: any) => ({
          id: app.id,
          name: app.applicantName || app.userName || app.user?.name || 'Unknown User',
          email: app.applicantEmail || app.userEmail || app.user?.email || '',
          retreatId: parseInt(experienceId),
          status: app.status || 'pending',
          applicationAnswers: app.responses ? Object.entries(app.responses).map(([question, answer]) => ({
            question,
            answer: String(answer)
          })) : [],
          appliedAt: app.appliedAt || app.createdAt,
          processedAt: app.reviewedAt,
          profile: {
            profilePicture: app.userProfileImageUrl || app.user?.profileImageUrl,
            bio: app.userBio || app.user?.bio || '',
            interests: app.userInterests || [],
            skills: app.userSkills || [],
            preferredLocations: app.userPreferredLocations || [],
            experienceTypes: app.userExperienceTypes || [],
            socialAccounts: app.userSocialAccounts || {},
            voiceIntro: app.userVoiceIntro || null,
            previousApplications: app.userPreviousApplications || 0
          },
          organizerNotes: app.adminNotes || ''
        }));

        if (experienceData) {
          setExperienceData({
            ...experienceData,
            applicants: updatedApplicants
          });
        }
      }

      // Application status updated successfully

    } catch (err) {
      console.error('❌ Failed to update application status:', err);
      toast({
        title: "Error",
        description: "Failed to update application status. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-neon-cyan" />
          <p className="text-muted-foreground">Loading experience applications...</p>
        </div>
      </div>
    );
  }

  if (error || !experienceData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || 'Experience not found'}</p>
          <Button onClick={() => navigate('/account?tab=hosting')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigate('/account?tab=hosting')}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{experienceData.title}</h1>
              <p className="text-muted-foreground">
                {experienceData.location} • {experienceData.date}
              </p>
            </div>
          </div>
        </div>

        {/* Applications Management */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">
              Applications ({experienceData.applicants.length})
            </h2>
          </div>

          {experienceData.applicants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No applications received yet for this experience.
              </p>
            </div>
          ) : (
            <ApplicantManagement
              retreat={experienceData}
              onUpdateApplicant={handleApplicationStatusUpdate}
              onAddApplicants={() => {}}
              onUpdateNotes={() => {}}
              selectedApplicationId={selectedApplicationId}
            />
          )}
        </div>
      </div>
    </div>
  );
}