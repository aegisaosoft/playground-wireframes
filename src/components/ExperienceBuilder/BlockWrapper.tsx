import React, { useRef } from 'react';
import { Block } from '@/types/experienceBuilder';
import { Button } from '@/components/ui/button';
import { GripVertical, Copy, Trash2 } from 'lucide-react';

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

  return (
    <div
      ref={ref}
      className="group relative bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:border-neon-pink/30 hover:shadow-neon/10 transition-all duration-200"
    >
      {/* Block Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/20 border-b border-white/10">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab hover:text-neon-pink transition-colors" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {blockTypeLabels[block.type]}
          </span>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDuplicate}
            className="h-7 w-7 p-0 hover:bg-white/10 hover:text-neon-cyan"
          >
            <Copy className="w-3 h-3" />
          </Button>
          {isDeletable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-7 w-7 p-0 hover:bg-destructive/20 hover:text-destructive"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Block Content */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};