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
        id: 'title-default',
        type: 'title' as BlockType,
        data: { text: 'Creative Writing Workshop' },
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
        data: { city: 'Portland', country: 'USA' },
        order: 2,
      },
      {
        id: 'richText-1',
        type: 'richText' as BlockType,
        data: { content: 'Join us for an intensive creative writing workshop where you\'ll develop your craft and connect with fellow writers.' },
        order: 3,
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
        id: 'title-default',
        type: 'title' as BlockType,
        data: { text: 'Photography Masterclass' },
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
        data: { city: 'San Francisco', country: 'USA' },
        order: 2,
      }
    ]
  }
];

const ExperienceEdit = () => {
  const { experienceId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
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

  // Load experience data on mount
  useEffect(() => {
    if (experienceId) {
      const experience = mockHostedExperiences.find(exp => exp.id === experienceId);
      if (experience) {
        setTitle(experience.title);
        setIsPublic(experience.visibility === 'public');
        setBlocks(experience.blocks);
      } else {
        toast({
          title: "Experience not found",
          description: "The experience you're trying to edit doesn't exist.",
          variant: "destructive",
        });
        navigate('/account?tab=hosting');
      }
    }
  }, [experienceId, navigate, toast]);

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
  }, [blocks]);

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
    setBlocks(prev => {
      const newBlocks = [...prev];
      const draggedBlock = newBlocks[dragIndex];
      newBlocks.splice(dragIndex, 1);
      newBlocks.splice(hoverIndex, 0, draggedBlock);
      return newBlocks.map((block, index) => ({ ...block, order: index }));
    });
  }, []);

  const handleSaveDraft = useCallback(() => {
    console.log('Saving draft...', { experienceId, title, blocks, isPublic: false, host: selectedHost });
    toast({
      title: "Draft saved",
      description: "Your changes have been saved as a draft.",
    });
  }, [experienceId, title, blocks, selectedHost, toast]);

  const handlePublish = useCallback(() => {
    console.log('Publishing experience...', { experienceId, title, blocks, isPublic, host: selectedHost, teamMembers });
    toast({
      title: "Experience updated",
      description: "Your experience has been published successfully.",
    });
  }, [experienceId, title, blocks, isPublic, selectedHost, teamMembers, toast]);

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
        id: 'title-default',
        type: 'title',
        data: { text: draft.title },
        order: 0,
      },
      {
        id: 'dates-default',
        type: 'dates',
        data: { 
          startDate: draft.dates.startDate, 
          endDate: draft.dates.endDate 
        },
        order: 1,
      },
      {
        id: 'location-default',
        type: 'location',
        data: { 
          city: draft.location.city, 
          country: draft.location.country 
        },
        order: 2,
      },
    ];

    let blockOrder = 3;

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
      return { url: '', alt: '' };
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