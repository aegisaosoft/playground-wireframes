import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Calendar, MapPin, Users, Tag, Clock, Ticket, 
  Eye, ChevronDown, Edit3, Mic, ArrowLeft, Plus, X, FileText, Image as ImageIcon
} from 'lucide-react';
import { ExtractedExperienceData } from '@/types/voiceExperienceCreation';

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  type: 'image' | 'pdf' | 'other';
}

interface VoiceExperienceReviewProps {
  extractedData: ExtractedExperienceData;
  transcript: string;
  uploadedFiles?: UploadedFile[];
  onCreateDraft: (data: ExtractedExperienceData, saveTranscript: boolean) => void;
  onReRecord: () => void;
  onBack: () => void;
}

export const VoiceExperienceReview: React.FC<VoiceExperienceReviewProps> = ({
  extractedData,
  transcript,
  uploadedFiles = [],
  onCreateDraft,
  onReRecord,
  onBack
}) => {
  const [editedData, setEditedData] = useState<ExtractedExperienceData>(extractedData);
  const [saveTranscript, setSaveTranscript] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);

  const getConfidenceColor = (confidence?: 'high' | 'medium' | 'low') => {
    switch (confidence) {
      case 'high': return 'bg-green-500/20 text-green-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'low': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const addTag = (field: 'audience' | 'vibe', value: string) => {
    if (!value.trim()) return;
    setEditedData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), value.trim()]
    }));
  };

  const removeTag = (field: 'audience' | 'vibe', index: number) => {
    setEditedData(prev => ({
      ...prev,
      [field]: prev[field]?.filter((_, i) => i !== index) || []
    }));
  };

  const updateTicketTier = (index: number, field: 'name' | 'price' | 'quantity', value: string | number) => {
    setEditedData(prev => ({
      ...prev,
      ticketTiers: prev.ticketTiers?.map((tier, i) => 
        i === index ? { ...tier, [field]: value } : tier
      ) || []
    }));
  };

  const addTicketTier = () => {
    setEditedData(prev => ({
      ...prev,
      ticketTiers: [...(prev.ticketTiers || []), { name: 'New Tier', price: 0, quantity: 10 }]
    }));
  };

  const removeTicketTier = (index: number) => {
    setEditedData(prev => ({
      ...prev,
      ticketTiers: prev.ticketTiers?.filter((_, i) => i !== index) || []
    }));
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Review & Edit Experience</h2>
          <p className="text-sm text-muted-foreground">Check the extracted information and make any adjustments</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Title */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Experience Title</CardTitle>
              <Badge className={getConfidenceColor(editedData.confidence?.title)}>
                {editedData.confidence?.title || 'medium'} confidence
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Input
              value={editedData.title || ''}
              onChange={(e) => setEditedData(prev => ({ ...prev, title: e.target.value }))}
              className="bg-white/5 border-white/10 text-lg font-semibold"
              placeholder="Enter experience title"
            />
          </CardContent>
        </Card>

        {/* Location & Dates */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </CardTitle>
                <Badge className={getConfidenceColor(editedData.confidence?.location)}>
                  {editedData.confidence?.location || 'medium'} confidence
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                value={editedData.location?.city || ''}
                onChange={(e) => setEditedData(prev => ({ 
                  ...prev, 
                  location: { ...prev.location, city: e.target.value } 
                }))}
                placeholder="City"
                className="bg-white/5 border-white/10"
              />
              <Input
                value={editedData.location?.country || ''}
                onChange={(e) => setEditedData(prev => ({ 
                  ...prev, 
                  location: { ...prev.location, country: e.target.value } 
                }))}
                placeholder="Country"
                className="bg-white/5 border-white/10"
              />
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Dates
                </CardTitle>
                <Badge className={getConfidenceColor(editedData.confidence?.dates)}>
                  {editedData.confidence?.dates || 'medium'} confidence
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                type="date"
                value={editedData.dates?.startDate ? editedData.dates.startDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setEditedData(prev => ({ 
                  ...prev, 
                  dates: { ...prev.dates, startDate: new Date(e.target.value) } 
                }))}
                className="bg-white/5 border-white/10"
              />
              <Input
                type="date"
                value={editedData.dates?.endDate ? editedData.dates.endDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setEditedData(prev => ({ 
                  ...prev, 
                  dates: { ...prev.dates, endDate: new Date(e.target.value) } 
                }))}
                className="bg-white/5 border-white/10"
              />
            </CardContent>
          </Card>
        </div>

        {/* Audience & Vibe */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Target Audience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-3">
                {editedData.audience?.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="bg-neon-cyan/20 text-neon-cyan">
                    {tag}
                    <button 
                      onClick={() => removeTag('audience', index)}
                      className="ml-1 hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Add audience tag (press Enter)"
                className="bg-white/5 border-white/10"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addTag('audience', e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Vibe & Style
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-3">
                {editedData.vibe?.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="bg-neon-purple/20 text-neon-purple">
                    {tag}
                    <button 
                      onClick={() => removeTag('vibe', index)}
                      className="ml-1 hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Add vibe tag (press Enter)"
                className="bg-white/5 border-white/10"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addTag('vibe', e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Ticket Tiers */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Ticket className="w-4 h-4" />
                Ticket Tiers
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={getConfidenceColor(editedData.confidence?.ticketTiers)}>
                  {editedData.confidence?.ticketTiers || 'medium'} confidence
                </Badge>
                <Button onClick={addTicketTier} size="sm" variant="outline" className="border-white/20">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {editedData.ticketTiers?.map((tier, index) => (
              <div key={index} className="grid grid-cols-4 gap-3 items-center p-3 bg-white/5 rounded-lg">
                <Input
                  value={tier.name}
                  onChange={(e) => updateTicketTier(index, 'name', e.target.value)}
                  placeholder="Tier name"
                  className="bg-white/5 border-white/10"
                />
                <Input
                  type="number"
                  value={tier.price}
                  onChange={(e) => updateTicketTier(index, 'price', parseInt(e.target.value) || 0)}
                  placeholder="Price (0 = free)"
                  className="bg-white/5 border-white/10"
                />
                <Input
                  type="number"
                  value={tier.quantity}
                  onChange={(e) => updateTicketTier(index, 'quantity', parseInt(e.target.value) || 0)}
                  placeholder="Quantity"
                  className="bg-white/5 border-white/10"
                />
                <Button
                  onClick={() => removeTicketTier(index)}
                  size="sm"
                  variant="ghost"
                  className="text-red-400 hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Uploaded Reference Materials ({uploadedFiles.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {uploadedFiles.map((file) => (
                  <Card key={file.id} className="bg-white/5 border-white/10 overflow-hidden">
                    {file.type === 'image' && file.preview ? (
                      <div className="aspect-square relative">
                        <img
                          src={file.preview}
                          alt={file.file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-square flex items-center justify-center bg-gradient-dark">
                        {file.type === 'pdf' ? (
                          <FileText className="w-8 h-8 text-red-400" />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                    )}
                    <div className="p-2 text-xs text-foreground truncate" title={file.file.name}>
                      {file.file.name}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transcript */}
        <Collapsible open={showTranscript} onOpenChange={setShowTranscript}>
          <CollapsibleTrigger asChild>
            <Card className="bg-white/5 border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Original Transcript
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Text
                    </Button>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showTranscript ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </CardHeader>
            </Card>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card className="bg-white/5 border-white/10 mt-2">
              <CardContent className="pt-6">
                <Textarea
                  value={transcript}
                  className="bg-white/5 border-white/10 min-h-[120px]"
                  placeholder="Your transcript will appear here..."
                  readOnly
                />
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* Privacy */}
        <Card className="bg-white/5 border-white/10">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="save-transcript" 
                checked={saveTranscript}
                onCheckedChange={(checked) => setSaveTranscript(checked === true)}
              />
              <label htmlFor="save-transcript" className="text-sm text-muted-foreground">
                Save transcript privately to this experience draft (optional)
              </label>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-center pt-6">
        <Button 
          onClick={onReRecord}
          variant="outline"
          className="border-white/20 text-foreground hover:bg-white/5"
        >
          <Mic className="w-4 h-4 mr-2" />
          Re-record
        </Button>
        <Button 
          onClick={() => onCreateDraft(editedData, saveTranscript)}
          className="bg-gradient-neon text-background hover:opacity-90 shadow-neon px-8"
        >
          Create Draft in Builder
        </Button>
      </div>
    </div>
  );
};