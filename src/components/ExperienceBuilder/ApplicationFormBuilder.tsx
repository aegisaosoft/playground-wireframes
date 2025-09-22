import React, { useState } from 'react';
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
  Users
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
  shortText: 'Short Text',
  longText: 'Long Text',
  singleSelect: 'Single Select',
  multiSelect: 'Multi Select',
  socialMedia: 'Social Media',
};

export const ApplicationFormBuilder: React.FC<ApplicationFormBuilderProps> = ({
  fields,
  tiers,
  onFieldsChange,
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [newFieldType, setNewFieldType] = useState<ApplicationFieldType>('shortText');

  const customFields = fields.filter(field => !defaultRequiredFields.some(df => df.id === field.id));

  const addField = () => {
    const newField: ApplicationField = {
      id: `field_${Date.now()}`,
      type: newFieldType,
      label: `New ${fieldTypeLabels[newFieldType]}`,
      required: false,
      appliesTo: 'all',
      placeholder: '',
      options: newFieldType === 'singleSelect' || newFieldType === 'multiSelect' ? ['Option 1'] : undefined,
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

  const addOption = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (field && field.options) {
      updateField(fieldId, {
        options: [...field.options, `Option ${field.options.length + 1}`]
      });
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
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </Button>
      </div>

      {showPreview ? (
        <ApplicationFormPreview fields={fields} tiers={tiers} />
      ) : (
        <div className="space-y-4">
          {/* Required Fields */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="w-4 h-4" />
              <span>Required by platform</span>
            </div>
            
            {defaultRequiredFields.map((field) => (
              <Card key={field.id} className="bg-muted/20 border-muted">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium text-foreground">{field.label}</div>
                      <div className="text-sm text-muted-foreground">Always required for all applicants</div>
                    </div>
                    <Badge variant="secondary" className="text-xs">Required</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator />

          {/* Custom Fields */}
          <div className="space-y-3">
            <h5 className="font-medium text-foreground">Custom Questions</h5>
            
            {customFields.map((field, index) => (
              <Card key={field.id} className="bg-background border-border">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm">Question Label</Label>
                          <Input
                            value={field.label}
                            onChange={(e) => updateField(field.id, { label: e.target.value })}
                            placeholder="Enter question"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Placeholder (optional)</Label>
                          <Input
                            value={field.placeholder || ''}
                            onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                            placeholder="Enter placeholder text"
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeField(field.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Options for select fields */}
                    {(field.type === 'singleSelect' || field.type === 'multiSelect') && field.options && (
                      <div className="space-y-2">
                        <Label className="text-sm">Options</Label>
                        {field.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center gap-2">
                            <Input
                              value={option}
                              onChange={(e) => updateOption(field.id, optionIndex, e.target.value)}
                              placeholder={`Option ${optionIndex + 1}`}
                              className="flex-1"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOption(field.id, optionIndex)}
                              disabled={field.options!.length <= 1}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addOption(field.id)}
                          className="w-full text-muted-foreground hover:text-foreground"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Option
                        </Button>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={field.required}
                            onCheckedChange={(checked) => updateField(field.id, { required: checked })}
                          />
                          <Label className="text-sm">Required</Label>
                        </div>
                      </div>
                      
                      <Badge variant="outline" className="text-xs">
                        {fieldTypeLabels[field.type]}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="border-dashed border-muted-foreground/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Select value={newFieldType} onValueChange={(value: ApplicationFieldType) => setNewFieldType(value)}>
                    <SelectTrigger className="w-48">
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
              </CardContent>
            </Card>
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
                  {field.options.map((option, index) => (
                    <SelectItem key={index} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {field.type === 'multiSelect' && field.options && (
              <div className="space-y-2 p-3 bg-muted/50 rounded-md">
                {field.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input type="checkbox" disabled />
                    <span className="text-sm">{option}</span>
                  </div>
                ))}
              </div>
            )}
            
            {field.type === 'socialMedia' && (
              <div className="space-y-2">
                <Input placeholder="LinkedIn URL (optional)" disabled />
                <Input placeholder="Instagram URL (optional)" disabled />
                <Input placeholder="X (Twitter) URL (optional)" disabled />
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};