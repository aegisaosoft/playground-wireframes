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
  let message = "I understand! ";
  let confidence: 'high' | 'medium' | 'low' = 'medium';

  // Extract title
  if (input.includes('retreat') || input.includes('workshop') || input.includes('event')) {
    const titleBlock = updatedBlocks.find(b => b.type === 'title');
    if (titleBlock && !titleBlock.data.text) {
      titleBlock.data.text = userInput.split(/\s+/).slice(0, 5).join(' ');
      message += "I've set your experience title. ";
      confidence = 'high';
    }
  }

  // Extract location
  const cities = ['bali', 'lisbon', 'paris', 'tokyo', 'new york', 'london', 'barcelona'];
  const foundCity = cities.find(city => input.includes(city));
  if (foundCity) {
    const locationBlock = updatedBlocks.find(b => b.type === 'location');
    if (locationBlock) {
      locationBlock.data.city = foundCity.charAt(0).toUpperCase() + foundCity.slice(1);
      message += `Location set to ${locationBlock.data.city}. `;
      confidence = 'high';
    }
  }

  // Add description
  if (input.length > 50 && !updatedBlocks.find(b => b.type === 'richText')) {
    updatedBlocks.push({
      id: `richText-${Date.now()}`,
      type: 'richText',
      data: { content: userInput },
      order: updatedBlocks.length,
    });
    message += "I've added your description. ";
  }

  if (updatedBlocks.length === currentBlocks.length) {
    message = "I'm processing that. Could you provide more details about the dates, location, or what's included in your experience?";
    return { message, confidence: 'low' as const, updatedBlocks: null };
  }

  message += "What else would you like to add?";
  return { message, confidence, updatedBlocks };
}

export default ExperienceBuilderChat;