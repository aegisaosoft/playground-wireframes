import React, { useState, useCallback, useEffect } from 'react';
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

const ExperienceBuilder = () => {
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
  
  const { toast } = useToast();

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

    // Create new blocks array starting with core blocks
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
    console.log('Saving draft...', { title, blocks, isPublic: false, host: selectedHost });
    // Future: API integration
    // If selectedHost.type === 'brand' and selectedHost.brandId, create/update brand page
  }, [title, blocks, selectedHost]);

  const handlePublish = useCallback(() => {
    // Generate unique slug for private experiences
    const uniqueSlug = isPublic ? null : `private-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const experienceData = { 
      title, 
      blocks, 
      isPublic, 
      host: selectedHost,
      privateSlug: uniqueSlug
    };
    
    console.log('Publishing experience...', experienceData);
    
    // For private experiences, show the generated link
    if (!isPublic && uniqueSlug) {
      const privateUrl = `${window.location.origin}/experience/private/${uniqueSlug}`;
      console.log('Private experience URL:', privateUrl);
    }
    
    // Future: API integration
    // If selectedHost.type === 'brand' and selectedHost.brandId, create/update brand page
  }, [title, blocks, isPublic, selectedHost]);

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
        <BlockPalette onAddBlock={addBlock} onVoiceCreate={handleVoiceCreate} />
        
        <Canvas
          blocks={blocks}
          onUpdateBlock={updateBlock}
          onDeleteBlock={deleteBlock}
          onDuplicateBlock={duplicateBlock}
          onReorderBlocks={reorderBlocks}
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
    case 'cta':
      return { text: 'Book Your Spot', style: 'primary' };
    case 'resources':
      return { resources: [] };
    default:
      return {};
  }
}

export default ExperienceBuilder;