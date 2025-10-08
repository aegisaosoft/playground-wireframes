import React, { useState, useEffect } from 'react';
import { Block, BlockType } from '@/types/experienceBuilder';
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
import { 
  Sparkles,
  Image, 
  FileText, 
  Stars,
  Clock, 
  Ticket, 
  Grid3X3, 
  HelpCircle, 
  MousePointer,
  Folder,
  MapPin,
  Mic
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CanvasProps {
  blocks: Block[];
  onUpdateBlock: (id: string, data: any) => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
  onReorderBlocks: (dragIndex: number, hoverIndex: number) => void;
  blockRefsMap: React.MutableRefObject<Map<string, HTMLDivElement>>;
  highlightedBlockId: string | null;
  onAddBlock: (type: BlockType) => void;
  onVoiceCreate: () => void;
}

const blockItems = [
  { type: 'image' as BlockType, label: 'Cover Image', icon: Image, gradient: 'from-neon-purple to-neon-pink' },
  { type: 'richText' as BlockType, label: 'Description', icon: FileText, gradient: 'from-neon-cyan to-neon-purple' },
  { type: 'highlights' as BlockType, label: 'Highlights', icon: Stars, gradient: 'from-neon-yellow to-neon-orange' },
  { type: 'agendaDay' as BlockType, label: 'Agenda', icon: Clock, gradient: 'from-neon-pink to-neon-yellow' },
  { type: 'tickets' as BlockType, label: 'Tickets', icon: Ticket, gradient: 'from-neon-cyan to-neon-green' },
  { type: 'logistics' as BlockType, label: 'Logistics & Info', icon: MapPin, gradient: 'from-neon-orange to-neon-pink' },
  { type: 'gallery' as BlockType, label: 'Gallery', icon: Grid3X3, gradient: 'from-neon-purple to-neon-cyan' },
  { type: 'faq' as BlockType, label: 'FAQ', icon: HelpCircle, gradient: 'from-neon-green to-neon-cyan' },
  { type: 'resources' as BlockType, label: 'Resources', icon: Folder, gradient: 'from-neon-pink to-neon-purple' },
  { type: 'cta' as BlockType, label: 'Call to Action', icon: MousePointer, gradient: 'from-neon-yellow to-neon-pink' },
];

export const Canvas: React.FC<CanvasProps> = ({
  blocks,
  onUpdateBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onReorderBlocks,
  blockRefsMap,
  highlightedBlockId,
  onAddBlock,
  onVoiceCreate,
}) => {
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(
    new Set(['title-default', 'dates-default', 'location-default'])
  );

  // Auto-expand newly added blocks
  useEffect(() => {
    const currentBlockIds = new Set(blocks.map(b => b.id));
    const newBlockIds = Array.from(currentBlockIds).filter(id => !expandedBlocks.has(id) && !id.startsWith('title-') && !id.startsWith('dates-') && !id.startsWith('location-'));
    
    if (newBlockIds.length > 0) {
      setExpandedBlocks(prev => {
        const newSet = new Set(prev);
        newBlockIds.forEach(id => newSet.add(id));
        return newSet;
      });
    }
  }, [blocks]);

  const toggleBlock = (blockId: string) => {
    setExpandedBlocks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(blockId)) {
        newSet.delete(blockId);
      } else {
        newSet.add(blockId);
      }
      return newSet;
    });
  };
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
      <div className="flex-1 flex items-center justify-center bg-gradient-dark p-8">
        <div className="max-w-4xl mx-auto w-full space-y-4">
          <div className="text-center p-12 max-w-md mx-auto">
            <div className="w-16 h-16 bg-gradient-neon rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
              <Sparkles className="w-8 h-8 text-black" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Ready to Build Something Amazing?
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Click the buttons below to add blocks and build your experience.
            </p>
          </div>
          
          {/* Voice Creation Button */}
          <Button
            onClick={onVoiceCreate}
            className="w-full h-12 bg-gradient-to-r from-neon-purple to-neon-pink hover:from-neon-pink hover:to-neon-purple text-background font-semibold rounded-xl shadow-neon hover:shadow-neon/60 transition-all duration-300 group flex items-center justify-center gap-3"
          >
            <Mic className="w-5 h-5" />
            <span>🎙 Create with Voice</span>
            <Sparkles className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
          </Button>

          {/* All Block Buttons */}
          <div className="space-y-2">
            {blockItems.map(item => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.type}
                  onClick={() => onAddBlock(item.type)}
                  className={`w-full h-12 bg-gradient-to-r ${item.gradient} hover:opacity-90 text-background font-medium rounded-xl transition-all duration-200 flex items-center gap-3 px-4`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-dark p-8">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Voice Creation Button */}
        <Button
          onClick={onVoiceCreate}
          className="w-full h-12 bg-gradient-to-r from-neon-purple to-neon-pink hover:from-neon-pink hover:to-neon-purple text-background font-semibold rounded-xl shadow-neon hover:shadow-neon/60 transition-all duration-300 group flex items-center justify-center gap-3"
        >
          <Mic className="w-5 h-5" />
          <span>🎙 Create with Voice</span>
          <Sparkles className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
        </Button>

        {/* Existing Blocks */}
        {blocks.map((block, index) => {
          const isExpanded = expandedBlocks.has(block.id);
          const blockItem = blockItems.find(b => b.type === block.type);
          const IconComponent = blockItem?.icon;
          
          return (
            <div key={block.id} className="space-y-2">
              {/* Collapsed Button View */}
              {!isExpanded && (
                <button
                  onClick={() => toggleBlock(block.id)}
                  className={`w-full h-12 bg-gradient-to-r ${blockItem?.gradient || 'from-neon-pink to-neon-cyan'} hover:opacity-90 text-background font-medium rounded-xl transition-all duration-200 flex items-center gap-3 px-4`}
                >
                  {IconComponent && <IconComponent className="w-5 h-5" />}
                  <span>{blockItem?.label || block.type}</span>
                </button>
              )}
              
              {/* Expanded Block View */}
              {isExpanded && (
                <div>
                  {/* Collapse Button */}
                  <button
                    onClick={() => toggleBlock(block.id)}
                    className={`w-full h-12 bg-gradient-to-r ${blockItem?.gradient || 'from-neon-pink to-neon-cyan'} hover:opacity-90 text-background font-medium rounded-xl transition-all duration-200 flex items-center gap-3 px-4 mb-4`}
                  >
                    {IconComponent && <IconComponent className="w-5 h-5" />}
                    <span>{blockItem?.label || block.type}</span>
                  </button>
                  
                  {/* Block Content */}
                  <BlockWrapper
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
                </div>
              )}
            </div>
          );
        })}

        {/* Available Block Buttons (not yet added) */}
        <div className="space-y-2 pt-4 border-t border-white/10">
          {blockItems
            .filter(item => !blocks.some(block => block.type === item.type))
            .map(item => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.type}
                  onClick={() => {
                    onAddBlock(item.type);
                    // Auto-expand will happen on next render when block is created
                  }}
                  className={`w-full h-12 bg-gradient-to-r ${item.gradient} hover:opacity-90 text-background font-medium rounded-xl transition-all duration-200 flex items-center gap-3 px-4`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
};