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
  onUpdateBlock: (id: string, data: any) => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
  onReorderBlocks: (dragIndex: number, hoverIndex: number) => void;
  blockRefsMap: React.MutableRefObject<Map<string, HTMLDivElement>>;
  highlightedBlockId: string | null;
}

export const Canvas: React.FC<CanvasProps> = ({
  blocks,
  onUpdateBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onReorderBlocks,
  blockRefsMap,
  highlightedBlockId,
}) => {
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
        return <AgendaDayBlock {...props} />;
      case 'tickets':
        return <TicketsBlock {...props} />;
      case 'gallery':
        return <GalleryBlock {...props} />;
      case 'faq':
        return <FaqBlock {...props} />;
      case 'cta':
        return <CtaBlock {...props} />;
      case 'resources':
        return <ResourcesBlock {...props} />;
      case 'logistics':
        return <LogisticsBlock {...props} />;
      default:
        return <div>Unknown block type</div>;
    }
  };

  if (blocks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center p-12 max-w-md">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Start building your experience
          </h2>
          <p className="text-sm text-muted-foreground">
            Add sections from the sidebar to create your experience page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="max-w-3xl mx-auto py-12 px-8">
        {blocks.map((block, index) => (
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