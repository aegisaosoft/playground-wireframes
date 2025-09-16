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
import { Sparkles } from 'lucide-react';

interface CanvasProps {
  blocks: Block[];
  onUpdateBlock: (id: string, data: any) => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
  onReorderBlocks: (dragIndex: number, hoverIndex: number) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  blocks,
  onUpdateBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onReorderBlocks,
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
      default:
        return <div>Unknown block type</div>;
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

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-dark p-8">
      <div className="max-w-4xl mx-auto">
        {blocks.map((block, index) => (
          <BlockWrapper
            key={block.id}
            block={block}
            index={index}
            onDelete={() => onDeleteBlock(block.id)}
            onDuplicate={() => onDuplicateBlock(block.id)}
            onReorder={onReorderBlocks}
          >
            {renderBlock(block)}
          </BlockWrapper>
        ))}
      </div>
    </div>
  );
};