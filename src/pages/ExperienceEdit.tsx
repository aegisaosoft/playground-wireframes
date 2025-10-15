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
        id: 'title-default',
        type: 'title' as BlockType,
        data: { text: 'Creative Writing Workshop' },
        order: 1,
      },
      {
        id: 'dates-default', 
        type: 'dates' as BlockType,
        data: { startDate: '2024-05-01', endDate: '2024-05-08' },
        order: 2,
      },
      {
        id: 'location-default',
        type: 'location' as BlockType, 
        data: { location: 'Portland, USA' },
        order: 3,
      },
      {
        id: 'richText-default',
        type: 'richText' as BlockType,
        data: { content: 'Join us for an intensive creative writing workshop where you\'ll develop your craft and connect with fellow writers.' },
        order: 4,
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
        id: 'title-default',
        type: 'title' as BlockType,
        data: { text: 'Photography Masterclass' },
        order: 1,
      },
      {
        id: 'dates-default', 
        type: 'dates' as BlockType,
        data: { startDate: '2024-06-15', endDate: '2024-06-22' },
        order: 2,
      },
      {
        id: 'location-default',
        type: 'location' as BlockType, 
        data: { location: 'San Francisco, USA' },
        order: 3,
      },
      {
        id: 'richText-default',
        type: 'richText' as BlockType,
        data: { content: '' },
        order: 4,
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
  
  // 🛡️ TITLE BLOCK - PERSISTENT AND SEPARATE FROM OTHER BLOCKS
  const [titleData, setTitleData] = useState({ text: '', category: '' });
  
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [title, setTitle] = useState('');
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [selectedHost, setSelectedHost] = useState<HostData>(() => {
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

  // ✅ Delete gallery image handler
  const handleDeleteGalleryImage = useCallback(async (imageId: string) => {
    if (!experienceId) {
      throw new Error('Experience ID is required');
    }
    
    console.log('🗑️ Deleting gallery image:', imageId, 'from experience:', experienceId);
    
    try {
      await experiencesService.deleteImage(experienceId, imageId);
      console.log('✅ Gallery image deleted successfully from backend');
      
      toast({
        title: "Image Deleted",
        description: "Gallery image has been removed.",
      });
    } catch (error) {
      console.error('❌ Failed to delete gallery image:', error);
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
        console.log('📥 Loading experience:', experienceId);
        
        // Fetch experience from API
        const experience = await experiencesService.getById(experienceId);
        
        console.log('✅ Experience loaded:', experience);
        console.log('📝 Title:', experience.title);
        console.log('📅 Dates:', experience.startDate, '-', experience.endDate);
        console.log('📍 Location:', experience.location, experience.city, experience.country);
        console.log('📄 Description:', experience.description);
        console.log('📋 Agenda:', experience.agenda);
        console.log('✨ Highlights:', experience.highlights);
        console.log('🎫 Ticket Tiers:', experience.ticketTiers);
        console.log('🖼️ Gallery Images from API:', experience.gallery);
        
        setTitle(experience.title || '');
        setIsPublic(experience.status === 'published');
        
        // Set title data (separate from blocks array)
        setTitleData({
          text: experience.title || 'Untitled Experience',
          category: experience.categorySlug || experience.category || ''
        });
        
        // Convert experience data to blocks (without title - it's now separate)
        const defaultBlocks: Block[] = [
          {
            id: 'dates-default', 
            type: 'dates' as BlockType,
            data: { 
              startDate: experience.startDate || '', 
              endDate: experience.endDate || ''
            },
            order: 0,
          },
          {
            id: 'location-default',
            type: 'location' as BlockType, 
            data: { 
              city: experience.city || experience.location || '',
              country: experience.country || ''
            },
            order: 1,
          },
          {
            id: 'richText-1',
            type: 'richText' as BlockType,
            data: { content: experience.description || '' },
            order: 2,
          }
        ];

        let blockOrder = 3;

        // Add image block if featured image exists
        if (experience.featuredImageUrl) {
          console.log('🖼️ Loading existing featured image:', experience.featuredImageUrl);
          defaultBlocks.push({
            id: 'image-default',
            type: 'image' as BlockType,
            data: {
              url: experience.featuredImageUrl, // Existing image URL
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
          console.log('✅ Loaded', experience.agenda.length, 'agenda day blocks');
        } else {
          console.log('⚠️ No agenda items found in experience data');
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
          console.log('✅ Loaded highlights block with', experience.highlights.length, 'highlights');
        } else {
          console.log('⚠️ No highlights found in experience data');
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
          
          console.log('🎫 Transformed ticket tiers for block:', tiersData);
          
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
          console.log('✅ Loaded ticket tiers block with', experience.ticketTiers.length, 'tiers');
        } else {
          console.log('⚠️ No ticket tiers found in experience data');
        }

        // Add FAQ block if FAQ items exist
        if (experience.faq && Array.isArray(experience.faq) && experience.faq.length > 0) {
          const faqData = experience.faq.map((item: any) => ({
            id: `faq_${Date.now()}_${Math.random()}`,
            question: item.question || '',
            answer: item.answer || ''
          }));
          
          console.log('❓ Transformed FAQ items for block:', faqData);
          
          defaultBlocks.push({
            id: `faq-${Date.now()}`,
            type: 'faq' as BlockType,
            data: {
              items: faqData
            },
            order: blockOrder++
          });
          console.log('✅ Loaded FAQ block with', experience.faq.length, 'items');
        } else {
          console.log('⚠️ No FAQ items found in experience data');
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
          
          console.log('📂 Transformed resources for block:', resourcesData);
          
          defaultBlocks.push({
            id: `resources-${Date.now()}`,
            type: 'resources' as BlockType,
            data: {
              resources: resourcesData
            },
            order: blockOrder++
          });
          console.log('✅ Loaded resources block with', experience.resources.length, 'items');
        } else {
          console.log('⚠️ No resources found in experience data');
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
          
          console.log('🗺️ Transformed logistics for block:', logisticsData);
          
          defaultBlocks.push({
            id: `logistics-${Date.now()}`,
            type: 'logistics' as BlockType,
            data: logisticsData,
            order: blockOrder++
          });
          console.log('✅ Loaded logistics block');
        } else {
          console.log('⚠️ No logistics data found in experience data');
        }

        // Add Gallery block if gallery images exist
        console.log('🔍 Checking for gallery images...');
        console.log('   experience.gallery exists:', !!experience.gallery);
        console.log('   is array:', Array.isArray(experience.gallery));
        console.log('   length:', experience.gallery?.length || 0);
        
        if (experience.gallery && Array.isArray(experience.gallery) && experience.gallery.length > 0) {
          console.log('✅ Found', experience.gallery.length, 'gallery images to load');
          
          const galleryData = experience.gallery.map((img: any) => ({
            id: img.id,  // ✅ Database ID for deletion
            url: img.url,
            alt: img.alt || '',
            file: null  // Existing images don't have files
          }));
          
          console.log('🖼️ Transformed gallery data for block:', galleryData);
          
          defaultBlocks.push({
            id: `gallery-${Date.now()}`,
            type: 'gallery' as BlockType,
            data: {
              images: galleryData
            },
            order: blockOrder++
          });
          console.log('✅ Gallery block added to defaultBlocks at position', defaultBlocks.length - 1);
        } else {
          console.log('⚠️ No gallery images found in experience data - skipping gallery block');
        }
        
        console.log('🧩 Created blocks:', defaultBlocks);
        
        setBlocks(defaultBlocks);
        
      } catch (error) {
        console.error('❌ Error loading experience:', error);
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
    const newBlock: Block = {
      id: `${type}-${Date.now()}`,
      type,
      data: getDefaultBlockData(type),
      order: blocks.length,
    };
    setBlocks(prev => [...prev, newBlock]);
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
      
      const newBlocks = [...prev];
      const draggedBlock = newBlocks[dragIndex];
      
      // ✅ VALIDATE DRAGGED BLOCK
      if (!draggedBlock) {
        console.error('❌ draggedBlock is undefined at index:', dragIndex);
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
      console.log('📤 Saving draft:', experienceId);
      
      const token = localStorage.getItem('auth_token');
      const formData = new FormData();
      
      // Add experience data
      formData.append('title', title || '');
      formData.append('status', 'draft');
      
      // Extract data from blocks (title is now separate)
      const datesBlock = blocks.find(b => b.type === 'dates');
      const locationBlock = blocks.find(b => b.type === 'location');
      const descriptionBlock = blocks.find(b => b.type === 'richText');
      const imageBlock = blocks.find(b => b.type === 'image');
      const agendaBlocks = blocks.filter(b => b.type === 'agendaDay');
      const highlightsBlock = blocks.find(b => b.type === 'highlights');
      const ticketsBlock = blocks.find(b => b.type === 'tickets');
      const faqBlock = blocks.find(b => b.type === 'faq');
      const resourcesBlock = blocks.find(b => b.type === 'resources');
      const logisticsBlock = blocks.find(b => b.type === 'logistics');
      
      // Use titleData (separate from blocks)
      if (titleData.text) {
        formData.append('title', titleData.text);
      }
      
      if (titleData.category) {
        formData.append('categorySlug', titleData.category);
      }
      
      if (descriptionBlock?.data?.content) {
        formData.append('description', descriptionBlock.data.content);
      }
      
      if (locationBlock?.data?.city) {
        formData.append('location', locationBlock.data.city);
        formData.append('city', locationBlock.data.city);
      }
      
      if (locationBlock?.data?.country) {
        formData.append('country', locationBlock.data.country);
      }
      
      if (datesBlock?.data?.startDate) {
        formData.append('startDate', datesBlock.data.startDate);
      }
      
      if (datesBlock?.data?.endDate) {
        formData.append('endDate', datesBlock.data.endDate);
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
      console.log('✨ Extracting highlights - highlightsBlock:', highlightsBlock);
      console.log('✨ highlightsBlock?.data?.highlights:', highlightsBlock?.data?.highlights);
      const highlights = highlightsBlock?.data?.highlights ? 
        highlightsBlock.data.highlights.map((item: any) => item.text || item) : [];
      console.log('✨ Extracted highlights:', highlights);

      // Add agenda items and highlights as JSON
      if (agendaItems.length > 0) {
        formData.append('agendaItems', JSON.stringify(agendaItems));
        console.log('📅 Saving draft with agenda items:', agendaItems);
      }

      if (highlights.length > 0) {
        formData.append('highlights', JSON.stringify(highlights));
        console.log('✨ Saving draft with highlights:', highlights);
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
        console.log('🎫 Saving draft with ticket tiers:', ticketTiers);
      }

      // Extract and add FAQ items
      if (faqBlock?.data?.items && faqBlock.data.items.length > 0) {
        const faqItems = faqBlock.data.items.map((item: any, index: number) => ({
          question: item.question || '',
          answer: item.answer || '',
          displayOrder: index
        }));
        formData.append('faqItems', JSON.stringify(faqItems));
        console.log('❓ Saving draft with FAQ items:', faqItems);
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
        console.log('📂 Saving draft with resources:', resources);
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
        console.log('🗺️ Saving draft with logistics:', logistics);
      }
      
      // Check for image in blocks
      console.log('🖼️ Checking for image upload. imageBlock:', imageBlock);
      console.log('🖼️ imageBlock?.data:', imageBlock?.data);
      console.log('🖼️ imageBlock?.data?.file:', imageBlock?.data?.file);
      
      if (imageBlock?.data?.file) {
        console.log('✅ Adding featured image to upload:', {
          fileName: imageBlock.data.file.name,
          fileSize: imageBlock.data.file.size,
          fileType: imageBlock.data.file.type
        });
        formData.append('featuredImage', imageBlock.data.file);
      } else {
        console.log('⚠️ No image file found to upload');
      }

      // Extract and add gallery images with their alt text
      const galleryBlock = blocks.find(b => b.type === 'gallery');
      console.log('🖼️ Checking for gallery images. galleryBlock:', galleryBlock);
      
      if (galleryBlock?.data?.images && Array.isArray(galleryBlock.data.images)) {
        // Filter images that have new files to upload
        const imagesToUpload = galleryBlock.data.images
          .filter((img: any) => img.file !== null && img.file !== undefined);
        
        console.log('🖼️ Found', imagesToUpload.length, 'gallery images to upload');
        
        if (imagesToUpload.length > 0) {
          const galleryAlts: string[] = [];
          
          imagesToUpload.forEach((img: any, index: number) => {
            console.log(`✅ Adding gallery image ${index + 1}:`, {
              fileName: img.file.name,
              fileSize: img.file.size,
              fileType: img.file.type,
              alt: img.alt || ''
            });
            // Append the file
            formData.append('galleryImages', img.file, img.file.name);
            // Collect alt text
            galleryAlts.push(img.alt || '');
          });
          
          // Send alt texts as JSON array
          formData.append('galleryAlts', JSON.stringify(galleryAlts));
          console.log('✅ Total gallery images appended:', imagesToUpload.length);
          console.log('✅ Gallery alt texts:', galleryAlts);
        } else {
          console.log('⚠️ No gallery image files found to upload');
        }
      } else {
        console.log('⚠️ No gallery block or images array found');
      }

      // Debug: Log all FormData entries
      console.log('📤 FormData being sent to UPDATE endpoint:');
      for (let pair of formData.entries()) {
        console.log(`   ${pair[0]}:`, pair[1]);
      }
      
      // Send update with all data including images
      const response = await fetch(`/api/Experiences/${experienceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type - browser will set it with boundary for multipart
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to save draft');
      }

      const data = await response.json();
      
      console.log('✅ Draft saved successfully!', data);
      
      toast({
        title: "Draft Saved",
        description: "Your changes have been saved as a draft.",
      });
      
      setIsPublic(false);
      
    } catch (error) {
      console.error('❌ Error saving draft:', error);
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
      console.log('📤 Publishing experience:', experienceId);
      
      const token = localStorage.getItem('auth_token');
      const formData = new FormData();
      
      // Add experience data
      formData.append('status', 'published');
      
      // Extract data from blocks (title is now separate)
      const datesBlock = blocks.find(b => b.type === 'dates');
      const locationBlock = blocks.find(b => b.type === 'location');
      const descriptionBlock = blocks.find(b => b.type === 'richText');
      const imageBlock = blocks.find(b => b.type === 'image');
      const agendaBlocks = blocks.filter(b => b.type === 'agendaDay');
      const highlightsBlock = blocks.find(b => b.type === 'highlights');
      const ticketsBlock = blocks.find(b => b.type === 'tickets');
      const faqBlock = blocks.find(b => b.type === 'faq');
      const resourcesBlock = blocks.find(b => b.type === 'resources');
      const logisticsBlock = blocks.find(b => b.type === 'logistics');
      
      // Use titleData (separate from blocks)
      if (titleData.text) {
        formData.append('title', titleData.text);
      }
      
      if (titleData.category) {
        formData.append('categorySlug', titleData.category);
      }
      
      if (descriptionBlock?.data?.content) {
        formData.append('description', descriptionBlock.data.content);
      }
      
      if (locationBlock?.data?.city) {
        formData.append('location', locationBlock.data.city);
        formData.append('city', locationBlock.data.city);
      }
      
      if (locationBlock?.data?.country) {
        formData.append('country', locationBlock.data.country);
      }
      
      if (datesBlock?.data?.startDate) {
        formData.append('startDate', datesBlock.data.startDate);
      }
      
      if (datesBlock?.data?.endDate) {
        formData.append('endDate', datesBlock.data.endDate);
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
      console.log('✨ Extracting highlights - highlightsBlock:', highlightsBlock);
      console.log('✨ highlightsBlock?.data?.highlights:', highlightsBlock?.data?.highlights);
      const highlights = highlightsBlock?.data?.highlights ? 
        highlightsBlock.data.highlights.map((item: any) => item.text || item) : [];
      console.log('✨ Extracted highlights:', highlights);

      // Add agenda items and highlights as JSON
      if (agendaItems.length > 0) {
        formData.append('agendaItems', JSON.stringify(agendaItems));
        console.log('📅 Publishing with agenda items:', agendaItems);
      }

      if (highlights.length > 0) {
        formData.append('highlights', JSON.stringify(highlights));
        console.log('✨ Publishing with highlights:', highlights);
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
        console.log('🎫 Publishing with ticket tiers:', ticketTiers);
      }

      // Extract and add FAQ items
      if (faqBlock?.data?.items && faqBlock.data.items.length > 0) {
        const faqItems = faqBlock.data.items.map((item: any, index: number) => ({
          question: item.question || '',
          answer: item.answer || '',
          displayOrder: index
        }));
        formData.append('faqItems', JSON.stringify(faqItems));
        console.log('❓ Publishing with FAQ items:', faqItems);
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
        console.log('📂 Publishing with resources:', resources);
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
        console.log('🗺️ Publishing with logistics:', logistics);
      }
      
      // Upload image if exists in blocks
      console.log('🖼️ Checking for image upload (PUBLISH). imageBlock:', imageBlock);
      console.log('🖼️ imageBlock?.data:', imageBlock?.data);
      console.log('🖼️ imageBlock?.data?.file:', imageBlock?.data?.file);
      
      if (imageBlock?.data?.file) {
        console.log('✅ Adding featured image to publish:', {
          fileName: imageBlock.data.file.name,
          fileSize: imageBlock.data.file.size,
          fileType: imageBlock.data.file.type
        });
        formData.append('featuredImage', imageBlock.data.file);
      } else {
        console.log('⚠️ No image file found to upload');
      }

      // Extract and add gallery images with their alt text
      const galleryBlockPublish = blocks.find(b => b.type === 'gallery');
      console.log('🖼️ Checking for gallery images (PUBLISH). galleryBlock:', galleryBlockPublish);
      
      if (galleryBlockPublish?.data?.images && Array.isArray(galleryBlockPublish.data.images)) {
        // Filter images that have new files to upload
        const imagesToUpload = galleryBlockPublish.data.images
          .filter((img: any) => img.file !== null && img.file !== undefined);
        
        console.log('🖼️ Found', imagesToUpload.length, 'gallery images to upload');
        
        if (imagesToUpload.length > 0) {
          const galleryAlts: string[] = [];
          
          imagesToUpload.forEach((img: any, index: number) => {
            console.log(`✅ Adding gallery image ${index + 1}:`, {
              fileName: img.file.name,
              fileSize: img.file.size,
              fileType: img.file.type,
              alt: img.alt || ''
            });
            // Append the file
            formData.append('galleryImages', img.file, img.file.name);
            // Collect alt text
            galleryAlts.push(img.alt || '');
          });
          
          // Send alt texts as JSON array
          formData.append('galleryAlts', JSON.stringify(galleryAlts));
          console.log('✅ Total gallery images appended:', imagesToUpload.length);
          console.log('✅ Gallery alt texts:', galleryAlts);
        } else {
          console.log('⚠️ No gallery image files found to upload');
        }
      } else {
        console.log('⚠️ No gallery block or images array found');
      }

      // Debug: Log all FormData entries
      console.log('📤 FormData being sent to PUBLISH endpoint:');
      for (let pair of formData.entries()) {
        console.log(`   ${pair[0]}:`, pair[1]);
      }
      
      // Send update with all data including images
      const response = await fetch(`/api/Experiences/${experienceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type - browser will set it with boundary
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to publish');
      }

      const data = await response.json();
      
      console.log('✅ Experience published successfully!', data);
      
      toast({
        title: "Experience Published!",
        description: "Your experience is now live and visible to everyone.",
      });
      
      // Update the isPublic state
      setIsPublic(true);
      
    } catch (error) {
      console.error('❌ Error publishing experience:', error);
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
    setTitle(draft.title);
    setIsPublic(draft.visibility === 'public');

    const newBlocks: Block[] = [
      {
        id: 'image-default',
        type: 'image',
        data: { url: '', alt: '' },
        order: 0,
      },
      {
        id: 'title-default',
        type: 'title',
        data: { text: draft.title },
        order: 1,
      },
      {
        id: 'dates-default',
        type: 'dates',
        data: { 
          startDate: draft.dates.startDate, 
          endDate: draft.dates.endDate 
        },
        order: 2,
      },
      {
        id: 'location-default',
        type: 'location',
        data: { 
          location: `${draft.location.city}, ${draft.location.country}` 
        },
        order: 3,
      },
      {
        id: 'richText-default',
        type: 'richText',
        data: { content: draft.description || '' },
        order: 4,
      },
    ];

    let blockOrder = 5;

    if (draft.description) {
      newBlocks.push({
        id: `richText-${Date.now()}`,
        type: 'richText',
        data: { content: draft.description },
        order: blockOrder++,
      });
    }

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
    toast({
      title: "Experience updated from voice!",
      description: "Review the changes and publish when ready.",
    });
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
      return { url: '', alt: '' };
    case 'richText':
      return { content: 'Tell your story here...' };
    case 'highlights':
      return { highlights: [] };
    case 'agendaDay':
      return { date: null, scheduleByDate: {} };
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