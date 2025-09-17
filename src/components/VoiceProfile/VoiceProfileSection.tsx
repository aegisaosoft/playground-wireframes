import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { TagInput } from '@/components/TagInput';
import { VoiceOnboardingModal } from '@/components/VoiceOnboarding';
import { Mic, Edit, RotateCcw, User, Save, X } from 'lucide-react';
import { ExtractedProfileData } from '@/types/voiceOnboarding';

interface VoiceProfileSectionProps {
  profileData?: ExtractedProfileData & { transcript?: string };
  onUpdateProfile?: (data: ExtractedProfileData) => void;
}

export const VoiceProfileSection: React.FC<VoiceProfileSectionProps> = ({
  profileData,
  onUpdateProfile
}) => {
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBio, setEditedBio] = useState('');
  
  // Edit states for each section
  const [isEditingInterests, setIsEditingInterests] = useState(false);
  const [editedInterests, setEditedInterests] = useState<string[]>([]);
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [editedSkills, setEditedSkills] = useState<string[]>([]);
  const [isEditingLocations, setIsEditingLocations] = useState(false);
  const [editedLocations, setEditedLocations] = useState<string[]>([]);
  const [isEditingExperiences, setIsEditingExperiences] = useState(false);
  const [editedExperiences, setEditedExperiences] = useState<string[]>([]);

  const handleVoiceComplete = (data: ExtractedProfileData) => {
    onUpdateProfile?.(data);
    setIsVoiceModalOpen(false);
  };

  const handleEditClick = () => {
    setEditedBio(profileData?.bio || '');
    setIsEditing(true);
  };

  const handleSave = () => {
    if (profileData) {
      const updatedData = {
        ...profileData,
        bio: editedBio
      };
      onUpdateProfile?.(updatedData);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedBio('');
    setIsEditing(false);
  };

  // Edit handlers for interests
  const handleEditInterests = () => {
    setEditedInterests(profileData?.interests || []);
    setIsEditingInterests(true);
  };

  const handleSaveInterests = () => {
    if (profileData) {
      const updatedData = { ...profileData, interests: editedInterests };
      onUpdateProfile?.(updatedData);
    }
    setIsEditingInterests(false);
  };

  const handleCancelInterests = () => {
    setEditedInterests([]);
    setIsEditingInterests(false);
  };

  // Edit handlers for skills
  const handleEditSkills = () => {
    setEditedSkills(profileData?.skills || []);
    setIsEditingSkills(true);
  };

  const handleSaveSkills = () => {
    if (profileData) {
      const updatedData = { ...profileData, skills: editedSkills };
      onUpdateProfile?.(updatedData);
    }
    setIsEditingSkills(false);
  };

  const handleCancelSkills = () => {
    setEditedSkills([]);
    setIsEditingSkills(false);
  };

  // Edit handlers for locations
  const handleEditLocations = () => {
    setEditedLocations(profileData?.preferredLocations || []);
    setIsEditingLocations(true);
  };

  const handleSaveLocations = () => {
    if (profileData) {
      const updatedData = { ...profileData, preferredLocations: editedLocations };
      onUpdateProfile?.(updatedData);
    }
    setIsEditingLocations(false);
  };

  const handleCancelLocations = () => {
    setEditedLocations([]);
    setIsEditingLocations(false);
  };

  // Edit handlers for experience types
  const handleEditExperiences = () => {
    setEditedExperiences(profileData?.experienceTypes || []);
    setIsEditingExperiences(true);
  };

  const handleSaveExperiences = () => {
    if (profileData) {
      const updatedData = { ...profileData, experienceTypes: editedExperiences };
      onUpdateProfile?.(updatedData);
    }
    setIsEditingExperiences(false);
  };

  const handleCancelExperiences = () => {
    setEditedExperiences([]);
    setIsEditingExperiences(false);
  };

  const hasProfileData = profileData && Object.keys(profileData).length > 0;

  if (!hasProfileData) {
    return (
      <>
        <Card className="bg-white/5 border-white/10 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <User className="w-5 h-5 text-neon-orange" />
              About You
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-neon rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className="w-8 h-8 text-background" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Tell us about yourself
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Use voice to quickly set up your profile with your interests, skills, and preferences.
              </p>
              <Button 
                onClick={() => setIsVoiceModalOpen(true)}
                className="bg-gradient-neon text-background hover:opacity-90 shadow-neon"
              >
                <Mic className="w-4 h-4 mr-2" />
                Tell us about you (voice)
              </Button>
            </div>
          </CardContent>
        </Card>

        <VoiceOnboardingModal
          isOpen={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          onComplete={handleVoiceComplete}
          isFirstSignIn={false}
        />
      </>
    );
  }

  return (
    <>
      <Card className="bg-white/5 border-white/10 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-neon-orange" />
              About You
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsVoiceModalOpen(true)}
                className="border-neon-pink/40 text-neon-pink hover:bg-neon-pink/10"
              >
                <RotateCcw className="w-3 h-3 mr-2" />
                Re-record
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleEditClick}
                className="border-white/20 text-foreground hover:bg-white/10"
              >
                <Edit className="w-3 h-3 mr-2" />
                Edit
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Bio */}
          {profileData.bio && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-neutral-300 uppercase tracking-wide">Bio</h4>
                {isEditing && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleSave}
                      className="border-neon-green/40 text-neon-green hover:bg-neon-green/10"
                    >
                      <Save className="w-3 h-3 mr-2" />
                      Save
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleCancel}
                      className="border-red-400/40 text-red-400 hover:bg-red-400/10"
                    >
                      <X className="w-3 h-3 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
              {isEditing ? (
                <Textarea 
                  value={editedBio}
                  onChange={(e) => setEditedBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  className="min-h-[120px] bg-white/5 border-white/10 text-foreground resize-none"
                />
              ) : (
                <p className="text-foreground leading-relaxed">{profileData.bio}</p>
              )}
            </div>
          )}

          {/* Interests */}
          {profileData.interests && profileData.interests.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-neutral-300 uppercase tracking-wide">Interests</h4>
                {isEditingInterests && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleSaveInterests}
                      className="border-neon-green/40 text-neon-green hover:bg-neon-green/10"
                    >
                      <Save className="w-3 h-3 mr-2" />
                      Save
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleCancelInterests}
                      className="border-red-400/40 text-red-400 hover:bg-red-400/10"
                    >
                      <X className="w-3 h-3 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
                {!isEditingInterests && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleEditInterests}
                    className="border-white/20 text-foreground hover:bg-white/10"
                  >
                    <Edit className="w-3 h-3 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
              {isEditingInterests ? (
                <TagInput
                  tags={editedInterests}
                  onTagsChange={setEditedInterests}
                  placeholder="Add an interest and press Enter"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profileData.interests.map((interest, index) => (
                    <Badge 
                      key={index}
                      variant="secondary" 
                      className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan/40"
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Skills */}
          {profileData.skills && profileData.skills.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-neutral-300 uppercase tracking-wide">Skills & Roles</h4>
                {isEditingSkills && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleSaveSkills}
                      className="border-neon-green/40 text-neon-green hover:bg-neon-green/10"
                    >
                      <Save className="w-3 h-3 mr-2" />
                      Save
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleCancelSkills}
                      className="border-red-400/40 text-red-400 hover:bg-red-400/10"
                    >
                      <X className="w-3 h-3 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
                {!isEditingSkills && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleEditSkills}
                    className="border-white/20 text-foreground hover:bg-white/10"
                  >
                    <Edit className="w-3 h-3 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
              {isEditingSkills ? (
                <TagInput
                  tags={editedSkills}
                  onTagsChange={setEditedSkills}
                  placeholder="Add a skill or role and press Enter"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profileData.skills.map((skill, index) => (
                    <Badge 
                      key={index}
                      variant="secondary" 
                      className="bg-neon-pink/20 text-neon-pink border-neon-pink/40"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Preferred Locations */}
          {profileData.preferredLocations && profileData.preferredLocations.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-neutral-300 uppercase tracking-wide">Preferred Locations</h4>
                {isEditingLocations && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleSaveLocations}
                      className="border-neon-green/40 text-neon-green hover:bg-neon-green/10"
                    >
                      <Save className="w-3 h-3 mr-2" />
                      Save
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleCancelLocations}
                      className="border-red-400/40 text-red-400 hover:bg-red-400/10"
                    >
                      <X className="w-3 h-3 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
                {!isEditingLocations && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleEditLocations}
                    className="border-white/20 text-foreground hover:bg-white/10"
                  >
                    <Edit className="w-3 h-3 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
              {isEditingLocations ? (
                <TagInput
                  tags={editedLocations}
                  onTagsChange={setEditedLocations}
                  placeholder="Add a location and press Enter"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profileData.preferredLocations.map((location, index) => (
                    <Badge 
                      key={index}
                      variant="secondary" 
                      className="bg-neon-orange/20 text-neon-orange border-neon-orange/40"
                    >
                      {location}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Experience Types */}
          {profileData.experienceTypes && profileData.experienceTypes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-neutral-300 uppercase tracking-wide">Experience Types</h4>
                {isEditingExperiences && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleSaveExperiences}
                      className="border-neon-green/40 text-neon-green hover:bg-neon-green/10"
                    >
                      <Save className="w-3 h-3 mr-2" />
                      Save
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleCancelExperiences}
                      className="border-red-400/40 text-red-400 hover:bg-red-400/10"
                    >
                      <X className="w-3 h-3 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
                {!isEditingExperiences && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleEditExperiences}
                    className="border-white/20 text-foreground hover:bg-white/10"
                  >
                    <Edit className="w-3 h-3 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
              {isEditingExperiences ? (
                <TagInput
                  tags={editedExperiences}
                  onTagsChange={setEditedExperiences}
                  placeholder="Add an experience type and press Enter"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profileData.experienceTypes.map((type, index) => (
                    <Badge 
                      key={index}
                      variant="secondary" 
                      className="bg-neon-green/20 text-neon-green border-neon-green/40"
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Voice Setup Button */}
          <div className="pt-4 border-t border-white/10">
            <Button 
              onClick={() => setIsVoiceModalOpen(true)}
              className="bg-gradient-neon text-background hover:opacity-90 shadow-neon w-full"
            >
              <Mic className="w-4 h-4 mr-2" />
              Tell us about you (voice)
            </Button>
          </div>
        </CardContent>
      </Card>

      <VoiceOnboardingModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onComplete={handleVoiceComplete}
        isFirstSignIn={false}
      />
    </>
  );
};