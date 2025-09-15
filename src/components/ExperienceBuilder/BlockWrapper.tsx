import React, { useRef } from 'react';
import { Block } from '@/types/experienceBuilder';
import { Button } from '@/components/ui/button';
import { GripVertical, Copy, Trash2, MapPin } from 'lucide-react';

interface BlockWrapperProps {
  block: Block;
  index: number;
  onDelete: () => void;
  onDuplicate: () => void;
  onReorder: (dragIndex: number, hoverIndex: number) => void;
  children: React.ReactNode;
}

export const BlockWrapper: React.FC<BlockWrapperProps> = ({
  block,
  index,
  onDelete,
  onDuplicate,
  onReorder,
  children,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  
  // Core blocks that cannot be deleted
  const coreBlocks = ['title-default', 'dates-default', 'location-default'];
  const isDeletable = !coreBlocks.includes(block.id);

  const blockTypeLabels = {
    title: 'Title',
    dates: 'Dates', 
    location: 'Location',
    image: 'Image',
    richText: 'Rich Text',
    agendaDay: 'Agenda Day',
    tickets: 'Ticket Tiers',
    gallery: 'Gallery',
    faq: 'FAQ',
    cta: 'Call to Action',
  };

  const isLastCoreBlock = ['title-default', 'dates-default', 'location-default'].includes(block.id) && 
    block.id === 'location-default';

  return (
    <div
      ref={ref}
      className="group relative"
    >
      {/* Block Header - Only show for non-core blocks */}
      {!coreBlocks.includes(block.id) && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab hover:text-neon-pink transition-colors" />
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-foreground">
                {blockTypeLabels[block.type]}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDuplicate}
              className="h-8 w-8 p-0 hover:bg-white/10 hover:text-neon-cyan"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Block Content */}
      <div className="mb-8">
        {children}
      </div>

      {/* Subtle divider after core blocks */}
      {isLastCoreBlock && (
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8"></div>
      )}
    </div>
  );
};