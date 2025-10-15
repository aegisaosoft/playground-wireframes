import React from 'react';
import { Block } from '@/types/experienceBuilder';
import { BlockWrapper } from './BlockWrapper';
import { TitleBlock } from './blocks/TitleBlock';
import { DatesBlock } from './blocks/DatesBlock';
import { LocationBlock } from './blocks/LocationBlock';
import { ImageBlock } from './blocks/ImageBlock';
import { RichTextBlock } from './blocks/RichTextBlock';
import { HighlightsBlock } from './blocks/HighlightsBlock';
import { AgendaDayBlock } from './blocks/AgendaDayBlock';
import { TicketsBlock } from './blocks/TicketsBlock';
import { GalleryBlock } from './blocks/GalleryBlock';
import { FaqBlock } from './blocks/FaqBlock';
import { CtaBlock } from './blocks/CtaBlock';
import { ResourcesBlock } from './blocks/ResourcesBlock';
import { LogisticsBlock } from './blocks/LogisticsBlock';
import { Sparkles } from 'lucide-react';

interface CanvasProps {
  blocks: Block[];
  titleData: { text: string; category: string };
  onUpdateTitleData: (data: { text: string; category: string }) => void;
  onUpdateBlock: (id: string, data: any) => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
  onReorderBlocks: (dragIndex: number, hoverIndex: number) => void;
  blockRefsMap: React.MutableRefObject<Map<string, HTMLDivElement>>;
  highlightedBlockId: string | null;
  experienceId?: string;  // ✅ For deleting gallery images
  onDeleteGalleryImage?: (imageId: string) => Promise<void>;  // ✅ Delete callback
}

export const Canvas: React.FC<CanvasProps> = ({
  blocks,
  titleData,
  onUpdateTitleData,
  onUpdateBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onReorderBlocks,
  blockRefsMap,
  highlightedBlockId,
  experienceId,
  onDeleteGalleryImage,
}) => {
  // Find the dates block to get the date range
  const datesBlock = blocks.find(block => block.type === 'dates');
  const dateRange = datesBlock?.data ? {
    startDate: datesBlock.data.startDate ? new Date(datesBlock.data.startDate) : null,
    endDate: datesBlock.data.endDate ? new Date(datesBlock.data.endDate) : null,
  } : { startDate: null, endDate: null };

  const renderBlock = (block: Block) => {
    const props = {
      data: block.data,
      onChange: (data: any) => onUpdateBlock(block.id, data),
    };

    switch (block.type) {
      case 'title':
        return <TitleBlock {...props} />;
      case 'dates':
        return <DatesBlock {...props} />;
      case 'location':
        return <LocationBlock {...props} />;
      case 'image':
        return <ImageBlock {...props} />;
      case 'richText':
        return <RichTextBlock {...props} />;
      case 'highlights':
        return <HighlightsBlock {...props} />;
      case 'agendaDay':
        return <AgendaDayBlock {...props} dateRange={dateRange} />;
      case 'tickets':
        return <TicketsBlock {...props} />;
      case 'gallery':
        return <GalleryBlock {...props} experienceId={experienceId} onDeleteImage={onDeleteGalleryImage} />;
      case 'faq':
        return <FaqBlock {...props} />;
      case 'cta':
        return <CtaBlock {...props} />;
      case 'resources':
        return <ResourcesBlock {...props} />;
      case 'logistics':
        return <LogisticsBlock {...props} />;
      default:
        console.error('❌ Unknown block type encountered:', {
          blockId: block.id,
          blockType: block.type,
          blockTypeOf: typeof block.type,
          fullBlock: block
        });
        return (
          <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg">
            <p className="text-red-400 font-semibold">Unknown block type: {String(block.type)}</p>
            <p className="text-xs text-gray-400 mt-2">Block ID: {block.id}</p>
            <pre className="text-xs mt-2 text-gray-500 overflow-auto">
              {JSON.stringify(block, null, 2)}
            </pre>
          </div>
        );
    }
  };

  if (blocks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-dark">
        <div className="text-center p-12 max-w-md">
          <div className="w-16 h-16 bg-gradient-neon rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
            <Sparkles className="w-8 h-8 text-black" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Ready to Build Something Amazing?
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Start by adding blocks from the palette on the left. Create your perfect retreat experience with drag-and-drop simplicity.
          </p>
        </div>
      </div>
    );
  }

  // Sort blocks by order (title is now separate and always rendered first)
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);
  
  console.log('📊 Canvas state:', {
    titleData: titleData,
    totalBlocks: blocks.length,
    blockTypes: blocks.map(b => b.type),
    detailedBlocks: sortedBlocks.map((b, idx) => ({
      index: idx,
      id: b.id,
      type: b.type,
      typeOf: typeof b.type,
      order: b.order
    }))
  });

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-dark p-8">
      <div className="max-w-4xl mx-auto">
        {/* 🛡️ TITLE BLOCK - ALWAYS VISIBLE AND FIRST */}
        <div 
          className="mb-8 p-6 bg-gradient-to-r from-neon-pink/10 via-transparent to-neon-pink/10 rounded-lg border border-neon-pink/20"
          style={{ 
            visibility: 'visible', 
            opacity: 1,
            display: 'block'
          }}
        >
          <div className="mb-4 pb-2 border-b border-neon-pink/20">
            <span className="text-sm font-medium text-neon-pink uppercase tracking-wider">
              ✨ Title (Required - Always Visible)
            </span>
          </div>
          <TitleBlock 
            data={titleData} 
            onChange={onUpdateTitleData} 
          />
        </div>
        
        {/* OTHER BLOCKS */}
        {sortedBlocks.map((block, index) => (
          <BlockWrapper
            key={block.id}
            block={block}
            index={index}
            onDelete={() => onDeleteBlock(block.id)}
            onDuplicate={() => onDuplicateBlock(block.id)}
            onReorder={onReorderBlocks}
            blockRefsMap={blockRefsMap}
            isHighlighted={highlightedBlockId === block.id}
          >
            {renderBlock(block)}
          </BlockWrapper>
        ))}
      </div>
    </div>
  );
};