import React, { useState, useCallback, useEffect } from 'react';
import { ChatInterface } from '@/components/ExperienceBuilder/ChatInterface';
import { LivePreview } from '@/components/ExperienceBuilder/LivePreview';
import { Block, BlockType } from '@/types/experienceBuilder';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  confidence?: 'high' | 'medium' | 'low';
}

const ExperienceBuilderChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'll help you create an amazing experience. Tell me about your event - when and where is it happening? What's included? Who's it for?",
      timestamp: new Date(),
    }
  ]);
  const [blocks, setBlocks] = useState<Block[]>([
    {
      id: 'title-default',
      type: 'title',
      data: { text: '' },
      order: 0,
    },
    {
      id: 'dates-default',
      type: 'dates',
      data: { startDate: null, endDate: null },
      order: 1,
    },
    {
      id: 'location-default',
      type: 'location',
      data: { city: '', country: '' },
      order: 2,
    },
  ]);
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setInterval(() => {
      // Auto-save logic here
      console.log('Auto-saving...', blocks);
    }, 5000);

    return () => clearInterval(autoSave);
  }, [blocks]);

  const handleSendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // TODO: Call AI edge function once Lovable Cloud is enabled
    // For now, simulate AI response with basic parsing
    setTimeout(() => {
      const response = simulateAIResponse(content, blocks);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        confidence: response.confidence,
      };

      setMessages(prev => [...prev, aiMessage]);
      
      if (response.updatedBlocks) {
        setBlocks(response.updatedBlocks);
        toast({
          title: "Experience updated",
          description: "Check the preview on the right",
        });
      }
      
      setIsLoading(false);
    }, 1000);
  }, [blocks, toast]);

  const handleUploadFiles = useCallback((files: FileList) => {
    toast({
      title: "Files uploaded",
      description: `Processing ${files.length} file(s)...`,
    });
    
    // TODO: Implement file processing
    const fileNames = Array.from(files).map(f => f.name).join(', ');
    handleSendMessage(`I've uploaded these files: ${fileNames}`);
  }, [handleSendMessage]);

  const handlePasteLink = useCallback((url: string) => {
    toast({
      title: "Link added",
      description: "Extracting information...",
    });
    
    // TODO: Implement link parsing
    handleSendMessage(`Can you extract details from this link: ${url}`);
  }, [handleSendMessage]);

  const handleSaveDraft = useCallback(() => {
    toast({
      title: "Draft saved",
      description: "Your experience has been saved",
    });
    console.log('Saving draft:', blocks);
  }, [blocks, toast]);

  const handlePublish = useCallback(() => {
    const titleBlock = blocks.find(b => b.type === 'title');
    const datesBlock = blocks.find(b => b.type === 'dates');
    const locationBlock = blocks.find(b => b.type === 'location');

    if (!titleBlock?.data.text || !datesBlock?.data.startDate || !locationBlock?.data.city) {
      toast({
        title: "Missing required fields",
        description: "Please add title, dates, and location to publish",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Experience published!",
      description: "Your experience is now live",
    });
    console.log('Publishing:', { blocks, isPublic });
  }, [blocks, isPublic, toast]);

  return (
    <div className="h-screen flex">
      {/* Left: Chat Interface */}
      <div className="w-1/2">
        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          onUploadFiles={handleUploadFiles}
          onPasteLink={handlePasteLink}
          isLoading={isLoading}
        />
      </div>

      {/* Right: Live Preview */}
      <div className="w-1/2">
        <LivePreview
          blocks={blocks}
          isPublic={isPublic}
          onToggleVisibility={() => setIsPublic(!isPublic)}
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
          onBack={() => navigate('/organizer-dashboard')}
        />
      </div>
    </div>
  );
};

