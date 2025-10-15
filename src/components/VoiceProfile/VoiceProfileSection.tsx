import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { TagInput } from '@/components/TagInput';
import { VoiceOnboardingModal } from '@/components/VoiceOnboarding';
import { Mic, MicOff, Edit, RotateCcw, User, Save, X } from 'lucide-react';
import { ExtractedProfileData } from '@/types/voiceOnboarding';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useToast } from '@/hooks/use-toast';

interface VoiceProfileSectionProps {
  profileData?: ExtractedProfileData & { transcript?: string };
  onUpdateProfile?: (data: ExtractedProfileData) => void;
}

export const VoiceProfileSection: React.FC<VoiceProfileSectionProps> = ({
  profileData,
  onUpdateProfile
}) => {
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const { toast } = useToast();
  
  // All edit states in one object
  const [editedData, setEditedData] = useState<ExtractedProfileData>({
    bio: '',
    interests: [],
    skills: [],
    preferredLocations: [],
    experienceTypes: []
  });

  // Voice recognition for bio field
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: isVoiceSupported,
    error: voiceError
  } = useVoiceRecognition({ continuous: true, interimResults: true });

  // Update bio when voice transcript changes
  useEffect(() => {
    if (transcript && isListening) {
      setEditedData(prev => ({ ...prev, bio: transcript }));
    }
  }, [transcript, isListening]);

  // Show voice error notifications
  useEffect(() => {
    if (voiceError) {
      toast({
        title: "Voice Recognition Error",
        description: voiceError,
        variant: "destructive",
      });
    }
  }, [voiceError, toast]);

  const handleVoiceComplete = (data: ExtractedProfileData) => {
    onUpdateProfile?.(data);
    setIsVoiceModalOpen(false);
  };

  const handleEditClick = () => {
    // Initialize edit data with current profile data
    setEditedData({
      bio: profileData?.bio || '',
      interests: profileData?.interests || [],
      skills: profileData?.skills || [],
      preferredLocations: profileData?.preferredLocations || [],
      experienceTypes: profileData?.experienceTypes || []
    });
    setIsEditMode(true);
    resetTranscript(); // Clear any previous voice input
  };

  const handleToggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      // Reset transcript when starting fresh
      resetTranscript();
      startListening();
    }
  };

  const handleSave = () => {
    if (profileData) {
      const updatedData = {
        ...profileData,
        ...editedData
      };
      onUpdateProfile?.(updatedData);
    }
    setIsEditMode(false);
  };

  const handleCancel = () => {
    setIsEditMode(false);
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
              {!isEditMode && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleEditClick}
                  className="border-white/20 text-foreground hover:bg-white/10"
                >
                  <Edit className="w-3 h-3 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Bio */}
          {profileData.bio && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-neutral-300 uppercase tracking-wide">Bio</h4>
                {isEditMode && isVoiceSupported && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleVoice}
                    disabled={!isVoiceSupported}
                    className={`${
                      isListening 
                        ? 'border-red-500 text-red-500 bg-red-500/10 animate-pulse' 
                        : 'border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/10'
                    }`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-3 h-3 mr-2" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="w-3 h-3 mr-2" />
                        Voice Input
                      </>
                    )}
                  </Button>
                )}
              </div>
              {isEditMode ? (
                <div className="space-y-2">
                  <Textarea 
                    value={editedData.bio}
                    onChange={(e) => setEditedData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself..."
                    className="min-h-[120px] bg-white/5 border-white/10 text-foreground resize-none"
                  />
                  {isListening && (
                    <div className="flex items-center gap-2 text-xs text-red-400">
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                      <span>Listening... Speak to update your bio</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-foreground leading-relaxed">{profileData.bio}</p>
              )}
            </div>
          )}

          {/* Interests */}
          {profileData.interests && profileData.interests.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-neutral-300 uppercase tracking-wide">Interests</h4>
              {isEditMode ? (
                <TagInput
                  tags={editedData.interests}
                  onTagsChange={(interests) => setEditedData(prev => ({ ...prev, interests }))}
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
              <h4 className="text-sm font-medium text-neutral-300 uppercase tracking-wide">Skills & Roles</h4>
              {isEditMode ? (
                <TagInput
                  tags={editedData.skills}
                  onTagsChange={(skills) => setEditedData(prev => ({ ...prev, skills }))}
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
              <h4 className="text-sm font-medium text-neutral-300 uppercase tracking-wide">Preferred Locations</h4>
              {isEditMode ? (
                <TagInput
                  tags={editedData.preferredLocations}
                  onTagsChange={(preferredLocations) => setEditedData(prev => ({ ...prev, preferredLocations }))}
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
              <h4 className="text-sm font-medium text-neutral-300 uppercase tracking-wide">Experience Types</h4>
              {isEditMode ? (
                <TagInput
                  tags={editedData.experienceTypes}
                  onTagsChange={(experienceTypes) => setEditedData(prev => ({ ...prev, experienceTypes }))}
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

          {/* Edit Mode Actions */}
          {isEditMode && (
            <div className="flex gap-3 pt-6 border-t border-white/10">
              <Button 
                onClick={handleSave}
                className="flex-1 bg-neon-green text-background hover:bg-neon-green/90"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button 
                onClick={handleCancel}
                variant="outline"
                className="flex-1 border-red-400/40 text-red-400 hover:bg-red-400/10"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
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