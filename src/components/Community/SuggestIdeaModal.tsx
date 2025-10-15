import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { TagInput } from '@/components/TagInput';
import { X, Lightbulb, MapPin, Calendar, Users, Hash } from 'lucide-react';
import { communityService } from '@/services/community.service';
import { useToast } from '@/hooks/use-toast';

interface SuggestIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // Callback to refresh ideas list
}

export const SuggestIdeaModal = ({ isOpen, onClose, onSuccess }: SuggestIdeaModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    tentativeDates: '',
    desiredPeople: '',
    tags: [] as string[],
    isAnonymous: false
  });

  const handleNext = () => {
    if (currentStep === 1 && formData.title.trim()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      console.log('Submitting idea:', formData);
      
      // Call API to create idea
      await communityService.createIdea({
        title: formData.title,
        description: formData.description,
        location: formData.location,
        tentativeDates: formData.tentativeDates,
        desiredPeople: formData.desiredPeople,
        tags: formData.tags.join(','), // Convert array to comma-separated string
        isAnonymous: formData.isAnonymous
      });
      
      toast({
        title: "Idea Posted!",
        description: "Your suggestion has been added to the community board.",
      });
      
      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        location: '',
        tentativeDates: '',
        desiredPeople: '',
        tags: [],
        isAnonymous: false
      });
      setCurrentStep(1);
      onClose();
      
      // Trigger refresh
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to submit idea:', error);
      toast({
        title: "Error",
        description: "Failed to post your idea. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      tentativeDates: '',
      desiredPeople: '',
      tags: [],
      isAnonymous: false
    });
    setCurrentStep(1);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-background/95 backdrop-blur-sm border-white/20 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
            <Lightbulb className="w-6 h-6 inline mr-2 text-neon-cyan" />
            Suggest an Idea
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress indicator */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                currentStep >= 1 ? 'bg-neon-cyan text-background' : 'bg-white/20 text-white/60'
              }`}>
                1
              </div>
              <span className={`text-sm ${currentStep >= 1 ? 'text-white' : 'text-white/60'}`}>
                Your Idea
              </span>
            </div>
            <div className={`h-px flex-1 ${currentStep >= 2 ? 'bg-neon-cyan' : 'bg-white/20'}`} />
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                currentStep >= 2 ? 'bg-neon-cyan text-background' : 'bg-white/20 text-white/60'
              }`}>
                2
              </div>
              <span className={`text-sm ${currentStep >= 2 ? 'text-white' : 'text-white/60'}`}>
                Details
              </span>
            </div>
          </div>

          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-white font-semibold">
                  What's your idea? *
                </Label>
                <Textarea
                  id="title"
                  placeholder="e.g., Bali Hacker House, Swiss Alps Wellness Retreat, Portugal Surf & Code..."
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-2 bg-white/5 border-white/20 text-white placeholder:text-white/40 min-h-[100px] text-lg"
                />
                <p className="text-sm text-white/60 mt-2">
                  Be creative! This is your chance to share what kind of experience you'd love to see happen.
                </p>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <p className="text-white/80 text-center">
                Add some details to help others understand your idea better (all optional)
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location" className="text-white font-semibold flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    placeholder="e.g., Bali, Switzerland, Remote"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="mt-2 bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>

                <div>
                  <Label htmlFor="dates" className="text-white font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Tentative Dates
                  </Label>
                  <Input
                    id="dates"
                    placeholder="e.g., March-ish, Summer 2024"
                    value={formData.tentativeDates}
                    onChange={(e) => setFormData(prev => ({ ...prev, tentativeDates: e.target.value }))}
                    className="mt-2 bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="people" className="text-white font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Desired # of People
                </Label>
                <Input
                  id="people"
                  placeholder="e.g., Looking for 5 more, 8-12 people"
                  value={formData.desiredPeople}
                  onChange={(e) => setFormData(prev => ({ ...prev, desiredPeople: e.target.value }))}
                  className="mt-2 bg-white/5 border-white/20 text-white placeholder:text-white/40"
                />
              </div>

              <div>
                <Label className="text-white font-semibold flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Tags
                </Label>
                <TagInput
                  tags={formData.tags}
                  onTagsChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
                  placeholder="Add tags like Web3, Yoga, Surfing, AI..."
                />
                <p className="text-sm text-white/60 mt-2">
                  Press Enter to add each tag. Popular tags: Yoga, Web3, Surfing, AI, Wellness, Coding, Adventure
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t border-white/10">
            <div>
              {currentStep === 2 && (
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="text-white/70 hover:text-white"
                >
                  Back
                </Button>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="bg-transparent border-white/30 text-white/70 hover:bg-white/10 hover:text-white"
              >
                Cancel
              </Button>
              
              {currentStep === 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={!formData.title.trim()}
                  className="bg-gradient-to-r from-neon-cyan to-neon-purple text-background hover:opacity-90 font-semibold disabled:opacity-50"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-neon-cyan to-neon-purple text-background hover:opacity-90 font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? 'Posting...' : 'Post Idea'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};