// Temporary AI simulation until Lovable Cloud is enabled
function simulateAIResponse(userInput: string, currentBlocks: Block[]): {
  message: string;
  confidence: 'high' | 'medium' | 'low';
  updatedBlocks: Block[] | null;
} {
  const input = userInput.toLowerCase();
  let updatedBlocks = [...currentBlocks];
  let message = "";
  let confidence: 'high' | 'medium' | 'low' = 'medium';
  let hasChanges = false;

  // Extract title - look for experience, retreat, workshop, event keywords
  if ((input.includes('retreat') || input.includes('workshop') || input.includes('event') || input.includes('experience')) && input.length < 100) {
    const titleBlock = updatedBlocks.find(b => b.type === 'title');
    if (titleBlock && !titleBlock.data.text) {
      titleBlock.data.text = userInput.split(/\s+/).slice(0, 6).join(' ');
      message += "Got it! I've set your title. ";
      confidence = 'high';
      hasChanges = true;
    }
  }

  // Extract dates - look for patterns like "jan 1st till 10th", "march 15-20", "15-20 march"
  const datePatterns = [
    /(\w+)\s+(\d+)(?:st|nd|rd|th)?\s+(?:till|to|until|-)\s+(\d+)(?:st|nd|rd|th)?/,
    /(\d+)(?:st|nd|rd|th)?\s*-\s*(\d+)(?:st|nd|rd|th)?\s+(\w+)/,
    /(\w+)\s+(\d+)\s*-\s*(\d+)/
  ];
  
  for (const pattern of datePatterns) {
    const match = input.match(pattern);
    if (match) {
      const datesBlock = updatedBlocks.find(b => b.type === 'dates');
      if (datesBlock && !datesBlock.data.startDate) {
        // Simple date construction for demo - in real app would use proper date parsing
        const currentYear = new Date().getFullYear();
        datesBlock.data.startDate = `${currentYear}-01-01`;
        datesBlock.data.endDate = `${currentYear}-01-10`;
        message += "Dates captured! ";
        confidence = 'high';
        hasChanges = true;
        break;
      }
    }
  }

  // Extract location - look for cities
  const cities = ['bali', 'lisbon', 'paris', 'tokyo', 'new york', 'london', 'barcelona', 'miami', 'tulum', 'ibiza'];
  const foundCity = cities.find(city => input.includes(city));
  if (foundCity) {
    const locationBlock = updatedBlocks.find(b => b.type === 'location');
    if (locationBlock && !locationBlock.data.city) {
      locationBlock.data.city = foundCity.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      message += `Location set to ${locationBlock.data.city}. `;
      confidence = 'high';
      hasChanges = true;
    }
  }

  // Add longer descriptions as rich text
  if (input.length > 40 && !updatedBlocks.find(b => b.type === 'richText')) {
    updatedBlocks.push({
      id: `richText-${Date.now()}`,
      type: 'richText',
      data: { content: userInput },
      order: updatedBlocks.length,
    });
    message += "I've added your description. ";
    hasChanges = true;
  }

  // If nothing was extracted, provide helpful guidance
  if (!hasChanges) {
    const titleBlock = updatedBlocks.find(b => b.type === 'title');
    const datesBlock = updatedBlocks.find(b => b.type === 'dates');
    const locationBlock = updatedBlocks.find(b => b.type === 'location');
    
    const missing = [];
    if (!titleBlock?.data.text) missing.push('title');
    if (!datesBlock?.data.startDate) missing.push('dates');
    if (!locationBlock?.data.city) missing.push('location');
    
    if (missing.length > 0) {
      message = `Thanks! To get started, I still need: ${missing.join(', ')}. What can you tell me about ${missing[0]}?`;
    } else {
      message = "Great! What else would you like to add? (pricing, highlights, agenda, etc.)";
    }
    return { message, confidence: 'low' as const, updatedBlocks: null };
  }

  // Check what's still missing
  const titleBlock = updatedBlocks.find(b => b.type === 'title');
  const datesBlock = updatedBlocks.find(b => b.type === 'dates');
  const locationBlock = updatedBlocks.find(b => b.type === 'location');
  
  const stillMissing = [];
  if (!titleBlock?.data.text) stillMissing.push('title');
  if (!datesBlock?.data.startDate) stillMissing.push('dates');
  if (!locationBlock?.data.city) stillMissing.push('location');
  
  if (stillMissing.length > 0) {
    message += `What about ${stillMissing[0]}?`;
  } else {
    message += "Looking good! Want to add pricing, highlights, or an agenda?";
  }
  
  return { message, confidence, updatedBlocks };
}

export default ExperienceBuilderChat;