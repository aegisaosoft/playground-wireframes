import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, X, Save, Upload, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UnifiedContentEditor } from "./UnifiedContentEditor";
import { ContentBlock } from "./RichContentEditor";
import { TagInput } from "./TagInput";

export interface DailyAgenda {
  id: string;
  day: number;
  date: string;
  title: string;
  description: string;
  activities: Activity[];
}

export interface Activity {
  id: string;
  time: string;
  title: string;
  description: string;
}

export interface TicketTier {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description: string;
}

export interface ApplicationField {
  id: string;
  type: 'text' | 'multiple_choice' | 'short_answer';
  label: string;
  required: boolean;
  options?: string[];
}

export interface RetreatDetails {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
  image: string;
  capacity: number;
  agenda: DailyAgenda[];
  ticketTiers: TicketTier[];
  applicationForm: ApplicationField[];
  extendedContent: ContentBlock[];
  isPublic: boolean; // Controls visibility when published (homepage vs direct link only)
  isPublished: boolean; // Controls whether retreat is live or in draft mode
}

interface RetreatEditorProps {
  retreat: RetreatDetails;
  onSave: (retreat: RetreatDetails) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const RetreatEditor = ({ retreat, onSave, onClose, isOpen }: RetreatEditorProps) => {
  const [currentRetreat, setCurrentRetreat] = useState<RetreatDetails>(retreat);
  const [isLoading, setIsLoading] = useState(false);
  const [customSlug, setCustomSlug] = useState("");
  const [slugError, setSlugError] = useState("");
  const { toast } = useToast();

  const validateSlug = (slug: string) => {
    if (!slug) {
      setSlugError("");
      return true;
    }
    
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      setSlugError("Only lowercase letters, numbers, and hyphens are allowed");
      return false;
    }
    
    setSlugError("");
    return true;
  };

