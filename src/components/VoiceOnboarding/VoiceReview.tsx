import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ArrowLeft, Edit, X, Plus, ChevronDown, Mic, Save, RotateCcw } from 'lucide-react';
import { ExtractedProfileData, VoiceTranscript } from '@/types/voiceOnboarding';

interface VoiceReviewProps {
  extractedData: ExtractedProfileData;
  transcript: VoiceTranscript;
  onSave: (data: ExtractedProfileData, saveTranscript: boolean) => void;
  onReRecord: () => void;
  onBack: () => void;
}

export const VoiceReview: React.FC<VoiceReviewProps> = ({
  extractedData,
  transcript,
  onSave,
  onReRecord,
  onBack
}) => {
  const [editedData, setEditedData] = useState<ExtractedProfileData>(extractedData);
  const [saveTranscript, setSaveTranscript] = useState(false);
  const [saveProfile, setSaveProfile] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [editingTranscript, setEditingTranscript] = useState(false);
  const [editedTranscriptText, setEditedTranscriptText] = useState(transcript.text);

  const addChip = (category: keyof Pick<ExtractedProfileData, 'interests' | 'skills' | 'preferredLocations' | 'experienceTypes'>, value: string) => {
    if (!value.trim()) return;
    
    setEditedData(prev => ({
      ...prev,
      [category]: [...prev[category], value.trim()]
    }));
  };

  const removeChip = (category: keyof Pick<ExtractedProfileData, 'interests' | 'skills' | 'preferredLocations' | 'experienceTypes'>, index: number) => {
    setEditedData(prev => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index)
    }));
  };

  const ChipEditor: React.FC<{
    title: string;
    items: string[];
    category: keyof Pick<ExtractedProfileData, 'interests' | 'skills' | 'preferredLocations' | 'experienceTypes'>;
    placeholder: string;
  }> = ({ title, items, category, placeholder }) => {
    const [newItem, setNewItem] = useState('');

    const handleAdd = () => {
      if (newItem.trim()) {
        addChip(category, newItem);
        setNewItem('');
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAdd();
      }
    };

    return (
      <div className="space-y-3">
        <h4 className="font-medium text-foreground">{title}</h4>
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan/40 pr-1"
            >
              {item}
              <button
                onClick={() => removeChip(category, index)}
                className="ml-2 hover:text-red-400 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className="px-2 py-1 text-sm bg-white/5 border border-white/20 rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-neon-pink/50"
            />
            <Button size="sm" variant="ghost" onClick={handleAdd} className="text-muted-foreground hover:text-foreground">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const handleSave = () => {
    if (!saveProfile) return;
    
    const finalData = {
      ...editedData,
      bio: editingTranscript ? editedTranscriptText : editedData.bio
    };
    
    onSave(finalData, saveTranscript);
  };

  return (
    <div className="space-y-6 p-6 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Review & Edit</h2>
          <p className="text-sm text-muted-foreground">Make any changes before saving to your profile</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Bio Section */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <Edit className="w-4 h-4 text-neon-orange" />
              Bio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={editedData.bio}
              onChange={(e) => setEditedData(prev => ({ ...prev, bio: e.target.value }))}
              className="min-h-[100px] bg-white/5 border-white/10 text-foreground resize-none"
              placeholder="Tell us about yourself..."
            />
          </CardContent>
        </Card>

        {/* Extracted Fields */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-foreground">Your Profile Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ChipEditor
              title="Interests"
              items={editedData.interests}
              category="interests"
              placeholder="Add interest..."
            />
            
            <ChipEditor
              title="Skills & Roles"
              items={editedData.skills}
              category="skills"
              placeholder="Add skill..."
            />
            
            <ChipEditor
              title="Preferred Locations"
              items={editedData.preferredLocations}
              category="preferredLocations"
              placeholder="Add location..."
            />
            
            <ChipEditor
              title="Experience Types"
              items={editedData.experienceTypes}
              category="experienceTypes"
              placeholder="Add experience type..."
            />
          </CardContent>
        </Card>

        {/* Raw Transcript */}
        <Card className="bg-white/5 border-white/10">
          <Collapsible open={transcriptOpen} onOpenChange={setTranscriptOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-white/5 transition-colors">
                <CardTitle className="text-lg text-foreground flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-neon-pink" />
                    Your Recording Transcript
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${transcriptOpen ? 'rotate-180' : ''}`} />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                {editingTranscript ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editedTranscriptText}
                      onChange={(e) => setEditedTranscriptText(e.target.value)}
                      className="min-h-[120px] bg-white/5 border-white/10 text-foreground resize-none"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => setEditingTranscript(false)} className="bg-gradient-neon text-background">
                        Save Changes
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => {
                        setEditedTranscriptText(transcript.text);
                        setEditingTranscript(false);
                      }}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {editedTranscriptText}
                    </p>
                    <Button size="sm" variant="outline" onClick={() => setEditingTranscript(true)}>
                      <Edit className="w-3 h-3 mr-2" />
                      Edit Text
                    </Button>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Privacy & Save Options */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-foreground">Privacy & Save</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="save-profile" 
                checked={saveProfile}
                onCheckedChange={(checked) => setSaveProfile(checked as boolean)}
              />
              <label htmlFor="save-profile" className="text-sm text-foreground cursor-pointer">
                I agree to save this info to my profile
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="save-transcript" 
                checked={saveTranscript}
                onCheckedChange={(checked) => setSaveTranscript(checked as boolean)}
              />
              <label htmlFor="save-transcript" className="text-sm text-muted-foreground cursor-pointer">
                Save transcript to my profile (private, optional)
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <Button 
            onClick={handleSave}
            disabled={!saveProfile}
            className="flex-1 bg-gradient-neon text-background hover:opacity-90 shadow-neon"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Profile
          </Button>
          <Button variant="outline" onClick={onReRecord} className="border-neon-orange/40 text-neon-orange">
            <RotateCcw className="w-4 h-4 mr-2" />
            Re-record
          </Button>
          <Button variant="outline" onClick={onBack}>
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  );
};