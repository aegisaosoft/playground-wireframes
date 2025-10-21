import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { Mic, X, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { experiencesService } from '@/services/experiences.service';
import { resolveApiResourceUrl } from '@/lib/api-client';
import { useUser } from '@/contexts/UserContext';

// Mock data - in real app, this would come from API
const mockHostedExperiences = [
  {
    id: '1',
    title: 'Creative Writing Workshop',
    dates: 'May 1-8, 2024',
    status: 'published',
    visibility: 'public',
    applicants: 12,
    rating: 4.8,
    privateSlug: null,
    blocks: [
      {
        id: 'image-default',
        type: 'image' as BlockType,
        data: { url: '', alt: '' },
        order: 0,
      },
      {
        id: 'dates-default', 
        type: 'dates' as BlockType,
        data: { startDate: '2024-05-01', endDate: '2024-05-08' },
        order: 1,
      },
      {
        id: 'location-default',
        type: 'location' as BlockType, 
        data: { location: 'Portland, USA' },
        order: 2,
      },
      {
        id: 'richText-default',
        type: 'richText' as BlockType,
        data: { content: 'Join us for an intensive creative writing workshop where you\'ll develop your craft and connect with fellow writers.' },
        order: 3,
      },
      {
        id: 'tickets-default',
        type: 'tickets' as BlockType,
        data: { tiers: [{ name: 'Standard', price: 500, quantity: 20 }] },
        order: 5,
      }
    ]
  },
  {
    id: '2',
    title: 'Photography Masterclass',
    dates: 'June 15-22, 2024',
    status: 'published',
    visibility: 'private',
    applicants: 3,
    rating: null,
    privateSlug: 'private-1703847362-k9n2m8x4p',
    blocks: [
      {
        id: 'image-default',
        type: 'image' as BlockType,
        data: { url: '', alt: '' },
        order: 0,
      },
      {
        id: 'dates-default', 
        type: 'dates' as BlockType,
        data: { startDate: '2024-06-15', endDate: '2024-06-22' },
        order: 1,
      },
      {
        id: 'location-default',
        type: 'location' as BlockType, 
        data: { location: 'San Francisco, USA' },
        order: 2,
      },
      {
        id: 'richText-default',
        type: 'richText' as BlockType,
        data: { content: '' },
        order: 3,
      },
      {
        id: 'tickets-default',
        type: 'tickets' as BlockType,
        data: { tiers: [{ name: 'Standard', price: 500, quantity: 20 }] },
        order: 5,
      }
    ]
  }
];

const ExperienceEdit = () => {
  const { experienceId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Apply user-specific default settings
  const applyUserDefaults = useCallback((profile: any) => {
    if (profile.role === 'admin') {
      setTitleData(prev => ({
        ...prev,
        category: 'Professional'
      }));
    }
    setIsPublic(false); // Default to private for new users
  }, []);

  const prefillFromVoice = useCallback((draft: VoiceExperienceDraft) => {
    
    // Update title data
    setTitleData(prev => ({
      ...prev,
      text: draft.title || prev.text,
      category: draft.category || prev.category
    }));
    
    // Update visibility
    setIsPublic(draft.visibility === 'public');
    
    // Start with existing blocks and update core blocks with voice data
    const newBlocks: Block[] = [...blocks];
    
    // Update image block
    const imageBlockIndex = newBlocks.findIndex(b => b.id === 'image-default');
    if (imageBlockIndex >= 0) {
      newBlocks[imageBlockIndex] = {
        ...newBlocks[imageBlockIndex],
        data: { url: '', alt: '' }
      };
    }
    
    // Update dates block
    if (draft.startDate || draft.endDate) {
      const datesBlockIndex = newBlocks.findIndex(b => b.id === 'dates-default');
      if (datesBlockIndex >= 0) {
        newBlocks[datesBlockIndex] = {
          ...newBlocks[datesBlockIndex],
          data: {
            startDate: draft.startDate ? new Date(draft.startDate) : null,
            endDate: draft.endDate ? new Date(draft.endDate) : null,
          }
        };
      }
    }
    
    // Update location block
    if (draft.location) {
      const locationBlockIndex = newBlocks.findIndex(b => b.id === 'location-default');
      if (locationBlockIndex >= 0) {
        newBlocks[locationBlockIndex] = {
          ...newBlocks[locationBlockIndex],
          data: {
            location: draft.location || ''
          }
        };
      }
    }
    
    // Update description block
    if (draft.description) {
      const descriptionBlockIndex = newBlocks.findIndex(b => b.id === 'richText-default');
      if (descriptionBlockIndex >= 0) {
        newBlocks[descriptionBlockIndex] = {
          ...newBlocks[descriptionBlockIndex],
          data: { content: draft.description }
        };
      }
    }
    
    setBlocks(newBlocks);
  }, [toast]);

  // 🛡️ TITLE BLOCK - PERSISTENT AND SEPARATE FROM OTHER BLOCKS
  const [titleData, setTitleData] = useState({ text: '', category: '' });
  
  const [blocks, setBlocks] = useState<Block[]>([]);
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

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [highlightedBlockId, setHighlightedBlockId] = useState<string | null>(null);
  const blockRefsMap = useRef<Map<string, HTMLDivElement>>(new Map());

  // Initialize user data when component mounts
  useEffect(() => {
    if (user) {
      setSelectedHost({
        type: 'personal',
        name: user.name,
      });
    }
  }, [user]);

  // ✅ Delete gallery image handler
  const handleDeleteGalleryImage = useCallback(async (imageId: string) => {
    if (!experienceId) {
      throw new Error('Experience ID is required');
    }
    
    
    try {
      await experiencesService.deleteImage(experienceId, imageId);
      
      toast({
        title: "Image Deleted",
        description: "Gallery image has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete image. Please try again.",
        variant: "destructive",
      });
      throw error;  // Re-throw to prevent UI update in GalleryBlock
    }
  }, [experienceId, toast]);

  // Load experience data on mount
  useEffect(() => {
    const loadExperience = async () => {
      if (!experienceId) {
        navigate('/account?tab=hosting');
        return;
      }

      try {
        
        // Fetch experience from API
        const experience = await experiencesService.getById(experienceId);
        
        
        setTitle(experience.title || '');
        setIsPublic(experience.status === 'published');
        
        // Set title data (separate from blocks array)
        setTitleData({
          text: experience.title || 'Untitled Experience',
          category: experience.categorySlug || experience.category || ''
        });
        
        // Convert experience data to blocks
        const defaultBlocks: Block[] = [
          {
            id: 'title-default',
            type: 'title' as BlockType,
            data: { 
              text: experience.title || 'Untitled Experience',
              category: experience.categorySlug || experience.category || ''
            },
            order: 0,
          },
          {
            id: 'dates-default', 
            type: 'dates' as BlockType,
            data: { 
              startDate: experience.startDate || '', 
              endDate: experience.endDate || ''
            },
            order: 1,
          },
          {
            id: 'location-default',
            type: 'location' as BlockType, 
            data: { 
              location: experience.location || ''
            },
            order: 2,
          },
          {
            id: 'richText-1',
            type: 'richText' as BlockType,
            data: { content: experience.description || '' },
            order: 3,
          }
        ];

        let blockOrder = 4;

        // Add image block if featured image exists
        if (experience.featuredImageUrl) {
          const resolvedUrl = (resolveApiResourceUrl(experience.featuredImageUrl) as string) || experience.featuredImageUrl;
          defaultBlocks.push({
            id: 'image-default',
            type: 'image' as BlockType,
            data: {
              url: resolvedUrl, // Existing image URL (absolute)
              file: null // No file yet - user can replace it
            },
            order: blockOrder++
          });
        }

        // Add agenda blocks if agenda exists
        if (experience.agenda && Array.isArray(experience.agenda) && experience.agenda.length > 0) {
          experience.agenda.forEach((dayAgenda: any, index: number) => {
            if (dayAgenda.items && dayAgenda.items.length > 0) {
              defaultBlocks.push({
                id: `agendaDay-${Date.now()}-${index}`,
                type: 'agendaDay' as BlockType,
                data: {
                  date: null, // Could parse dayTitle if it's a date
                  items: dayAgenda.items.map((item: any) => ({
                    time: item.time || item.timeSlot || '09:00',
                    activity: item.activity || 'Activity'
                  }))
                },
                order: blockOrder++
              });
            }
          });
        } else {
        }

        // Add highlights block if highlights exist
        if (experience.highlights && Array.isArray(experience.highlights) && experience.highlights.length > 0) {
          defaultBlocks.push({
            id: `highlights-${Date.now()}`,
            type: 'highlights' as BlockType,
            data: {
              highlights: experience.highlights, // Array of strings
              aiSuggestions: []
            },
            order: blockOrder++
          });
        } else {
        }

        // Add tickets block if ticket tiers exist
        if (experience.ticketTiers && Array.isArray(experience.ticketTiers) && experience.ticketTiers.length > 0) {
          const tiersData = experience.ticketTiers.map((tier: any) => ({
            id: tier.id || `tier_${Date.now()}_${Math.random()}`,
            name: tier.name,
            description: tier.description || '',
            price: tier.price,
            quantity: tier.quantity || tier.capacity
          }));
          
          
          // Initialize with default application form fields so TicketsBlock doesn't overwrite tiers
          const defaultApplicationFields = [
            {
              id: 'fullName',
              type: 'shortText' as const,
              label: 'Full Name',
              required: true,
              appliesTo: 'all' as const,
              placeholder: 'Enter your full name'
            },
            {
              id: 'email',
              type: 'shortText' as const,
              label: 'Email',
              required: true,
              appliesTo: 'all' as const,
              placeholder: 'Enter your email address'
            }
          ];
          
          defaultBlocks.push({
            id: `tickets-${Date.now()}`,
            type: 'tickets' as BlockType,
            data: {
              tiers: tiersData,
              applicationForm: {
                fields: defaultApplicationFields
              }
            },
            order: blockOrder++
          });
        } else {
        }

        // Add FAQ block if FAQ items exist
        if (experience.faq && Array.isArray(experience.faq) && experience.faq.length > 0) {
          const faqData = experience.faq.map((item: any) => ({
            id: `faq_${Date.now()}_${Math.random()}`,
            question: item.question || '',
            answer: item.answer || ''
          }));
          
          
          defaultBlocks.push({
            id: `faq-${Date.now()}`,
            type: 'faq' as BlockType,
            data: {
              items: faqData
            },
            order: blockOrder++
          });
        } else {
        }

        // Add Resources block if resources exist
        if (experience.resources && Array.isArray(experience.resources) && experience.resources.length > 0) {
          const resourcesData = experience.resources.map((item: any) => ({
            id: item.id || `resource_${Date.now()}_${Math.random()}`,
            title: item.title || '',
            url: item.url || '',
            description: item.description || '',
            type: item.type || 'link'
          }));
          
          
          defaultBlocks.push({
            id: `resources-${Date.now()}`,
            type: 'resources' as BlockType,
            data: {
              resources: resourcesData
            },
            order: blockOrder++
          });
        } else {
        }

        // Add Logistics block if logistics data exists
        if (experience.meetupInstructions || experience.checkInNotes || experience.emergencyContactName || experience.additionalInfo) {
          const logisticsData = {
            address: experience.address || experience.location || '',
            meetupInstructions: experience.meetupInstructions || '',
            checkInNotes: experience.checkInNotes || '',
            emergencyContact: {
              name: experience.emergencyContactName || '',
              phone: experience.emergencyContactPhone || ''
            },
            additionalInfo: experience.additionalInfo || ''
          };
          
          
          defaultBlocks.push({
            id: `logistics-${Date.now()}`,
            type: 'logistics' as BlockType,
            data: logisticsData,
            order: blockOrder++
          });
        } else {
        }

        // Add Gallery block if gallery images exist
        
        if (experience.gallery && Array.isArray(experience.gallery) && experience.gallery.length > 0) {
          
          const galleryData = experience.gallery.map((img: any) => ({
            id: img.id,  // ✅ Database ID for deletion
            url: img.url,
            alt: img.alt || '',
            file: null  // Existing images don't have files
          }));
          
          
          defaultBlocks.push({
            id: `gallery-${Date.now()}`,
            type: 'gallery' as BlockType,
            data: {
              images: galleryData
            },
            order: blockOrder++
          });
        } else {
        }
        
        
        setBlocks(defaultBlocks);
        
      } catch (error) {
        toast({
          title: "Experience not found",
          description: "The experience you're trying to edit doesn't exist or you don't have permission.",
          variant: "destructive",
        });
        navigate('/account?tab=hosting');
      }
    };

    loadExperience();
  }, [experienceId, navigate, toast]);

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
      
      setBlocks(prev => {
        const newBlocks = [...prev];
        newBlocks.splice(insertPosition, 0, newBlock);
        return newBlocks.map((block, index) => ({ ...block, order: index }));
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
    setBlocks(prev => prev.map(block => 
      block.id === id ? { ...block, data: { ...block.data, ...data } } : block
    ));
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
      return newBlocks.map((block, index) => ({ ...block, order: index }));
    });
  }, []);

  const handleSaveDraft = useCallback(async () => {
    if (!experienceId) return;
    
    try {

      // Validate title
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

      // Validate location
      const locationBlock = blocks.find(b => b.type === 'location');
      if (!locationBlock?.data?.location || locationBlock.data.location.trim().length < 3) {
        toast({
          title: "Location Required",
          description: "Please add a location to your experience",
          variant: "destructive",
        });
        return;
      }
      
      // Extract data from blocks (title is now separate)
      const datesBlock = blocks.find(b => b.type === 'dates');
      // locationBlock already defined above in validation
      const descriptionBlock = blocks.find(b => b.type === 'richText');
      const imageBlock = blocks.find(b => b.type === 'image');
      const agendaBlocks = blocks.filter(b => b.type === 'agendaDay');
      const highlightsBlock = blocks.find(b => b.type === 'highlights');
      const ticketsBlock = blocks.find(b => b.type === 'tickets');
      const faqBlock = blocks.find(b => b.type === 'faq');
      const resourcesBlock = blocks.find(b => b.type === 'resources');
      const logisticsBlock = blocks.find(b => b.type === 'logistics');
      
      // Use title from block or titleData as fallback
      // titleBlock and titleText already defined above in validation
      const titleCategory = titleBlock?.data?.category || titleData.category;
      
      if (titleText) {
        formData.append('title', titleText);
      }
      
      if (titleCategory) {
        formData.append('categorySlug', titleCategory);
      }
      
      if (descriptionBlock?.data?.content) {
        formData.append('description', descriptionBlock.data.content);
      }
      
      if (locationBlock?.data?.location) {
        formData.append('location', locationBlock.data.location);
        formData.append('city', '');
        formData.append('country', '');
      }
      
      if (datesBlock?.data?.startDate) {
        const startDate = datesBlock.data.startDate instanceof Date ? 
          datesBlock.data.startDate.toISOString().split('T')[0] : 
          new Date(datesBlock.data.startDate).toISOString().split('T')[0];
        formData.append('startDate', startDate);
      }
      
      if (datesBlock?.data?.endDate) {
        const endDate = datesBlock.data.endDate instanceof Date ? 
          datesBlock.data.endDate.toISOString().split('T')[0] : 
          new Date(datesBlock.data.endDate).toISOString().split('T')[0];
        formData.append('endDate', endDate);
      }

      // Transform agenda blocks to agenda items format
      const agendaItems: any[] = [];
      agendaBlocks.forEach((block, blockIndex) => {
        const blockData = block.data as { date: Date | null; items: Array<{ time: string; activity: string }> };
        if (blockData.items && blockData.items.length > 0) {
          blockData.items.forEach((item, itemIndex) => {
            agendaItems.push({
              dayNumber: blockIndex + 1,
              dayTitle: blockData.date ? new Date(blockData.date).toLocaleDateString() : `Day ${blockIndex + 1}`,
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

      // Add agenda items and highlights as JSON
      if (agendaItems.length > 0) {
        formData.append('agendaItems', JSON.stringify(agendaItems));
      }

      if (highlights.length > 0) {
        formData.append('highlights', JSON.stringify(highlights));
      }

      // Extract and add ticket tiers
      if (ticketsBlock?.data?.tiers && ticketsBlock.data.tiers.length > 0) {
        const ticketTiers = ticketsBlock.data.tiers.map((tier: any, index: number) => ({
          name: tier.name || 'Standard Ticket',
          description: tier.description || '',
          price: tier.price || 0,
          quantity: tier.quantity || 10,
          benefits: tier.benefits || [],
          isPopular: tier.isPopular || false,
          displayOrder: index
        }));
        formData.append('ticketTiers', JSON.stringify(ticketTiers));
      }

      // Extract and add FAQ items
      if (faqBlock?.data?.items && faqBlock.data.items.length > 0) {
        const faqItems = faqBlock.data.items.map((item: any, index: number) => ({
          question: item.question || '',
          answer: item.answer || '',
          displayOrder: index
        }));
        formData.append('faqItems', JSON.stringify(faqItems));
      }

      // Extract and add resources
      if (resourcesBlock?.data?.resources && resourcesBlock.data.resources.length > 0) {
        const resources = resourcesBlock.data.resources.map((item: any, index: number) => ({
          title: item.title || '',
          url: item.url || '',
          description: item.description || '',
          type: item.type || 'link',
          displayOrder: index
        }));
        formData.append('resources', JSON.stringify(resources));
      }

      // Extract and add logistics data
      if (logisticsBlock?.data) {
        const logistics = logisticsBlock.data;
        if (logistics.meetupInstructions) {
          formData.append('meetupInstructions', logistics.meetupInstructions);
        }
        if (logistics.checkInNotes) {
          formData.append('checkInNotes', logistics.checkInNotes);
        }
        if (logistics.emergencyContact?.name) {
          formData.append('emergencyContactName', logistics.emergencyContact.name);
        }
        if (logistics.emergencyContact?.phone) {
          formData.append('emergencyContactPhone', logistics.emergencyContact.phone);
        }
        if (logistics.additionalInfo) {
          formData.append('additionalInfo', logistics.additionalInfo);
        }
      }
      
      // Check for image in blocks
      
      if (imageBlock?.data?.file) {
        formData.append('featuredImage', imageBlock.data.file);
      } else {
      }

      // Extract and add gallery images with their alt text
      const galleryBlockDraft = blocks.find(b => b.type === 'gallery');
      
      if (galleryBlockDraft?.data?.images && Array.isArray(galleryBlockDraft.data.images)) {
        // Filter images that have new files to upload
        const imagesToUpload = galleryBlockDraft.data.images
          .filter((img: any) => img.file !== null && img.file !== undefined);
        
        
        if (imagesToUpload.length > 0) {
          const galleryAlts: string[] = [];
          
          imagesToUpload.forEach((img: any, index: number) => {
            // Append the file
            formData.append('galleryImages', img.file, img.file.name);
            // Collect alt text
            galleryAlts.push(img.alt || '');
          });
          
          // Send alt texts as JSON array
          formData.append('galleryAlts', JSON.stringify(galleryAlts));
        } else {
        }
      } else {
      }

      // Build update payload and use API client upload helper (proper multipart + API domain)
      const updateData: Partial<CreateExperienceRequest> = {
        title: titleText,
        categorySlug: titleCategory,
        description: descriptionBlock?.data?.content,
        location: locationBlock?.data?.location,
        city: '',
        country: '',
        startDate: datesBlock?.data?.startDate ? (
          datesBlock.data.startDate instanceof Date ? 
            datesBlock.data.startDate.toISOString().split('T')[0] : 
            new Date(datesBlock.data.startDate).toISOString().split('T')[0]
        ) : undefined,
        endDate: datesBlock?.data?.endDate ? (
          datesBlock.data.endDate instanceof Date ? 
            datesBlock.data.endDate.toISOString().split('T')[0] : 
            new Date(datesBlock.data.endDate).toISOString().split('T')[0]
        ) : undefined,
        agendaItems,
        highlights,
        ticketTiers: ticketsBlock?.data?.tiers ? ticketsBlock.data.tiers.map((tier: any, index: number) => ({
          name: tier.name || 'Standard Ticket',
          description: tier.description || '',
          price: tier.price || 0,
          quantity: tier.quantity || 10,
          benefits: tier.benefits || [],
          isPopular: tier.isPopular || false,
          displayOrder: index
        })) : undefined,
        faqItems: faqBlock?.data?.items ? faqBlock.data.items.map((item: any, index: number) => ({
          question: item.question || '',
          answer: item.answer || '',
          displayOrder: index
        })) : undefined,
        resources: resourcesBlock?.data?.resources ? resourcesBlock.data.resources.map((item: any, index: number) => ({
          title: item.title || '',
          url: item.url || '',
          description: item.description || '',
          type: item.type || 'link',
          displayOrder: index
        })) : undefined,
        meetupInstructions: logisticsBlock?.data?.meetupInstructions,
        checkInNotes: logisticsBlock?.data?.checkInNotes,
        emergencyContactName: logisticsBlock?.data?.emergencyContact?.name,
        emergencyContactPhone: logisticsBlock?.data?.emergencyContact?.phone,
        additionalInfo: logisticsBlock?.data?.additionalInfo,
        // Optional host assignment
        ...(selectedHost?.id && selectedHost?.type ? { hostId: selectedHost.id, hostType: selectedHost.type } as any : {}),
        status: 'draft'
      };

      const featuredImageFile = imageBlock?.data?.file as File | undefined;

      const galleryBlock = blocks.find(b => b.type === 'gallery');
      let galleryFiles: File[] | undefined;
      let galleryAlts: string[] | undefined;
      if (galleryBlock?.data?.images && Array.isArray(galleryBlock.data.images)) {
        const imagesToUpload = galleryBlock.data.images
          .filter((img: any) => img.file !== null && img.file !== undefined);
        if (imagesToUpload.length > 0) {
          galleryFiles = [];
          galleryAlts = [];
          imagesToUpload.forEach((img: any) => {
            galleryFiles!.push(img.file);
            galleryAlts!.push(img.alt || '');
          });
        }
      }

      await experiencesService.updateWithFiles(
        experienceId,
        updateData,
        featuredImageFile,
        galleryFiles,
        galleryAlts
      );

      setIsPublic(false);
      
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
      });
    }
  }, [experienceId, title, blocks, toast]);

  const handlePublish = useCallback(async () => {
    if (!experienceId) return;
    
    try {

      // Validate title
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

      // Validate location
      const locationBlock = blocks.find(b => b.type === 'location');
      if (!locationBlock?.data?.location || locationBlock.data.location.trim().length < 3) {
        toast({
          title: "Location Required",
          description: "Please add a location to your experience",
          variant: "destructive",
        });
        return;
      }
      
      const token = localStorage.getItem('auth_token');
      const formData = new FormData();
      
      // Add experience data
      formData.append('status', 'published');
      
      // Extract data from blocks (title is now separate)
      const datesBlock = blocks.find(b => b.type === 'dates');
      // locationBlock already defined above in validation
      const descriptionBlock = blocks.find(b => b.type === 'richText');
      const imageBlock = blocks.find(b => b.type === 'image');
      const agendaBlocks = blocks.filter(b => b.type === 'agendaDay');
      const highlightsBlock = blocks.find(b => b.type === 'highlights');
      const ticketsBlock = blocks.find(b => b.type === 'tickets');
      const faqBlock = blocks.find(b => b.type === 'faq');
      const resourcesBlock = blocks.find(b => b.type === 'resources');
      const logisticsBlock = blocks.find(b => b.type === 'logistics');
      
      // Use title from block or titleData as fallback
      // titleBlock and titleText already defined above in validation
      const titleCategory = titleBlock?.data?.category || titleData.category;
      
      if (titleText) {
        formData.append('title', titleText);
      }
      
      if (titleCategory) {
        formData.append('categorySlug', titleCategory);
      }
      
      if (descriptionBlock?.data?.content) {
        formData.append('description', descriptionBlock.data.content);
      }
      
      if (locationBlock?.data?.location) {
        formData.append('location', locationBlock.data.location);
        formData.append('city', '');
        formData.append('country', '');
      }
      
      if (datesBlock?.data?.startDate) {
        const startDate = datesBlock.data.startDate instanceof Date ? 
          datesBlock.data.startDate.toISOString().split('T')[0] : 
          new Date(datesBlock.data.startDate).toISOString().split('T')[0];
        formData.append('startDate', startDate);
      }
      
      if (datesBlock?.data?.endDate) {
        const endDate = datesBlock.data.endDate instanceof Date ? 
          datesBlock.data.endDate.toISOString().split('T')[0] : 
          new Date(datesBlock.data.endDate).toISOString().split('T')[0];
        formData.append('endDate', endDate);
      }

      // Transform agenda blocks to agenda items format
      const agendaItems: any[] = [];
      agendaBlocks.forEach((block, blockIndex) => {
        const blockData = block.data as { date: Date | null; items: Array<{ time: string; activity: string }> };
        if (blockData.items && blockData.items.length > 0) {
          blockData.items.forEach((item, itemIndex) => {
            agendaItems.push({
              dayNumber: blockIndex + 1,
              dayTitle: blockData.date ? new Date(blockData.date).toLocaleDateString() : `Day ${blockIndex + 1}`,
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

      // Add agenda items and highlights as JSON
      if (agendaItems.length > 0) {
        formData.append('agendaItems', JSON.stringify(agendaItems));
      }

      if (highlights.length > 0) {
        formData.append('highlights', JSON.stringify(highlights));
      }

      // Extract and add ticket tiers
      if (ticketsBlock?.data?.tiers && ticketsBlock.data.tiers.length > 0) {
        const ticketTiers = ticketsBlock.data.tiers.map((tier: any, index: number) => ({
          name: tier.name || 'Standard Ticket',
          description: tier.description || '',
          price: tier.price || 0,
          quantity: tier.quantity || 10,
          benefits: tier.benefits || [],
          isPopular: tier.isPopular || false,
          displayOrder: index
        }));
        formData.append('ticketTiers', JSON.stringify(ticketTiers));
      }

      // Extract and add FAQ items
      if (faqBlock?.data?.items && faqBlock.data.items.length > 0) {
        const faqItems = faqBlock.data.items.map((item: any, index: number) => ({
          question: item.question || '',
          answer: item.answer || '',
          displayOrder: index
        }));
        formData.append('faqItems', JSON.stringify(faqItems));
      }

      // Extract and add resources
      if (resourcesBlock?.data?.resources && resourcesBlock.data.resources.length > 0) {
        const resources = resourcesBlock.data.resources.map((item: any, index: number) => ({
          title: item.title || '',
          url: item.url || '',
          description: item.description || '',
          type: item.type || 'link',
          displayOrder: index
        }));
        formData.append('resources', JSON.stringify(resources));
      }

      // Extract and add logistics data
      if (logisticsBlock?.data) {
        const logistics = logisticsBlock.data;
        if (logistics.meetupInstructions) {
          formData.append('meetupInstructions', logistics.meetupInstructions);
        }
        if (logistics.checkInNotes) {
          formData.append('checkInNotes', logistics.checkInNotes);
        }
        if (logistics.emergencyContact?.name) {
          formData.append('emergencyContactName', logistics.emergencyContact.name);
        }
        if (logistics.emergencyContact?.phone) {
          formData.append('emergencyContactPhone', logistics.emergencyContact.phone);
        }
        if (logistics.additionalInfo) {
          formData.append('additionalInfo', logistics.additionalInfo);
        }
      }
      
      // Upload image if exists in blocks
      
      if (imageBlock?.data?.file) {
        formData.append('featuredImage', imageBlock.data.file);
      } else {
      }

      // Extract and add gallery images with their alt text
      const galleryBlockPublish = blocks.find(b => b.type === 'gallery');
      
      if (galleryBlockPublish?.data?.images && Array.isArray(galleryBlockPublish.data.images)) {
        // Filter images that have new files to upload
        const imagesToUpload = galleryBlockPublish.data.images
          .filter((img: any) => img.file !== null && img.file !== undefined);
        
        
        if (imagesToUpload.length > 0) {
          const galleryAlts: string[] = [];
          
          imagesToUpload.forEach((img: any, index: number) => {
            // Append the file
            formData.append('galleryImages', img.file, img.file.name);
            // Collect alt text
            galleryAlts.push(img.alt || '');
          });
          
          // Send alt texts as JSON array
          formData.append('galleryAlts', JSON.stringify(galleryAlts));
        } else {
        }
      } else {
      }

      const updateData: Partial<CreateExperienceRequest> = {
        status: 'published',
        title: titleText,
        categorySlug: titleCategory,
        description: descriptionBlock?.data?.content,
        location: locationBlock?.data?.location,
        city: '',
        country: '',
        startDate: datesBlock?.data?.startDate ? (
          datesBlock.data.startDate instanceof Date ? 
            datesBlock.data.startDate.toISOString().split('T')[0] : 
            new Date(datesBlock.data.startDate).toISOString().split('T')[0]
        ) : undefined,
        endDate: datesBlock?.data?.endDate ? (
          datesBlock.data.endDate instanceof Date ? 
            datesBlock.data.endDate.toISOString().split('T')[0] : 
            new Date(datesBlock.data.endDate).toISOString().split('T')[0]
        ) : undefined,
        agendaItems,
        highlights,
        ticketTiers: ticketsBlock?.data?.tiers ? ticketsBlock.data.tiers.map((tier: any, index: number) => ({
          name: tier.name || 'Standard Ticket',
          description: tier.description || '',
          price: tier.price || 0,
          quantity: tier.quantity || 10,
          benefits: tier.benefits || [],
          isPopular: tier.isPopular || false,
          displayOrder: index
        })) : undefined,
        faqItems: faqBlock?.data?.items ? faqBlock.data.items.map((item: any, index: number) => ({
          question: item.question || '',
          answer: item.answer || '',
          displayOrder: index
        })) : undefined,
        resources: resourcesBlock?.data?.resources ? resourcesBlock.data.resources.map((item: any, index: number) => ({
          title: item.title || '',
          url: item.url || '',
          description: item.description || '',
          type: item.type || 'link',
          displayOrder: index
        })) : undefined,
        meetupInstructions: logisticsBlock?.data?.meetupInstructions,
        checkInNotes: logisticsBlock?.data?.checkInNotes,
        emergencyContactName: logisticsBlock?.data?.emergencyContact?.name,
        emergencyContactPhone: logisticsBlock?.data?.emergencyContact?.phone,
        additionalInfo: logisticsBlock?.data?.additionalInfo,
        // Optional host assignment
        ...(selectedHost?.id && selectedHost?.type ? { hostId: selectedHost.id, hostType: selectedHost.type } as any : {})
      };

      const featuredImageFile = imageBlock?.data?.file as File | undefined;

      const galleryBlock = blocks.find(b => b.type === 'gallery');
      let galleryFiles: File[] | undefined;
      let galleryAlts: string[] | undefined;
      if (galleryBlock?.data?.images && Array.isArray(galleryBlock.data.images)) {
        const imagesToUpload = galleryBlock.data.images
          .filter((img: any) => img.file !== null && img.file !== undefined);
        if (imagesToUpload.length > 0) {
          galleryFiles = [];
          galleryAlts = [];
          imagesToUpload.forEach((img: any) => {
            galleryFiles!.push(img.file);
            galleryAlts!.push(img.alt || '');
          });
        }
      }

      await experiencesService.updateWithFiles(
        experienceId,
        updateData,
        featuredImageFile,
        galleryFiles,
        galleryAlts
      );

      toast({
        title: "Experience Published!",
        description: "Your experience is now live and visible to everyone.",
      });
      
      // Update the isPublic state
      setIsPublic(true);
      
    } catch (error) {
      toast({
        title: "Publish Failed",
        description: "Failed to publish experience. Please try again.",
        variant: "destructive",
      });
    }
  }, [experienceId, title, blocks, toast]);

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

  const handleVoicePrefill = useCallback((draft: VoiceExperienceDraft) => {
    // Similar to ExperienceBuilder's prefill logic
    setTitleData({ 
      text: draft.title, 
      category: '' 
    });
    setIsPublic(draft.visibility === 'public');

    // Start with existing blocks and update core blocks with voice data
    const newBlocks: Block[] = [...blocks];
    
    // Update title block
    const titleBlockIndex = newBlocks.findIndex(b => b.id === 'title-default');
    if (titleBlockIndex >= 0) {
      newBlocks[titleBlockIndex] = {
        ...newBlocks[titleBlockIndex],
        data: { 
          text: draft.title,
          category: ''
        }
      };
    }
    
    // Update image block
    const imageBlockIndex = newBlocks.findIndex(b => b.id === 'image-default');
    if (imageBlockIndex >= 0) {
      newBlocks[imageBlockIndex] = {
        ...newBlocks[imageBlockIndex],
        data: { url: '', alt: '' }
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
    
    // Update description block
    const descriptionBlockIndex = newBlocks.findIndex(b => b.id === 'richText-default');
    if (descriptionBlockIndex >= 0) {
      newBlocks[descriptionBlockIndex] = {
        ...newBlocks[descriptionBlockIndex],
        data: { content: draft.description || '' }
      };
    }

    let blockOrder = 4;

    // Description block already updated above, no need to create duplicate

    draft.agendaDays.forEach((day, index) => {
      newBlocks.push({
        id: `agendaDay-${Date.now()}-${index}`,
        type: 'agendaDay',
        data: {
          date: null,
          items: day.items
        },
        order: blockOrder++,
      });
    });

    if (draft.ticketTiers.length > 0) {
      newBlocks.push({
        id: `tickets-${Date.now()}`,
        type: 'tickets',
        data: { tiers: draft.ticketTiers },
        order: blockOrder++,
      });
    }

    newBlocks.push({
      id: `cta-${Date.now()}`,
      type: 'cta',
      data: { text: draft.ctaText, style: 'primary' },
      order: blockOrder++,
    });

    setBlocks(newBlocks);
    setShowVoiceModal(false);
    // Experience updated from voice
  }, [toast]);

  return (
    <div className="min-h-screen bg-[#0b0b12] flex flex-col">
      <TopBar
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        showBackButton={true}
        onBack={() => navigate('/account?tab=hosting')}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <BlockPalette 
          onAddBlock={addBlock} 
          onVoiceCreate={() => setShowVoiceModal(true)}
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
          experienceId={experienceId}
          onDeleteGalleryImage={handleDeleteGalleryImage}
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
        onPrefillBuilder={prefillFromVoice}
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

export default ExperienceEdit;