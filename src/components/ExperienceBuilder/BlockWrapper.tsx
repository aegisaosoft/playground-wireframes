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

  const isLastCoreBlock = ['dates-default', 'location-default'].includes(block.id) && 
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
    const dragIndexStr = e.dataTransfer.getData('text/plain');
    const dragIndex = parseInt(dragIndexStr);
    const hoverIndex = dragOver === 'top' ? index : index + 1;
    
    console.log('🎯 Drop event:', {
      dragIndexStr,
      dragIndex,
      isNaN: isNaN(dragIndex),
      hoverIndex,
      currentBlockId: block.id
    });
    
    // Validate dragIndex
    if (isNaN(dragIndex)) {
      console.error('❌ Invalid dragIndex (NaN) - ignoring drop');
      setDragOver(null);
      return;
    }
    
    if (dragIndex !== hoverIndex && dragIndex !== hoverIndex - 1) {
      onReorder(dragIndex, hoverIndex > dragIndex ? hoverIndex - 1 : hoverIndex);
    }
    
    setDragOver(null);
  };

  return (
    <div
      ref={ref}
      className={`group relative transition-all duration-300 ${
        // Title block can NEVER be dragging or invisible
        isDragging && block.id !== 'title-default' ? 'opacity-50' : ''
      } ${dragOver ? 'scale-105' : ''} ${
        isHighlighted 
          ? 'ring-2 ring-neon-pink shadow-[0_0_30px_rgba(255,71,209,0.5)] animate-pulse' 
          : ''
      }`}
      style={block.id === 'title-default' ? {
        visibility: 'visible',
        opacity: 1,
        display: 'block',
        minHeight: 'auto'
      } : undefined}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drop indicator */}
      {dragOver === 'top' && (
        <div className="absolute -top-1 left-0 right-0 h-0.5 bg-neon-purple rounded-full z-10" />
      )}
      {dragOver === 'bottom' && (
        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-neon-purple rounded-full z-10" />
      )}

      {/* Block Header */}
      {!['dates-default', 'location-default'].includes(block.id) && (
        <div className={`flex items-center justify-between mb-3 ${
          block.id === 'title-default' ? 'pb-2 border-b border-neon-pink/20' : ''
        }`}>
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 text-muted-foreground cursor-grab hover:text-neon-pink transition-colors active:cursor-grabbing"
              draggable
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <GripVertical className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1">
              <span className={`text-sm font-medium ${
                block.id === 'title-default' ? 'text-neon-pink uppercase tracking-wider' : 'text-foreground'
              }`}>
                {block.id === 'title-default' ? '✨ ' : ''}{blockTypeLabels[block.type]}{block.id === 'title-default' ? ' (Required)' : ''}
              </span>
            </div>
          </div>
          
          {isDeletable && block.id !== 'title-default' && (
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
          )}
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