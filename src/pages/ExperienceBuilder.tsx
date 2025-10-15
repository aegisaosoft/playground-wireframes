import React, { useState, useCallback, useEffect, useRef } from 'react';
import { TopBar } from '@/components/ExperienceBuilder/TopBar';
import { BlockPalette } from '@/components/ExperienceBuilder/BlockPalette';
import { Canvas } from '@/components/ExperienceBuilder/Canvas';
import { SettingsSidebar } from '@/components/ExperienceBuilder/SettingsSidebar';
import { HostData } from '@/components/ExperienceBuilder/HostSelector';
import { TeamMember } from '@/components/ExperienceBuilder/TeamManagement';
import { Block, BlockType } from '@/types/experienceBuilder';
import { VoiceExperienceDraft } from '@/types/voiceExperienceCreation';
import { VoiceExperienceModal } from '@/components/VoiceExperienceCreation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { experiencesService, CreateExperienceRequest } from '@/services/experiences.service';

const ExperienceBuilder = () => {
  // 🛡️ TITLE BLOCK - PERSISTENT AND SEPARATE FROM OTHER BLOCKS
  const [titleData, setTitleData] = useState({ text: '', category: '' });
  
  const [blocks, setBlocks] = useState<Block[]>([
    {
      id: 'dates-default', 
      type: 'dates',
      data: { startDate: null, endDate: null },
      order: 0,
    },
    {
      id: 'location-default',
      type: 'location', 
      data: { city: '', country: '' },
      order: 1,
    },
  ]);
  const [isPublic, setIsPublic] = useState(false);
  const [title, setTitle] = useState('');
  const [showVoiceBanner, setShowVoiceBanner] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [selectedHost, setSelectedHost] = useState<HostData>(() => {
    // Initialize with user's personal profile
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      return {
        type: 'personal',
        name: user.name,
      };
    }
    return {
      type: 'personal',
      name: 'User',
    };
  });

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [highlightedBlockId, setHighlightedBlockId] = useState<string | null>(null);
  const blockRefsMap = useRef<Map<string, HTMLDivElement>>(new Map());
  
  const { toast } = useToast();

  // 🐛 DEBUG: Log blocks state whenever it changes
  useEffect(() => {
    console.log('📊 Current blocks state:', {
      total: blocks.length,
      types: blocks.map(b => ({ id: b.id, type: b.type, order: b.order })),
      titleData: titleData,
      hasDatesBlock: blocks.some(b => b.id === 'dates-default'),
      hasLocationBlock: blocks.some(b => b.id === 'location-default'),
    });
  }, [blocks, titleData]);

  // 🛡️ Self-healing: Ensure core blocks (dates, location) always exist
  // NOTE: Title is now separate and always present
  useEffect(() => {
    const hasDatesBlock = blocks.some(b => b.id === 'dates-default');
    const hasLocationBlock = blocks.some(b => b.id === 'location-default');
    
    // If all core blocks are present, do nothing
    if (hasDatesBlock && hasLocationBlock) {
      return;
    }
    
    console.warn('🔧 Self-healing: Core block missing! Re-adding...');
    const coreBlocks: Block[] = [];
    
    if (!hasDatesBlock) {
      console.warn('⚠️ Dates block is MISSING! Restoring...');
      coreBlocks.push({
        id: 'dates-default',
        type: 'dates',
        data: { startDate: null, endDate: null },
        order: 0,
      });
    }
    
    if (!hasLocationBlock) {
      console.warn('⚠️ Location block is MISSING! Restoring...');
      coreBlocks.push({
        id: 'location-default',
        type: 'location',
        data: { city: '', country: '' },
        order: 1,
      });
    }
    
    // Add missing core blocks
    if (coreBlocks.length > 0) {
      setBlocks(prev => {
        // Merge core blocks at the start, preserve others
        const merged = [...coreBlocks, ...prev];
        return merged.sort((a, b) => a.order - b.order);
      });
      
      toast({
        title: "Core blocks restored",
        description: "Essential blocks (dates, location) have been restored.",
      });
    }
  }, [blocks, toast]); // Run whenever blocks change

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
          console.error('Error loading voice draft:', error);
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

    // Create new blocks array starting with core blocks (dates, location)
    const newBlocks: Block[] = [
      {
        id: 'dates-default',
        type: 'dates',
        data: { 
          startDate: draft.dates.startDate, 
          endDate: draft.dates.endDate 
        },
        order: 0,
      },
      {
        id: 'location-default',
        type: 'location',
        data: { 
          city: draft.location.city, 
          country: draft.location.country 
        },
        order: 1,
      },
    ];

    let blockOrder = 2;

    // Add description as rich text if available
    if (draft.description) {
      newBlocks.push({
        id: `richText-${Date.now()}`,
        type: 'richText',
        data: { content: draft.description },
        order: blockOrder++,
      });
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

    console.log('🎤 prefillFromVoice: Setting new blocks:', newBlocks.map(b => ({ id: b.id, type: b.type })));
    setBlocks(newBlocks);
    toast({
      title: "Experience prefilled from voice!",
      description: "Review the details and customize as needed before publishing.",
    });
  }, [toast]);

  const handleVoicePrefill = useCallback((draft: VoiceExperienceDraft) => {
    prefillFromVoice(draft);
    setShowVoiceBanner(true);
    setShowVoiceModal(false);
  }, [prefillFromVoice]);

  const handleVoiceCreate = () => {
    setShowVoiceModal(true);
  };

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
      // Create new block and scroll to it
      const newBlock: Block = {
        id: `${type}-${Date.now()}`,
        type,
        data: getDefaultBlockData(type),
        order: blocks.length,
      };
      console.log('➕ scrollToBlockType: Creating new block:', type);
      console.log('🔎 Blocks before (scrollToBlockType):', blocks.map(b => ({ id: b.id, type: b.type })));
      
      setBlocks(prev => {
        console.log('🔎 Prev in scrollToBlockType:', prev.map(b => ({ id: b.id, type: b.type })));
        const result = [...prev, newBlock];
        console.log('📦 After adding in scrollToBlockType:', result.map(b => ({ id: b.id, type: b.type })));
        return result;
      });
      
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
  }, [blocks]);

  const addBlock = useCallback((type: BlockType) => {
    const newBlock: Block = {
      id: `${type}-${Date.now()}`,
      type,
      data: getDefaultBlockData(type),
      order: blocks.length,
    };
    
    console.log('➕ Adding block:', type, 'Total blocks before:', blocks.length);
    console.log('🔎 Blocks BEFORE add:', blocks.map(b => ({ id: b.id, type: b.type })));
    
    setBlocks(prev => {
      console.log('🔎 Blocks in setBlocks prev:', prev.map(b => ({ id: b.id, type: b.type })));
      const newBlocks = [...prev, newBlock];
      console.log('📦 Blocks AFTER add:', newBlocks.map(b => ({ id: b.id, type: b.type })));
      
      // Verify title block is still there
      const hasTitleBlock = newBlocks.some(b => b.id === 'title-default');
      const titleBlockType = newBlocks.find(b => b.id === 'title-default')?.type;
      console.log('🔍 Title block check:', { hasTitleBlock, titleBlockType });
      
      if (!hasTitleBlock) {
        console.error('🚨 CRITICAL ERROR: Title block disappeared when adding', type);
      }
      
      return newBlocks;
    });
  }, [blocks.length]);

  const updateBlock = useCallback((id: string, data: any) => {
    console.log('🔄 updateBlock called for:', id, 'with data:', data);
    setBlocks(prev => {
      const result = prev.map(block => {
        if (block.id === id) {
          const updated = { ...block, data: { ...block.data, ...data } };
          console.log('🔄 Updated block:', { id: updated.id, type: updated.type, oldData: block.data, newData: updated.data });
          return updated;
        }
        return block;
      });
      console.log('🔄 All blocks after update:', result.map(b => ({ id: b.id, type: b.type })));
      return result;
    });
  }, []);

  const deleteBlock = useCallback((id: string) => {
    // Prevent deletion of core blocks
    const coreBlocks = ['title-default', 'dates-default', 'location-default'];
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
    console.log('🔀 reorderBlocks: drag', dragIndex, 'to', hoverIndex);
    
    // ✅ VALIDATE INDICES
    if (isNaN(dragIndex) || isNaN(hoverIndex)) {
      console.error('❌ Invalid reorder indices:', { dragIndex, hoverIndex });
      return;
    }
    
    setBlocks(prev => {
      // ✅ VALIDATE INDEX BOUNDS
      if (dragIndex < 0 || dragIndex >= prev.length) {
        console.error('❌ dragIndex out of bounds:', { dragIndex, arrayLength: prev.length });
        return prev;
      }
      if (hoverIndex < 0 || hoverIndex >= prev.length) {
        console.error('❌ hoverIndex out of bounds:', { hoverIndex, arrayLength: prev.length });
        return prev;
      }
      
      console.log('🔀 Blocks before reorder:', prev.map(b => ({ id: b.id, type: b.type, order: b.order })));
      const newBlocks = [...prev];
      const draggedBlock = newBlocks[dragIndex];
      
      // ✅ VALIDATE DRAGGED BLOCK
      if (!draggedBlock) {
        console.error('❌ draggedBlock is undefined at index:', dragIndex);
        return prev;
      }
      
      newBlocks.splice(dragIndex, 1);
      newBlocks.splice(hoverIndex, 0, draggedBlock);
      const result = newBlocks.map((block, index) => ({ ...block, order: index }));
      console.log('🔀 Blocks after reorder:', result.map(b => ({ id: b.id, type: b.type, order: b.order })));
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

      // For draft, we can be more lenient with validation
      if (!titleData.text || titleData.text.trim().length < 3) {
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
      console.log('✨ Extracting highlights - highlightsBlock:', highlightsBlock);
      console.log('✨ highlightsBlock?.data?.highlights:', highlightsBlock?.data?.highlights);
      const highlights = highlightsBlock?.data?.highlights ? 
        highlightsBlock.data.highlights.map((item: any) => item.text || item) : [];
      console.log('✨ Extracted highlights:', highlights);

      const createRequest: CreateExperienceRequest = {
        title: titleData.text,
        description: description,
        shortDescription: description.substring(0, 200) + (description.length > 200 ? '...' : ''),
        location: locationBlock?.data?.city && locationBlock?.data?.country 
          ? `${locationBlock.data.city}, ${locationBlock.data.country}`
          : 'Location to be specified',
        city: locationBlock?.data?.city || '',
        country: locationBlock?.data?.country || '',
        startDate: datesBlock?.data?.startDate ? datesBlock.data.startDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        endDate: datesBlock?.data?.endDate ? datesBlock.data.endDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        basePriceCents: (ticketsBlock?.data?.tiers?.[0]?.price || 0) * 100,
        totalCapacity: ticketsBlock?.data?.tiers?.[0]?.quantity || 10,
        status: 'draft',
        isFeatured: false,
        currency: 'USD',
        timezone: 'UTC',
        categorySlug: titleData.category || 'tech',
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
      console.log('🖼️ Checking for image (SAVE DRAFT). imageBlock:', imageBlock);
      console.log('🖼️ imageBlock?.data?.file:', imageBlock?.data?.file);
      const featuredImageFile = imageBlock?.data?.file as File | undefined;

      if (featuredImageFile) {
        console.log('✅ Featured image file found:', {
          fileName: featuredImageFile.name,
          fileSize: featuredImageFile.size,
          fileType: featuredImageFile.type
        });
      } else {
        console.log('⚠️ No featured image file to upload');
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
        console.log('🖼️ Found', galleryFiles.length, 'gallery images to upload');
        console.log('🖼️ Gallery alt texts:', galleryAlts);
      }

      // Debug logging
      console.log('📤 Saving experience with:');
      console.log('   Agenda items:', agendaItems);
      console.log('   Highlights:', highlights);
      console.log('   Ticket tiers:', createRequest.ticketTiers);
      console.log('   FAQ items:', createRequest.faqItems);
      console.log('   Resources:', createRequest.resources);
      console.log('   Logistics:', {
        meetupInstructions: createRequest.meetupInstructions,
        checkInNotes: createRequest.checkInNotes,
        emergencyContactName: createRequest.emergencyContactName,
        emergencyContactPhone: createRequest.emergencyContactPhone,
        additionalInfo: createRequest.additionalInfo
      });
      console.log('   Gallery images:', galleryFiles.length);

      // Save draft via API
      const savedExperience = await experiencesService.create(createRequest, featuredImageFile, galleryFiles, galleryAlts);

      toast({
        title: "Draft Saved!",
        description: `Your experience "${savedExperience.title}" has been saved as draft`,
      });

    } catch (error) {
      console.error('Error saving draft:', error);
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
      if (!titleData.text || titleData.text.trim().length < 3) {
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

      if (!locationBlock?.data?.city || !locationBlock?.data?.country) {
        toast({
          title: "Location Required",
          description: "Please add city and country to your experience",
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
      console.log('✨ Extracting highlights - highlightsBlock:', highlightsBlock);
      console.log('✨ highlightsBlock?.data?.highlights:', highlightsBlock?.data?.highlights);
      const highlights = highlightsBlock?.data?.highlights ? 
        highlightsBlock.data.highlights.map((item: any) => item.text || item) : [];
      console.log('✨ Extracted highlights:', highlights);

      // Create experience request - Always publish when using handlePublish
      const createRequest: CreateExperienceRequest = {
        title: titleData.text,
        description: description,
        shortDescription: description.substring(0, 200) + (description.length > 200 ? '...' : ''),
        location: `${locationBlock.data.city}, ${locationBlock.data.country}`,
        city: locationBlock.data.city,
        country: locationBlock.data.country,
        startDate: datesBlock.data.startDate ? datesBlock.data.startDate.toISOString().split('T')[0] : '',
        endDate: datesBlock.data.endDate ? datesBlock.data.endDate.toISOString().split('T')[0] : '',
        basePriceCents: basePrice * 100, // Convert to cents
        totalCapacity: ticketsBlock?.data?.tiers?.[0]?.quantity || 10,
        status: 'published', // Always publish when handlePublish is called
        isFeatured: false,
        currency: 'USD',
        timezone: 'UTC',
        categorySlug: titleData.category || 'tech', // Default to 'tech' if not selected
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
      console.log('🖼️ Checking for image (PUBLISH). imageBlock:', imageBlock);
      console.log('🖼️ imageBlock?.data?.file:', imageBlock?.data?.file);
      const featuredImageFile = imageBlock?.data?.file as File | undefined;
      
      if (featuredImageFile) {
        console.log('✅ Featured image file found:', {
          fileName: featuredImageFile.name,
          fileSize: featuredImageFile.size,
          fileType: featuredImageFile.type
        });
      } else {
        console.log('⚠️ No featured image file to upload');
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
        console.log('🖼️ Found', galleryFilesPublish.length, 'gallery images to upload');
        console.log('🖼️ Gallery alt texts:', galleryAltsPublish);
      }
      
      // Debug logging
      console.log('📤 Publishing experience with:');
      console.log('   Agenda items:', agendaItems);
      console.log('   Highlights:', highlights);
      console.log('   Ticket tiers:', createRequest.ticketTiers);
      console.log('   FAQ items:', createRequest.faqItems);
      console.log('   Resources:', createRequest.resources);
      console.log('   Logistics:', {
        meetupInstructions: createRequest.meetupInstructions,
        checkInNotes: createRequest.checkInNotes,
        emergencyContactName: createRequest.emergencyContactName,
        emergencyContactPhone: createRequest.emergencyContactPhone,
        additionalInfo: createRequest.additionalInfo
      });
      console.log('   Gallery images:', galleryFilesPublish.length);
      console.log('   Status:', createRequest.status);
      console.log('   Full request:', createRequest);
      
      // Create experience via API
      const createdExperience = await experiencesService.create(createRequest, featuredImageFile, galleryFilesPublish, galleryAltsPublish);

      toast({
        title: "Experience Published!",
        description: `Your experience "${createdExperience.title}" has been published successfully`,
      });

      // Redirect to the experiences page to see the created experience
      window.location.href = `/experiences`;

    } catch (error) {
      console.error('Error creating experience:', error);
      toast({
        title: "Error Creating Experience",
        description: "Failed to create experience. Please try again.",
        variant: "destructive",
      });
    }
  }, [title, blocks, isPublic, selectedHost, toast]);

  // Team management handlers
  const handleAddTeamMember = useCallback((member: Omit<TeamMember, 'id'>) => {
    const newMember: TeamMember = {
      ...member,
      id: `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setTeamMembers(prev => [...prev, newMember]);
  }, []);

  const handleRemoveTeamMember = useCallback((id: string) => {
    setTeamMembers(prev => prev.filter(member => member.id !== id));
  }, []);

  const handleUpdateTeamMemberRole = useCallback((id: string, role: 'co-host' | 'admin') => {
    setTeamMembers(prev => 
      prev.map(member => 
        member.id === id ? { ...member, role } : member
      )
    );
  }, []);

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
        />
        
        <SettingsSidebar
          isPublic={isPublic}
          onToggleVisibility={setIsPublic}
          selectedHost={selectedHost}
          onHostChange={setSelectedHost}
          teamMembers={teamMembers}
          onAddTeamMember={handleAddTeamMember}
          onRemoveTeamMember={handleRemoveTeamMember}
          onUpdateTeamMemberRole={handleUpdateTeamMemberRole}
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
      return { city: '', country: '' };
    case 'image':
      return { url: '', alt: '', file: null };
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