  const handleSlugChange = (value: string) => {
    setCustomSlug(value);
    validateSlug(value);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save as draft - keep isPublished false
      const savedRetreat = { ...currentRetreat, isPublished: false };
      onSave(savedRetreat);
      
      // Retreat saved as draft
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save retreat. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateRequiredFields = () => {
    const missingFields: string[] = [];

    // Check basic required fields
    if (!currentRetreat.name.trim()) {
      missingFields.push("Retreat Name");
    }
    if (!currentRetreat.startDate) {
      missingFields.push("Start Date");
    }
    if (!currentRetreat.endDate) {
      missingFields.push("End Date");
    }
    if (!currentRetreat.location.trim()) {
      missingFields.push("Location");
    }
    if (!currentRetreat.description.trim()) {
      missingFields.push("Description");
    }

    // Check ticket tiers
    if (currentRetreat.ticketTiers.length === 0) {
      missingFields.push("At least one Ticket Tier");
    } else {
      // Check if all ticket tiers have required fields
      const incompleteTiers = currentRetreat.ticketTiers.filter(tier => 
        !tier.name.trim() || tier.price < 0 || tier.quantity <= 0
      );
      if (incompleteTiers.length > 0) {
        missingFields.push("Complete all Ticket Tier details (name, price, capacity)");
      }
    }

    return missingFields;
  };

  const handlePublish = async () => {
    const missingFields = validateRequiredFields();
    
    if (missingFields.length > 0) {
      toast({
        title: "Cannot publish retreat",
        description: `Please complete all required fields before publishing. Missing: ${missingFields.join(", ")}.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mark retreat as published and save
      const publishedRetreat = { ...currentRetreat, isPublished: true };
      onSave(publishedRetreat);
      
      // Retreat published successfully
      
      onClose();
    } catch (error) {
      toast({
        title: "Error publishing retreat",
        description: "There was an error publishing your retreat. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canOpenApplications = () => {
    return currentRetreat.ticketTiers.length > 0 && 
           currentRetreat.ticketTiers.every(tier => 
             tier.name.trim() && tier.price >= 0 && tier.quantity > 0
           );
  };

  const addDailyAgenda = () => {
    const newAgenda: DailyAgenda = {
      id: Date.now().toString(),
      day: currentRetreat.agenda.length + 1,
      date: "",
      title: "",
      description: "",
      activities: []
    };
    setCurrentRetreat(prev => ({
      ...prev,
      agenda: [...prev.agenda, newAgenda]
    }));
  };

  const removeDailyAgenda = (id: string) => {
    setCurrentRetreat(prev => ({
      ...prev,
      agenda: prev.agenda.filter(a => a.id !== id)
    }));
  };

  const updateDailyAgenda = (id: string, updates: Partial<DailyAgenda>) => {
    setCurrentRetreat(prev => ({
      ...prev,
      agenda: prev.agenda.map(a => a.id === id ? { ...a, ...updates } : a)
    }));
  };

  const addActivity = (agendaId: string) => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      time: "",
      title: "",
      description: ""
    };
    setCurrentRetreat(prev => ({
      ...prev,
      agenda: prev.agenda.map(a => 
        a.id === agendaId 
          ? { ...a, activities: [...a.activities, newActivity] }
          : a
      )
    }));
  };

  const removeActivity = (agendaId: string, activityId: string) => {
    setCurrentRetreat(prev => ({
      ...prev,
      agenda: prev.agenda.map(a => 
        a.id === agendaId 
          ? { ...a, activities: a.activities.filter(act => act.id !== activityId) }
          : a
      )
    }));
  };

  const updateActivity = (agendaId: string, activityId: string, updates: Partial<Activity>) => {
    setCurrentRetreat(prev => ({
      ...prev,
      agenda: prev.agenda.map(a => 
        a.id === agendaId 
          ? { 
              ...a, 
              activities: a.activities.map(act => 
                act.id === activityId ? { ...act, ...updates } : act
              )
            }
          : a
      )
    }));
  };

  const addTicketTier = () => {
    const newTier: TicketTier = {
      id: Date.now().toString(),
      name: "",
      price: 0,
      quantity: 0,
      description: ""
    };
    setCurrentRetreat(prev => ({
      ...prev,
      ticketTiers: [...prev.ticketTiers, newTier]
    }));
  };

  const removeTicketTier = (id: string) => {
    setCurrentRetreat(prev => ({
      ...prev,
      ticketTiers: prev.ticketTiers.filter(t => t.id !== id)
    }));
  };

  const updateTicketTier = (id: string, updates: Partial<TicketTier>) => {
    setCurrentRetreat(prev => ({
      ...prev,
      ticketTiers: prev.ticketTiers.map(t => t.id === id ? { ...t, ...updates } : t)
    }));
  };

  const addApplicationField = () => {
    const newField: ApplicationField = {
      id: Date.now().toString(),
      type: 'text',
      label: "",
      required: false,
      options: []
    };
    setCurrentRetreat(prev => ({
      ...prev,
      applicationForm: [...prev.applicationForm, newField]
    }));
  };

  const removeApplicationField = (id: string) => {
    setCurrentRetreat(prev => ({
      ...prev,
      applicationForm: prev.applicationForm.filter(f => f.id !== id)
    }));
  };

  const updateApplicationField = (id: string, updates: Partial<ApplicationField>) => {
    setCurrentRetreat(prev => ({
      ...prev,
      applicationForm: prev.applicationForm.map(f => f.id === id ? { ...f, ...updates } : f)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] !p-0 !gap-0 flex flex-col overflow-hidden">
        <DialogHeader className="border-b pb-4 px-6 pt-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">Edit Retreat</DialogTitle>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={handleSave} 
                disabled={isLoading}
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Saving..." : "Save"}
              </Button>
              <Button 
                onClick={handlePublish} 
                disabled={isLoading}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                🚀 {isLoading ? "Publishing..." : "Publish"}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6">
          <div className="space-y-8 py-6">
            {/* Basic Info Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                📄 Basic Information
              </h3>
              
              {/* Public/Private Visibility Checkbox */}
              <Card className="border-l-4 border-l-blue-500 bg-blue-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-blue-800 flex items-center gap-2">
                    🌐 Retreat Visibility
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="makePublic"
                      checked={currentRetreat.isPublic}
                      onChange={(e) => setCurrentRetreat(prev => ({ ...prev, isPublic: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="makePublic" className="text-sm font-medium text-gray-900">
                      Make Retreat Public
                    </label>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {currentRetreat.isPublic 
                      ? "✅ Will appear on homepage and retreat directory when published" 
                      : "🔒 Will only be accessible via direct link when published"}
                  </p>
                  {!canOpenApplications() && currentRetreat.isPublic && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        ⚠️ Add at least one ticket tier before publishing publicly
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Retreat Name</Label>
                    <Input
                      value={currentRetreat.name}
                      onChange={(e) => setCurrentRetreat(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter retreat name"
                    />
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input
                      value={currentRetreat.location}
                      onChange={(e) => setCurrentRetreat(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Retreat location"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={currentRetreat.startDate}
                      onChange={(e) => setCurrentRetreat(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={currentRetreat.endDate}
                      onChange={(e) => setCurrentRetreat(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={currentRetreat.description}
                    onChange={(e) => setCurrentRetreat(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your retreat..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Cover Image</Label>
                  <div className="flex items-center gap-4">
                    {currentRetreat.image && (
                      <img 
                        src={currentRetreat.image} 
                        alt="Cover" 
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Change Image
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Extended Description Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                📖 More About This Retreat
              </h3>
              <p className="text-sm text-muted-foreground">
                Create a rich storytelling format with text, headings, images, and lists to showcase your retreat experience.
              </p>
              
              <UnifiedContentEditor
                blocks={currentRetreat.extendedContent}
                onChange={(blocks) => setCurrentRetreat(prev => ({ ...prev, extendedContent: blocks }))}
                placeholder="Tell the story of your retreat. What makes it special? What can participants expect?"
              />
            </div>

            {/* Daily Agenda Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                  🗓 Daily Agenda
                </h3>
                <Button onClick={addDailyAgenda} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Day
                </Button>
              </div>

              <div className="space-y-4">
                {currentRetreat.agenda.map((agenda) => (
                  <Card key={agenda.id} className="border-l-4 border-l-primary">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-base">Day {agenda.day}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDailyAgenda(agenda.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Date</Label>
                          <Input
                            type="date"
                            value={agenda.date}
                            onChange={(e) => updateDailyAgenda(agenda.id, { date: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Day Title</Label>
                          <Input
                            value={agenda.title}
                            onChange={(e) => updateDailyAgenda(agenda.id, { title: e.target.value })}
                            placeholder="e.g., Arrival & Welcome"
                          />
                        </div>
                      </div>

                      {/* Activities */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">Activities</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addActivity(agenda.id)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Activity
                          </Button>
                        </div>
                        {agenda.activities.map((activity) => (
                          <div key={activity.id} className="border rounded-lg p-3 space-y-2 bg-muted/20">
                            <div className="flex items-center gap-2">
                              <Input
                                type="time"
                                value={activity.time}
                                onChange={(e) => updateActivity(agenda.id, activity.id, { time: e.target.value })}
                                className="w-32"
                              />
                              <Input
                                value={activity.title}
                                onChange={(e) => updateActivity(agenda.id, activity.id, { title: e.target.value })}
                                placeholder="Activity name"
                                className="flex-1"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeActivity(agenda.id, activity.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <Input
                              value={activity.description}
                              onChange={(e) => updateActivity(agenda.id, activity.id, { description: e.target.value })}
                              placeholder="Activity description"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Application Form & Ticket Tiers Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                    📥 Application Form & Tickets
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Set up ticket tiers and customize your application form
                  </p>
                </div>
              </div>

              {/* Pre-filled Fields Info */}
              <Card className="border-l-4 border-l-green-500 bg-green-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-green-800 flex items-center gap-2">
                    ✅ Automatically Collected Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Required</Badge>
                      <span className="font-medium">Full Name</span>
                      <span className="text-sm text-muted-foreground">- Collected from user's account</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Required</Badge>
                      <span className="font-medium">Email Address</span>
                      <span className="text-sm text-muted-foreground">- Collected from user's account</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    These fields are automatically filled when users apply and cannot be edited.
                  </p>
                </CardContent>
              </Card>

              {/* Ticket Tiers */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-semibold text-foreground flex items-center gap-2">
                    🎟 Ticket Tiers
                    <Badge variant="destructive" className="text-xs">Required</Badge>
                  </h4>
                  <Button onClick={addTicketTier} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Ticket Tier
                  </Button>
                </div>

                {currentRetreat.ticketTiers.length === 0 && (
                  <Card className="border-2 border-dashed border-destructive/30 bg-destructive/5">
                    <CardContent className="p-6 text-center">
                      <p className="text-destructive font-medium">At least one ticket tier is required</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add a ticket tier to allow people to apply for your retreat
                      </p>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-4">
                  {currentRetreat.ticketTiers.map((tier) => (
                    <Card key={tier.id} className="border-l-4 border-l-secondary">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base">
                          {tier.name || "New Tier"}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTicketTier(tier.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label>Tier Name</Label>
                            <Input
                              value={tier.name}
                              onChange={(e) => updateTicketTier(tier.id, { name: e.target.value })}
                              placeholder="Early Bird, Regular, VIP..."
                            />
                          </div>
                          <div>
                            <Label>Price ($)</Label>
                            <Input
                              type="number"
                              value={tier.price === 0 ? '' : tier.price}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '') {
                                  updateTicketTier(tier.id, { price: 0 });
                                } else {
                                  const numValue = parseFloat(value);
                                  if (!isNaN(numValue)) {
                                    updateTicketTier(tier.id, { price: numValue });
                                  }
                                }
                              }}
                              onBlur={(e) => {
                                const value = parseFloat(e.target.value);
                                updateTicketTier(tier.id, { price: isNaN(value) ? 0 : value });
                              }}
                              placeholder="Enter price"
                            />
                          </div>
                          <div>
                            <Label>Number of Tickets</Label>
                            <Input
                              type="number"
                              value={tier.quantity === 0 ? '' : tier.quantity}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '') {
                                  updateTicketTier(tier.id, { quantity: 0 });
                                } else {
                                  const numValue = parseInt(value);
                                  if (!isNaN(numValue)) {
                                    updateTicketTier(tier.id, { quantity: numValue });
                                  }
                                }
                              }}
                              onBlur={(e) => {
                                const value = parseInt(e.target.value);
                                updateTicketTier(tier.id, { quantity: isNaN(value) ? 0 : value });
                              }}
                              placeholder="Enter number of tickets"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>What's Included</Label>
                          <Textarea
                            value={tier.description}
                            onChange={(e) => updateTicketTier(tier.id, { description: e.target.value })}
                            placeholder="Describe what's included in this tier..."
                            rows={3}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Custom Questions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-semibold text-foreground flex items-center gap-2">
                    ❓ Custom Questions
                    <Badge variant="secondary" className="text-xs">Optional</Badge>
                  </h4>
                  <Button onClick={addApplicationField} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </div>

                {currentRetreat.applicationForm.length === 0 && (
                  <Card className="border-2 border-dashed border-border">
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground">No custom questions yet</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add custom questions to learn more about your applicants (optional)
                      </p>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-4">
                  {currentRetreat.applicationForm.map((field) => (
                    <Card key={field.id} className="border-l-4 border-l-accent">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base">
                          {field.label || "New Question"}
                          {field.required && <Badge className="ml-2 bg-primary/10 text-primary">Required</Badge>}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeApplicationField(field.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Field Type</Label>
                            <Select 
                              value={field.type} 
                              onValueChange={(value: 'text' | 'multiple_choice' | 'short_answer') => 
                                updateApplicationField(field.id, { type: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select field type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="short_answer">Short Answer</SelectItem>
                                <SelectItem value="text">Long Text</SelectItem>
                                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Question</Label>
                            <Input
                              value={field.label}
                              onChange={(e) => updateApplicationField(field.id, { label: e.target.value })}
                              placeholder="Enter your question"
                            />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`required-${field.id}`}
                            checked={field.required}
                            onChange={(e) => updateApplicationField(field.id, { required: e.target.checked })}
                            className="rounded border-input"
                          />
                          <label htmlFor={`required-${field.id}`} className="text-sm">Required field</label>
                        </div>
                        {field.type === 'multiple_choice' && (
                          <div>
                            <Label>Answer Options</Label>
                            <TagInput
                              tags={field.options || []}
                              onTagsChange={(options) => updateApplicationField(field.id, { options })}
                              placeholder="Type an answer option and press Enter"
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Custom Retreat Link Section */}
              <div className="px-6 py-4">
                <div>
                  <Label>Custom Retreat Link (optional)</Label>
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-muted-foreground mr-2">retreatme.me/r/</span>
                    <Input
                      value={customSlug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      placeholder="your-custom-link"
                      className={slugError ? "border-destructive" : ""}
                    />
                  </div>
                  {slugError && (
                    <p className="text-sm text-destructive mt-1">{slugError}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Create a custom URL for your retreat. Leave blank to auto-generate.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Action Buttons */}
        <div className="border-t p-6 bg-gray-50">
          <div className="flex items-center justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={handleSave} 
              disabled={isLoading}
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? "Saving..." : "Save"}
            </Button>
            <Button 
              onClick={handlePublish} 
              disabled={isLoading}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              🚀 {isLoading ? "Publishing..." : "Publish"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};