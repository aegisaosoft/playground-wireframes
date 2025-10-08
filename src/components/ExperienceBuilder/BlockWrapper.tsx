import React, { useRef, useState, useEffect } from 'react';
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
  blockRefsMap: React.MutableRefObject<Map<string, HTMLDivElement>>;
  isHighlighted: boolean;
}

export const BlockWrapper: React.FC<BlockWrapperProps> = ({
  block,
  index,
  onDelete,
  onDuplicate,
  onReorder,
  children,
  blockRefsMap,
  isHighlighted,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOver, setDragOver] = useState<'top' | 'bottom' | null>(null);
  
  // Register this block's ref
  useEffect(() => {
    if (ref.current) {
      blockRefsMap.current.set(block.id, ref.current);
    }
    return () => {
      blockRefsMap.current.delete(block.id);
    };
  }, [block.id, blockRefsMap]);
  
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

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragOver(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      const midpoint = rect.top + rect.height / 2;
      setDragOver(e.clientY < midpoint ? 'top' : 'bottom');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear dragOver if we're leaving the block entirely
    if (!ref.current?.contains(e.relatedTarget as Node)) {
      setDragOver(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    const hoverIndex = dragOver === 'top' ? index : index + 1;
    
    if (dragIndex !== hoverIndex && dragIndex !== hoverIndex - 1) {
      onReorder(dragIndex, hoverIndex > dragIndex ? hoverIndex - 1 : hoverIndex);
    }
    
    setDragOver(null);
  };

  return (
    <div
      ref={ref}
      className={`group relative transition-all duration-200 ${
        isDragging ? 'opacity-40' : ''
      } ${
        isHighlighted 
          ? 'ring-2 ring-primary/50' 
          : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drop indicator */}
      {dragOver === 'top' && (
        <div className="absolute -top-1 left-0 right-0 h-0.5 bg-primary z-10" />
      )}
      {dragOver === 'bottom' && (
        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary z-10" />
      )}

      {/* Block Header - Only show for non-core blocks */}
      {!coreBlocks.includes(block.id) && (
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div 
              className="text-muted-foreground cursor-grab hover:text-foreground transition-colors active:cursor-grabbing"
              draggable
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <GripVertical className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-foreground">
              {blockTypeLabels[block.type]}
            </span>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDuplicate}
              className="h-8 w-8 p-0 hover:bg-accent"
            >
              <Copy className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Block Content */}
      <div className="mb-12">
        {children}
      </div>

      {/* Subtle divider after core blocks */}
      {isLastCoreBlock && (
        <div className="h-px bg-border mb-12"></div>
      )}
    </div>
  );
};