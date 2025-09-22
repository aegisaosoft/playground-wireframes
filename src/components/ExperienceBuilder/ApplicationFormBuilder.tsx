import React, { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  Lock, 
  GripVertical, 
  Eye, 
  EyeOff,
  Type,
  AlignLeft,
  CircleDot,
  CheckSquare,
  Users,
  Linkedin,
  Instagram,
  X as XIcon
} from 'lucide-react';
import { ApplicationField, ApplicationFieldType, TicketTierWithApplication, defaultRequiredFields } from '@/types/applicationForm';

interface ApplicationFormBuilderProps {
  fields: ApplicationField[];
  tiers: TicketTierWithApplication[];
  onFieldsChange: (fields: ApplicationField[]) => void;
}

const fieldTypeIcons = {
  shortText: Type,
  longText: AlignLeft,
  singleSelect: CircleDot,
  multiSelect: CheckSquare,
  socialMedia: Users,
};

const fieldTypeLabels = {
  shortText: 'Short text',
  longText: 'Long text', 
  singleSelect: 'Single select',
  multiSelect: 'Multi select',
  socialMedia: 'Socials',
};

export const ApplicationFormBuilder: React.FC<ApplicationFormBuilderProps> = ({
  fields,
  tiers,
  onFieldsChange,
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [newFieldType, setNewFieldType] = useState<ApplicationFieldType>('shortText');
  const [newOptions, setNewOptions] = useState<{[key: string]: string}>({});

  const customFields = fields.filter(field => !defaultRequiredFields.some(df => df.id === field.id));

  const addField = () => {
    const newField: ApplicationField = {
      id: `field_${Date.now()}`,
      type: newFieldType,
      label: 'Untitled Question',
      required: false,
      appliesTo: 'all',
      placeholder: '',
      options: newFieldType === 'singleSelect' || newFieldType === 'multiSelect' ? [''] : undefined,
      socialNetworks: newFieldType === 'socialMedia' ? { linkedin: true, instagram: true, x: true } : undefined,
    };

    onFieldsChange([...fields, newField]);
  };

  const updateField = (fieldId: string, updates: Partial<ApplicationField>) => {
    const updatedFields = fields.map(field =>
      field.id === fieldId ? { ...field, ...updates } : field
    );
    onFieldsChange(updatedFields);
  };

  const removeField = (fieldId: string) => {
    const updatedFields = fields.filter(field => field.id !== fieldId);
    onFieldsChange(updatedFields);
  };

  const addOption = (fieldId: string, value: string) => {
    if (!value.trim()) return;
    
    const field = fields.find(f => f.id === fieldId);
    if (field && field.options) {
      updateField(fieldId, {
        options: [...field.options.filter(o => o.trim()), value.trim()]
      });
    }
    setNewOptions({...newOptions, [fieldId]: ''});
  };

  const handleOptionKeyPress = (e: KeyboardEvent<HTMLInputElement>, fieldId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addOption(fieldId, newOptions[fieldId] || '');
    }
  };

  const updateOption = (fieldId: string, optionIndex: number, value: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (field && field.options) {
      const newOptions = [...field.options];
      newOptions[optionIndex] = value;
      updateField(fieldId, { options: newOptions });
    }
  };

  const removeOption = (fieldId: string, optionIndex: number) => {
    const field = fields.find(f => f.id === fieldId);
    if (field && field.options && field.options.length > 1) {
      const newOptions = field.options.filter((_, index) => index !== optionIndex);
      updateField(fieldId, { options: newOptions });
    }
  };

  const toggleSocialNetwork = (fieldId: string, network: 'linkedin' | 'instagram' | 'x') => {
    const field = fields.find(f => f.id === fieldId);
    if (field && field.socialNetworks) {
      updateField(fieldId, {
        socialNetworks: {
          ...field.socialNetworks,
          [network]: !field.socialNetworks[network]
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-foreground">Application Questions</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          className="text-muted-foreground hover:text-foreground"
        >
          {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
          {showPreview ? 'Hide Preview' : 'Preview Application'}
        </Button>
      </div>

      {showPreview ? (
        <ApplicationFormPreview fields={fields} tiers={tiers} />
      ) : (
        <div className="space-y-4">
          {/* Required Fields */}
          <div className="space-y-2">
            {defaultRequiredFields.map((field) => (
              <Card key={field.id} className="bg-muted/20 border-muted">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium text-foreground">{field.label}</div>
                      <div className="text-xs text-muted-foreground">Required</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator />

          {/* Custom Fields */}
          <div className="space-y-3">
            {customFields.map((field, index) => (
              <Card key={field.id} className="bg-background border-border">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {/* Question input row */}
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                      <Input
                        value={field.label}
                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                        placeholder="Type your question…"
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeField(field.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={field.required}
                            onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                            className="data-[state=checked]:bg-primary"
                          />
                          <Label className="text-sm font-medium">Required</Label>
                        </div>
                      </div>

                      {/* Tier applicability */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">For:</span>
                        <Select 
                          value={field.appliesTo === 'all' ? 'all' : 'specific'} 
                          onValueChange={(value) => updateField(field.id, { appliesTo: value === 'all' ? 'all' : [] })}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All tiers</SelectItem>
                            <SelectItem value="specific">Selected tiers</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Options for select fields */}
                    {(field.type === 'singleSelect' || field.type === 'multiSelect') && field.options && (
                      <div className="space-y-2">
                        <Label className="text-sm">Options</Label>
                        <div className="space-y-2">
                          {field.options.map((option, optionIndex) => (
                            option.trim() && (
                              <div key={optionIndex} className="flex items-center gap-2">
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <span>{option}</span>
                                  <button
                                    onClick={() => removeOption(field.id, optionIndex)}
                                    className="ml-1 text-muted-foreground hover:text-destructive"
                                  >
                                    ×
                                  </button>
                                </Badge>
                              </div>
                            )
                          ))}
                          <Input
                            value={newOptions[field.id] || ''}
                            onChange={(e) => setNewOptions({...newOptions, [field.id]: e.target.value})}
                            onKeyPress={(e) => handleOptionKeyPress(e, field.id)}
                            placeholder="Type option and press Enter"
                            className="text-sm"
                          />
                        </div>
                      </div>
                    )}

                    {/* Social networks for social media fields */}
                    {field.type === 'socialMedia' && field.socialNetworks && (
                      <div className="space-y-2">
                        <Label className="text-sm">Social Networks</Label>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => toggleSocialNetwork(field.id, 'linkedin')}
                            className={`p-2 rounded-md border transition-colors ${
                              field.socialNetworks.linkedin 
                                ? 'bg-primary text-primary-foreground border-primary' 
                                : 'bg-background border-border text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <Linkedin className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleSocialNetwork(field.id, 'instagram')}
                            className={`p-2 rounded-md border transition-colors ${
                              field.socialNetworks.instagram 
                                ? 'bg-primary text-primary-foreground border-primary' 
                                : 'bg-background border-border text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <Instagram className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleSocialNetwork(field.id, 'x')}
                            className={`p-2 rounded-md border transition-colors ${
                              field.socialNetworks.x 
                                ? 'bg-primary text-primary-foreground border-primary' 
                                : 'bg-background border-border text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <XIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Add Question Button */}
            <div className="flex items-center gap-3 p-4 border border-dashed border-muted-foreground/30 rounded-lg">
              <Select value={newFieldType} onValueChange={(value: ApplicationFieldType) => setNewFieldType(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(fieldTypeLabels).map(([value, label]) => {
                    const Icon = fieldTypeIcons[value as ApplicationFieldType];
                    return (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              
              <Button onClick={addField} className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ApplicationFormPreview: React.FC<{
  fields: ApplicationField[];
  tiers: TicketTierWithApplication[];
}> = ({ fields, tiers }) => {
  return (
    <Card className="bg-background border-border">
      <CardHeader>
        <CardTitle className="text-lg">Application Form Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label className="flex items-center gap-1">
              {field.label}
              {field.required && <span className="text-destructive">*</span>}
            </Label>
            
            {field.type === 'shortText' && (
              <Input placeholder={field.placeholder} disabled />
            )}
            
            {field.type === 'longText' && (
              <Textarea placeholder={field.placeholder} disabled />
            )}
            
            {field.type === 'singleSelect' && field.options && (
              <Select disabled>
                <SelectTrigger>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {field.options.filter(o => o.trim()).map((option, index) => (
                    <SelectItem key={index} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {field.type === 'multiSelect' && field.options && (
              <div className="space-y-2 p-3 bg-muted/50 rounded-md">
                {field.options.filter(o => o.trim()).map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input type="checkbox" disabled />
                    <span className="text-sm">{option}</span>
                  </div>
                ))}
              </div>
            )}
            
            {field.type === 'socialMedia' && field.socialNetworks && (
              <div className="space-y-2">
                {field.socialNetworks.linkedin && (
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4" />
                    <Input placeholder="LinkedIn URL (optional)" disabled />
                  </div>
                )}
                {field.socialNetworks.instagram && (
                  <div className="flex items-center gap-2">
                    <Instagram className="w-4 h-4" />
                    <Input placeholder="Instagram URL (optional)" disabled />
                  </div>
                )}
                {field.socialNetworks.x && (
                  <div className="flex items-center gap-2">
                    <XIcon className="w-4 h-4" />
                    <Input placeholder="X URL (optional)" disabled />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};