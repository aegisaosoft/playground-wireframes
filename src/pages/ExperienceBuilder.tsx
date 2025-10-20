import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '@/components/ExperienceBuilder/TopBar';
import { BlockPalette } from '@/components/ExperienceBuilder/BlockPalette';
import { Canvas } from '@/components/ExperienceBuilder/Canvas';
import { SettingsSidebar } from '@/components/ExperienceBuilder/SettingsSidebar';
import { HostData } from '@/components/ExperienceBuilder/HostSelector';
import { Block, BlockType } from '@/types/experienceBuilder';
import { VoiceExperienceDraft } from '@/types/voiceExperienceCreation';
import { VoiceExperienceModal } from '@/components/VoiceExperienceCreation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { experiencesService, CreateExperienceRequest } from '@/services/experiences.service';
import { useUser } from '@/contexts/UserContext';

const ExperienceBuilder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // 🛡️ TITLE BLOCK - PERSISTENT AND SEPARATE FROM OTHER BLOCKS
  const [titleData, setTitleData] = useState({ text: '', category: '' });
  
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
      data: { location: '' },
      order: 2,
    },
  ]);
  const [isPublic, setIsPublic] = useState(false);
  const [title, setTitle] = useState('');
  const [showVoiceBanner, setShowVoiceBanner] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  // User context
  const { user, isLoading: isLoadingUser, isAuthenticated } = useUser();
  
  const [selectedHost, setSelectedHost] = useState<HostData>(() => {
    // Initialize with default values
    return {
      type: 'personal',
      name: 'User',
    };
  });

  const [highlightedBlockId, setHighlightedBlockId] = useState<string | null>(null);
  const blockRefsMap = useRef<Map<string, HTMLDivElement>>(new Map());

  // Apply user-specific default settings
  const applyUserDefaults = useCallback((profile: any) => {
    
    // Set default category based on user role or preferences
    if (profile.role === 'admin') {
      setTitleData(prev => ({
        ...prev,
        category: 'Professional'
      }));
    }
    
    // Set default visibility based on user preferences
    // For now, default to private for new users
    setIsPublic(false);
    
    // Set default location if user has a preferred location
    // This could be expanded to load from user preferences
    setBlocks(prev => {
      const locationBlock = prev.find(b => b.id === 'location-default');
      if (locationBlock && !locationBlock.data.location) {
        // Could set default location based on user profile or preferences
        // For now, leave empty for user to fill
      }
      return prev;
    });
    
  }, []);

  // Update selected host when user data loads
  useEffect(() => {
    if (user) {
      setSelectedHost({
        type: 'personal',
        name: user.name,
      });
      
      // Apply user-specific default settings
      applyUserDefaults(user);
      
    }
  }, [user, applyUserDefaults]);



  // Check for voice draft on load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromVoice = urlParams.get('fromVoice');
    
    if (fromVoice === 'true') {
      const storedDraft = localStorage.getItem('voiceExperienceDraft');
      if (storedDraft) {
        try {
          const draft: VoiceExperienceDraft = JSON.parse(storedDraft);
          prefillFromVoice(draft);
          setShowVoiceBanner(true);
          localStorage.removeItem('voiceExperienceDraft');
          // Clean up URL
          window.history.replaceState({}, '', '/experience-builder');
        } catch (error) {
        }
      }
    }
  }, []);

  const prefillFromVoice = useCallback((draft: VoiceExperienceDraft) => {
    // Update basic info
    setTitle(draft.title);
    setIsPublic(draft.visibility === 'public');
    
    // Update title data (separate from blocks array)
    setTitleData({ text: draft.title, category: draft.category || '' });

    // Start with existing blocks and update core blocks with voice data
    const newBlocks: Block[] = [...blocks];
    
    // Update title block
    const titleBlockIndex = newBlocks.findIndex(b => b.id === 'title-default');
    if (titleBlockIndex >= 0) {
      newBlocks[titleBlockIndex] = {
        ...newBlocks[titleBlockIndex],
        data: { text: draft.title, category: draft.category || '' }
      };
    }
    
    // Update dates block
    const datesBlockIndex = newBlocks.findIndex(b => b.id === 'dates-default');
    if (datesBlockIndex >= 0) {
      newBlocks[datesBlockIndex] = {
        ...newBlocks[datesBlockIndex],
        data: { 
          startDate: draft.dates.startDate, 
          endDate: draft.dates.endDate 
        }
      };
    }
    
    // Update location block
    const locationBlockIndex = newBlocks.findIndex(b => b.id === 'location-default');
    if (locationBlockIndex >= 0) {
      newBlocks[locationBlockIndex] = {
        ...newBlocks[locationBlockIndex],
        data: { 
          location: `${draft.location.city}, ${draft.location.country}` 
        }
      };
    }

    let blockOrder = 3;

    // Update description block if available
    if (draft.description) {
      const descriptionBlockIndex = newBlocks.findIndex(b => b.id === 'richText-default');
      if (descriptionBlockIndex >= 0) {
        newBlocks[descriptionBlockIndex] = {
          ...newBlocks[descriptionBlockIndex],
          data: { content: draft.description }
        };
      } else {
        // If no default richText block exists, create a new one
        newBlocks.push({
          id: `richText-${Date.now()}`,
          type: 'richText',
          data: { content: draft.description },
          order: blockOrder++,
        });
      }
    }

    // Add agenda days
    draft.agendaDays.forEach((day, index) => {
      newBlocks.push({
        id: `agendaDay-${Date.now()}-${index}`,
        type: 'agendaDay',
        data: {
          date: null, // Let user select the actual date
          items: day.items
        },
        order: blockOrder++,
      });
    });

    // Add ticket tiers
    if (draft.ticketTiers.length > 0) {
      newBlocks.push({
        id: `tickets-${Date.now()}`,
        type: 'tickets',
        data: { tiers: draft.ticketTiers },
        order: blockOrder++,
      });
    }

    // Add CTA
    newBlocks.push({
      id: `cta-${Date.now()}`,
      type: 'cta',
      data: { text: draft.ctaText, style: 'primary' },
      order: blockOrder++,
    });

    setBlocks(newBlocks);
  }, [toast]);

  const handleVoicePrefill = useCallback((draft: VoiceExperienceDraft) => {
    prefillFromVoice(draft);
    setShowVoiceBanner(true);
    setShowVoiceModal(false);
  }, [prefillFromVoice]);

  // ✅ Delete gallery image handler for create page (no API call needed)
  const handleDeleteGalleryImage = useCallback(async (imageId: string) => {
    // For create page, we don't need to call the API since images haven't been saved yet
    // The GalleryBlock will handle the local state removal
    return Promise.resolve();
  }, []);

  const handleVoiceCreate = () => {
    setShowVoiceModal(true);
  };

  // Define block order as they appear in palette
  const blockOrder: BlockType[] = [
    'image',
    'title', 
    'dates',
    'location',
    'richText',
    'tickets',
    'highlights',
    'agendaDay',
    'logistics',
    'gallery',
    'faq',
    'resources',
    'cta'
  ];

  const getInsertPosition = useCallback((type: BlockType) => {
    const typeOrder = blockOrder.indexOf(type);
    if (typeOrder === -1) return blocks.length;
    
    // Find the correct position based on block order
    for (let i = blocks.length - 1; i >= 0; i--) {
      const currentBlockOrder = blockOrder.indexOf(blocks[i].type);
      if (currentBlockOrder !== -1 && currentBlockOrder < typeOrder) {
        return i + 1;
      }
    }
    return 0;
  }, [blocks]);

  const scrollToBlockType = useCallback((type: BlockType) => {
    // Find existing block of this type
    const existingBlock = blocks.find(block => block.type === type);
    
    if (existingBlock) {
      // Scroll to existing block
      const blockElement = blockRefsMap.current.get(existingBlock.id);
      if (blockElement) {
        blockElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlightedBlockId(existingBlock.id);
        setTimeout(() => setHighlightedBlockId(null), 2000);
      }
    } else {
      // Create new block at correct position
      const insertPosition = getInsertPosition(type);
      const newBlock: Block = {
        id: `${type}-${Date.now()}`,
        type,
        data: getDefaultBlockData(type),
        order: insertPosition,
      };
      setBlocks(prev => [...prev, newBlock]);
      
      // Wait for next render to scroll
      setTimeout(() => {
        const blockElement = blockRefsMap.current.get(newBlock.id);
        if (blockElement) {
          blockElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setHighlightedBlockId(newBlock.id);
          setTimeout(() => setHighlightedBlockId(null), 2000);
        }
      }, 100);
    }
  }, [blocks, getInsertPosition]);

  const addBlock = useCallback((type: BlockType) => {
    setBlocks(prev => {
      // Check if this is a core block type that should only exist once
      const coreBlockTypes = ['title', 'dates', 'location', 'richText', 'image'];
      
      if (coreBlockTypes.includes(type)) {
        // For core blocks, check if one already exists
        const existingBlockIndex = prev.findIndex(b => b.id === `${type}-default`);
        
        if (existingBlockIndex >= 0) {
          // Keep existing block unchanged
          return prev;
        }
      }
      
      // For non-core blocks or when core block doesn't exist, create new block
      const newBlock: Block = {
        id: coreBlockTypes.includes(type) ? `${type}-default` : `${type}-${Date.now()}`,
        type,
        data: getDefaultBlockData(type),
        order: blocks.length,
      };
      
      return [...prev, newBlock];
    });
  }, [blocks.length]);

  const updateBlock = useCallback((id: string, data: any) => {
    setBlocks(prev => {
      const result = prev.map(block => {
        if (block.id === id) {
          return { ...block, data: { ...block.data, ...data } };
        }
        return block;
      });
      return result;
    });
  }, []);

  const deleteBlock = useCallback((id: string) => {
    // Prevent deletion of core blocks
    const coreBlocks = ['image-default', 'title-default', 'dates-default', 'location-default', 'richText-default'];
    if (coreBlocks.includes(id)) return;
    
    setBlocks(prev => prev.filter(block => block.id !== id));
  }, []);

  const duplicateBlock = useCallback((id: string) => {
    const blockToDuplicate = blocks.find(block => block.id === id);
    if (blockToDuplicate) {
      const newBlock: Block = {
        ...blockToDuplicate,
        id: `${blockToDuplicate.type}-${Date.now()}`,
        order: blocks.length,
      };
      setBlocks(prev => [...prev, newBlock]);
    }
  }, [blocks]);

  const reorderBlocks = useCallback((dragIndex: number, hoverIndex: number) => {
    
    // ✅ VALIDATE INDICES
    if (isNaN(dragIndex) || isNaN(hoverIndex)) {
      return;
    }
    
    setBlocks(prev => {
      // ✅ VALIDATE INDEX BOUNDS
      if (dragIndex < 0 || dragIndex >= prev.length) {
        return prev;
      }
      if (hoverIndex < 0 || hoverIndex >= prev.length) {
        return prev;
      }
      
      const newBlocks = [...prev];
      const draggedBlock = newBlocks[dragIndex];
      
      // ✅ VALIDATE DRAGGED BLOCK
      if (!draggedBlock) {
        return prev;
      }
      
      newBlocks.splice(dragIndex, 1);
      newBlocks.splice(hoverIndex, 0, draggedBlock);
      const result = newBlocks.map((block, index) => ({ ...block, order: index }));
      return result;
    });
  }, []);

  const handleSaveDraft = useCallback(async () => {
    try {
      // Extract data from blocks (title is now separate)
      const datesBlock = blocks.find(b => b.type === 'dates');
      const locationBlock = blocks.find(b => b.type === 'location');
      const richTextBlocks = blocks.filter(b => b.type === 'richText');
      const ticketsBlock = blocks.find(b => b.type === 'tickets');
      const imageBlock = blocks.find(b => b.type === 'image');
      const agendaBlocks = blocks.filter(b => b.type === 'agendaDay');
      const highlightsBlock = blocks.find(b => b.type === 'highlights');
      const faqBlock = blocks.find(b => b.type === 'faq');
      const resourcesBlock = blocks.find(b => b.type === 'resources');
      const logisticsBlock = blocks.find(b => b.type === 'logistics');
      const ctaBlock = blocks.find(b => b.type === 'cta');

      // For draft, we can be more lenient with validation
      const titleBlock = blocks.find(b => b.type === 'title');
      const titleText = titleBlock?.data?.text || titleData.text;
      
      if (!titleText || titleText.trim().length < 3) {
        toast({
          title: "Title Required",
          description: "Please add a title (minimum 3 characters) to save your draft",
          variant: "destructive",
        });
        return;
      }

      // Use default values for missing required fields
      const description = richTextBlocks
        .map(b => b.data?.content || '')
        .join('\n\n')
        .trim() || 'Draft experience - description to be added';

      // Transform agenda blocks to agenda items format
      const agendaItems: any[] = [];
      agendaBlocks.forEach((block, blockIndex) => {
        const blockData = block.data as { date: Date | null; items: Array<{ time: string; activity: string }> };
        if (blockData.items && blockData.items.length > 0) {
          blockData.items.forEach((item, itemIndex) => {
            agendaItems.push({
              dayNumber: blockIndex + 1,
              dayTitle: blockData.date ? blockData.date.toLocaleDateString() : `Day ${blockIndex + 1}`,
              timeSlot: item.time,
              activity: item.activity,
              description: '',
              displayOrder: itemIndex
            });
          });
        }
      });

      // Extract highlights
      const highlights = highlightsBlock?.data?.highlights ? 
        highlightsBlock.data.highlights.map((item: any) => item.text || item) : [];

      const createRequest: CreateExperienceRequest = {
        title: titleText,
        description: description,
        shortDescription: description.substring(0, 200) + (description.length > 200 ? '...' : ''),
        location: locationBlock?.data?.location || 'Location to be specified',
        city: '',
        country: '',
        startDate: datesBlock?.data?.startDate ? 
          (datesBlock.data.startDate instanceof Date ? 
            datesBlock.data.startDate.toISOString().split('T')[0] : 
            new Date(datesBlock.data.startDate).toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
        endDate: datesBlock?.data?.endDate ? 
          (datesBlock.data.endDate instanceof Date ? 
            datesBlock.data.endDate.toISOString().split('T')[0] : 
            new Date(datesBlock.data.endDate).toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
        basePriceCents: (ticketsBlock?.data?.tiers?.[0]?.price || 0) * 100,
        totalCapacity: ticketsBlock?.data?.tiers?.[0]?.quantity || 10,
        status: 'draft',
        isFeatured: false,
        currency: 'USD',
        timezone: 'UTC',
        categorySlug: titleData.category || 'tech',
        // Host information
        hostId: selectedHost.id,
        hostType: selectedHost.type,
        agendaItems: agendaItems.length > 0 ? agendaItems : undefined,
        highlights: highlights.length > 0 ? highlights : undefined,
        ticketTiers: ticketsBlock?.data?.tiers && ticketsBlock.data.tiers.length > 0 ? 
          ticketsBlock.data.tiers.map((tier: any, index: number) => ({
            name: tier.name || 'Standard Ticket',
            description: tier.description || '',
            price: tier.price || 0,
            quantity: tier.quantity || 10,
            benefits: tier.benefits || [],
            isPopular: tier.isPopular || false,
            displayOrder: index
          })) : undefined,
        faqItems: faqBlock?.data?.items && faqBlock.data.items.length > 0 ?
          faqBlock.data.items.map((item: any, index: number) => ({
            question: item.question || '',
            answer: item.answer || '',
            displayOrder: index
          })) : undefined,
        resources: resourcesBlock?.data?.resources && resourcesBlock.data.resources.length > 0 ?
          resourcesBlock.data.resources.map((item: any, index: number) => ({
            title: item.title || '',
            url: item.url || '',
            description: item.description || '',
            type: item.type || 'link',
            displayOrder: index
          })) : undefined,
        // Logistics information
        meetupInstructions: logisticsBlock?.data?.meetupInstructions,
        checkInNotes: logisticsBlock?.data?.checkInNotes,
        emergencyContactName: logisticsBlock?.data?.emergencyContact?.name,
        emergencyContactPhone: logisticsBlock?.data?.emergencyContact?.phone,
        additionalInfo: logisticsBlock?.data?.additionalInfo
      };

      // Extract featured image file if exists
      const featuredImageFile = imageBlock?.data?.file as File | undefined;

      if (featuredImageFile) {
        formData.append('featuredImage', featuredImageFile);
      }

      // Extract gallery images with alt texts
      const galleryBlock = blocks.find(b => b.type === 'gallery');
      const galleryFiles: File[] = [];
      const galleryAlts: string[] = [];
      
      if (galleryBlock?.data?.images && Array.isArray(galleryBlock.data.images)) {
        galleryBlock.data.images.forEach((img: any) => {
          if (img.file) {
            galleryFiles.push(img.file);
            galleryAlts.push(img.alt || '');
          }
        });
      }

      // Save draft via API
      const savedExperience = await experiencesService.create(createRequest, featuredImageFile, galleryFiles, galleryAlts);

    } catch (error) {
      toast({
        title: "Error Saving Draft",
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
      });
    }
  }, [blocks, toast]);

  const handlePublish = useCallback(async () => {
    try {
      // Extract data from blocks (title is now separate)
      const datesBlock = blocks.find(b => b.type === 'dates');
      const locationBlock = blocks.find(b => b.type === 'location');
      const richTextBlocks = blocks.filter(b => b.type === 'richText');
      const ticketsBlock = blocks.find(b => b.type === 'tickets');
      const imageBlock = blocks.find(b => b.type === 'image');
      const agendaBlocks = blocks.filter(b => b.type === 'agendaDay');
      const highlightsBlock = blocks.find(b => b.type === 'highlights');
      const faqBlock = blocks.find(b => b.type === 'faq');
      const resourcesBlock = blocks.find(b => b.type === 'resources');
      const logisticsBlock = blocks.find(b => b.type === 'logistics');

      // Validate required fields
      const titleBlock = blocks.find(b => b.type === 'title');
      const titleText = titleBlock?.data?.text || titleData.text;
      
      if (!titleText || titleText.trim().length < 3) {
        toast({
          title: "Title Required",
          description: "Please add a title to your experience (minimum 3 characters)",
          variant: "destructive",
        });
        return;
      }

      if (!datesBlock?.data?.startDate || !datesBlock?.data?.endDate) {
        toast({
          title: "Dates Required",
          description: "Please add start and end dates to your experience",
          variant: "destructive",
        });
        return;
      }

      if (!locationBlock?.data?.location || locationBlock.data.location.trim().length < 3) {
        toast({
          title: "Location Required",
          description: "Please add a location to your experience",
          variant: "destructive",
        });
        return;
      }

      // Combine all rich text content for description
      const description = richTextBlocks
        .map(b => b.data?.content || '')
        .join('\n\n')
        .trim() || 'No description provided';

      // Get base price from tickets block
      const basePrice = ticketsBlock?.data?.tiers?.[0]?.price || 0;

      // Transform agenda blocks to agenda items format
      const agendaItems: any[] = [];
      agendaBlocks.forEach((block, blockIndex) => {
        const blockData = block.data as { date: Date | null; items: Array<{ time: string; activity: string }> };
        if (blockData.items && blockData.items.length > 0) {
          blockData.items.forEach((item, itemIndex) => {
            agendaItems.push({
              dayNumber: blockIndex + 1,
              dayTitle: blockData.date ? blockData.date.toLocaleDateString() : `Day ${blockIndex + 1}`,
              timeSlot: item.time,
              activity: item.activity,
              description: '',
              displayOrder: itemIndex
            });
          });
        }
      });

      // Extract highlights
      const highlights = highlightsBlock?.data?.highlights ? 
        highlightsBlock.data.highlights.map((item: any) => item.text || item) : [];

      // Create experience request - Always publish when using handlePublish
      const createRequest: CreateExperienceRequest = {
        title: titleText,
        description: description,
        shortDescription: description.substring(0, 200) + (description.length > 200 ? '...' : ''),
        location: locationBlock.data.location,
        city: '',
        country: '',
        startDate: datesBlock.data.startDate ? 
          (datesBlock.data.startDate instanceof Date ? 
            datesBlock.data.startDate.toISOString().split('T')[0] : 
            new Date(datesBlock.data.startDate).toISOString().split('T')[0]) : '',
        endDate: datesBlock.data.endDate ? 
          (datesBlock.data.endDate instanceof Date ? 
            datesBlock.data.endDate.toISOString().split('T')[0] : 
            new Date(datesBlock.data.endDate).toISOString().split('T')[0]) : '',
        basePriceCents: basePrice * 100, // Convert to cents
        totalCapacity: ticketsBlock?.data?.tiers?.[0]?.quantity || 10,
        status: 'published', // Always publish when handlePublish is called
        isFeatured: false,
        currency: 'USD',
        timezone: 'UTC',
        categorySlug: titleData.category || 'tech', // Default to 'tech' if not selected
        // Host information
        hostId: selectedHost.id,
        hostType: selectedHost.type,
        agendaItems: agendaItems.length > 0 ? agendaItems : undefined,
        highlights: highlights.length > 0 ? highlights : undefined,
        ticketTiers: ticketsBlock?.data?.tiers && ticketsBlock.data.tiers.length > 0 ? 
          ticketsBlock.data.tiers.map((tier: any, index: number) => ({
            name: tier.name || 'Standard Ticket',
            description: tier.description || '',
            price: tier.price || 0,
            quantity: tier.quantity || 10,
            benefits: tier.benefits || [],
            isPopular: tier.isPopular || false,
            displayOrder: index
          })) : undefined,
        faqItems: faqBlock?.data?.items && faqBlock.data.items.length > 0 ?
          faqBlock.data.items.map((item: any, index: number) => ({
            question: item.question || '',
            answer: item.answer || '',
            displayOrder: index
          })) : undefined,
        resources: resourcesBlock?.data?.resources && resourcesBlock.data.resources.length > 0 ?
          resourcesBlock.data.resources.map((item: any, index: number) => ({
            title: item.title || '',
            url: item.url || '',
            description: item.description || '',
            type: item.type || 'link',
            displayOrder: index
          })) : undefined,
        // Logistics information
        meetupInstructions: logisticsBlock?.data?.meetupInstructions,
        checkInNotes: logisticsBlock?.data?.checkInNotes,
        emergencyContactName: logisticsBlock?.data?.emergencyContact?.name,
        emergencyContactPhone: logisticsBlock?.data?.emergencyContact?.phone,
        additionalInfo: logisticsBlock?.data?.additionalInfo
      };

      // Extract featured image file if exists
      const featuredImageFile = imageBlock?.data?.file as File | undefined;
      
      if (featuredImageFile) {
        formData.append('featuredImage', featuredImageFile);
      }
      
      // Extract gallery images with alt texts
      const galleryBlockPublish = blocks.find(b => b.type === 'gallery');
      const galleryFilesPublish: File[] = [];
      const galleryAltsPublish: string[] = [];
      
      if (galleryBlockPublish?.data?.images && Array.isArray(galleryBlockPublish.data.images)) {
        galleryBlockPublish.data.images.forEach((img: any) => {
          if (img.file) {
            galleryFilesPublish.push(img.file);
            galleryAltsPublish.push(img.alt || '');
          }
        });
      }
      
      
      // Create experience via API
      const createdExperience = await experiencesService.create(createRequest, featuredImageFile, galleryFilesPublish, galleryAltsPublish);

      // Experience published successfully
      toast({
        title: "Experience Published!",
        description: "Your experience has been successfully published.",
      });

      // Redirect to the experiences page to see the created experience
      navigate('/experiences');

    } catch (error) {
      toast({
        title: "Error Creating Experience",
        description: "Failed to create experience. Please try again.",
        variant: "destructive",
      });
    }
  }, [title, blocks, isPublic, selectedHost, toast]);


  return (
    <div className="min-h-screen bg-[#0b0b12] flex flex-col">
      {/* Voice Banner */}
      {showVoiceBanner && (
        <Card className="m-4 bg-gradient-to-r from-neon-cyan/10 to-neon-purple/10 border-neon-cyan/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-neon rounded-full flex items-center justify-center">
                  <Mic className="w-4 h-4 text-background" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Prefilled from voice</p>
                  <p className="text-sm text-muted-foreground">Review and customize your experience before publishing</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowVoiceBanner(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <TopBar
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <BlockPalette 
          onAddBlock={addBlock} 
          onVoiceCreate={handleVoiceCreate}
          onScrollToBlock={scrollToBlockType}
        />
        
        <Canvas
          blocks={blocks}
          titleData={titleData}
          onUpdateTitleData={setTitleData}
          onUpdateBlock={updateBlock}
          onDeleteBlock={deleteBlock}
          onDuplicateBlock={duplicateBlock}
          onReorderBlocks={reorderBlocks}
          blockRefsMap={blockRefsMap}
          highlightedBlockId={highlightedBlockId}
          onDeleteGalleryImage={handleDeleteGalleryImage}
        />
        
        <SettingsSidebar
          isPublic={isPublic}
          onToggleVisibility={setIsPublic}
          selectedHost={selectedHost}
          onHostChange={setSelectedHost}
        />
      </div>

      {/* Voice Experience Modal */}
      <VoiceExperienceModal 
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onPrefillBuilder={handleVoicePrefill}
      />
    </div>
  );
};

function getDefaultBlockData(type: BlockType): any {
  switch (type) {
    case 'title':
      return { text: '' };
    case 'dates':
      return { startDate: null, endDate: null };
    case 'location':
      return { location: '' };
    case 'image':
      return { url: '', alt: '', file: undefined };
    case 'richText':
      return { content: 'Tell your story here...' };
    case 'highlights':
      return { highlights: [] };
    case 'agendaDay':
      return { date: null, items: [{ time: '09:00', activity: 'Welcome & Introductions' }] };
    case 'tickets':
      return { tiers: [{ name: 'Standard', price: 500, quantity: 20 }] };
    case 'gallery':
      return { images: [] };
    case 'faq':
      return { items: [{ question: 'What should I bring?', answer: 'Just yourself and an open mind!' }] };
    case 'cta':
      return { text: 'Book Your Spot', style: 'primary' };
    case 'resources':
      return { resources: [] };
    case 'logistics':
      return { 
        address: '', 
        meetupInstructions: '', 
        checkInNotes: '', 
        emergencyContact: { name: '', phone: '' },
        additionalInfo: ''
      };
    default:
      return {};
  }
}

export default ExperienceBuilder;