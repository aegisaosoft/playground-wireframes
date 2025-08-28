import React, { useState, useCallback } from 'react';
import { TopBar } from '@/components/ExperienceBuilder/TopBar';
import { BlockPalette } from '@/components/ExperienceBuilder/BlockPalette';
import { Canvas } from '@/components/ExperienceBuilder/Canvas';
import { SettingsSidebar } from '@/components/ExperienceBuilder/SettingsSidebar';
import { Block, BlockType } from '@/types/experienceBuilder';

const ExperienceBuilder = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [title, setTitle] = useState('Untitled Experience');

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
    console.log('Saving draft...', { title, blocks, isPublic: false });
    // Future: API integration
  }, [title, blocks]);

  const handlePublish = useCallback(() => {
    console.log('Publishing experience...', { title, blocks, isPublic });
    // Future: API integration
  }, [title, blocks, isPublic]);

  return (
    <div className="min-h-screen bg-[#0b0b12] flex flex-col">
      <TopBar 
        title={title}
        onTitleChange={setTitle}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <BlockPalette onAddBlock={addBlock} />
        
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
        />
      </div>
    </div>
  );
};

function getDefaultBlockData(type: BlockType): any {
  switch (type) {
    case 'title':
      return { text: 'Experience Title' };
    case 'dates':
      return { startDate: null, endDate: null };
    case 'location':
      return { city: '', country: '' };
    case 'image':
      return { url: '', alt: '' };
    case 'richText':
      return { content: 'Tell your story here...' };
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
    default:
      return {};
  }
}

export default ExperienceBuilder;