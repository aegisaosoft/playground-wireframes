import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Type } from "lucide-react";
import { ContentBlock } from "./RichContentEditor";
import { EditorBlock } from "./EditorBlock";
import { BlockSelector } from "./BlockSelector";
import { cn } from "@/lib/utils";

interface UnifiedRichEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  placeholder?: string;
}

export const UnifiedRichEditor = ({ blocks, onChange, placeholder }: UnifiedRichEditorProps) => {
  const [showBlockSelector, setShowBlockSelector] = useState(false);
  const [blockSelectorPosition, setBlockSelectorPosition] = useState({ x: 0, y: 0 });
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  const [insertPosition, setInsertPosition] = useState<number | null>(null);
  const [hoveredInsertIndex, setHoveredInsertIndex] = useState<number | null>(null);
  const [slashTriggerPosition, setSlashTriggerPosition] = useState<{ x: number; y: number } | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Close block selector when pressing Escape
  useEffect(() => {
    const handleKeyDown = (event: Event) => {
      const keyEvent = event as globalThis.KeyboardEvent;
      if (keyEvent.key === 'Escape' && showBlockSelector) {
        setShowBlockSelector(false);
        setInsertPosition(null);
        setSlashTriggerPosition(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showBlockSelector]);

  const addBlock = (type: ContentBlock['type'], isDivider = false, position?: number) => {
    const insertIndex = position !== undefined ? position : blocks.length;
    
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type,
      content: isDivider ? '---DIVIDER---' : '',
      order: insertIndex,
      ...(type === 'heading' && { headingLevel: 2 }),
    };

    const newBlocks = [...blocks];
    newBlocks.splice(insertIndex, 0, newBlock);
    
    // Update order for all blocks
    const reorderedBlocks = newBlocks.map((block, index) => ({
      ...block,
      order: index
    }));

    onChange(reorderedBlocks);
    setFocusedBlockId(newBlock.id);
  };

  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    onChange(blocks.map(block => 
      block.id === id ? { ...block, ...updates } : block
    ));
  };

  const removeBlock = (id: string) => {
    const newBlocks = blocks.filter(block => block.id !== id);
    const reorderedBlocks = newBlocks.map((block, index) => ({
      ...block,
      order: index
    }));
    onChange(reorderedBlocks);
    setFocusedBlockId(null);
  };

  const handleAddBlockBelow = (blockId: string, position: { x: number; y: number }) => {
    const blockIndex = blocks.findIndex(b => b.id === blockId);
    setInsertPosition(blockIndex + 1);
    setBlockSelectorPosition(position);
    setShowBlockSelector(true);
  };

  const handleAddBlockAtIndex = (index: number, position: { x: number; y: number }) => {
    setInsertPosition(index);
    setBlockSelectorPosition(position);
    setShowBlockSelector(true);
  };

  const handleSlashCommand = (position: { x: number; y: number }, insertIndex: number) => {
    setSlashTriggerPosition(position);
    setInsertPosition(insertIndex);
    setBlockSelectorPosition(position);
    setShowBlockSelector(true);
  };

  const handleSelectBlock = (type: ContentBlock['type'], isDivider = false) => {
    addBlock(type, isDivider, insertPosition || undefined);
    setShowBlockSelector(false);
    setInsertPosition(null);
    setSlashTriggerPosition(null);
  };

  const handleCloseBlockSelector = () => {
    setShowBlockSelector(false);
    setInsertPosition(null);
    setSlashTriggerPosition(null);
  };

  const handleShowInitialBlockSelector = () => {
    const rect = editorRef.current?.getBoundingClientRect();
    if (rect) {
      setBlockSelectorPosition({ x: rect.left, y: rect.top + 20 });
      setShowBlockSelector(true);
      setInsertPosition(0);
    }
  };

  const handleDragStart = (e: React.DragEvent, blockId: string) => {
    setDraggedBlock(blockId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedBlock || draggedBlock === targetId) return;

    const draggedIndex = blocks.findIndex(b => b.id === draggedBlock);
    const targetIndex = blocks.findIndex(b => b.id === targetId);
    
    const newBlocks = [...blocks];
    const [draggedItem] = newBlocks.splice(draggedIndex, 1);
    newBlocks.splice(targetIndex, 0, draggedItem);
    
    // Update order
    const reorderedBlocks = newBlocks.map((block, index) => ({
      ...block,
      order: index
    }));
    
    onChange(reorderedBlocks);
    setDraggedBlock(null);
  };

  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  return (
    <div ref={editorRef} className="space-y-1 relative">
      {sortedBlocks.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-2">
              <Type className="w-8 h-8 text-muted-foreground" />
              <p className="text-muted-foreground">
                {placeholder || "Start writing your retreat story..."}
              </p>
            </div>
            <Button
              variant="default"
              onClick={handleShowInitialBlockSelector}
              className="gap-2 bg-coral hover:bg-coral-dark text-white px-6 py-3 text-base"
              size="lg"
            >
              <Plus className="w-5 h-5" />
              Add your first content block
            </Button>
            <p className="text-xs text-muted-foreground">
              You can add text, headings, images, lists, and more
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedBlocks.map((block, index) => (
            <div key={block.id} className="relative">
              {/* Insert Block Button Between Blocks */}
              <div 
                className="group/insert relative -mb-1 -mt-1"
                onMouseEnter={() => setHoveredInsertIndex(index)}
                onMouseLeave={() => setHoveredInsertIndex(null)}
              >
                <div className={cn(
                  "absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-200",
                  hoveredInsertIndex === index ? "opacity-100 scale-100" : "opacity-0 scale-90"
                )}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-background shadow-md border-2 hover:border-coral hover:bg-coral hover:text-white gap-2 px-4"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      handleAddBlockAtIndex(index, { x: rect.left, y: rect.bottom + 5 });
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">Add block</span>
                  </Button>
                </div>
                <div className={cn(
                  "h-8 -my-2",
                  hoveredInsertIndex === index && "bg-coral/5"
                )}></div>
              </div>

              <EditorBlock
                block={block}
                onUpdate={(updates) => updateBlock(block.id, updates)}
                onRemove={() => removeBlock(block.id)}
                onAddBelow={(position) => handleAddBlockBelow(block.id, position)}
                onFocus={() => setFocusedBlockId(block.id)}
                onSlashCommand={(position) => handleSlashCommand(position, index + 1)}
                isFocused={focusedBlockId === block.id}
                isDragging={draggedBlock === block.id}
                onDragStart={(e) => handleDragStart(e, block.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, block.id)}
              />
            </div>
          ))}

          {/* Add Block at End */}
          <div className="pt-4 pb-2">
            <Button
              variant="ghost"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                handleAddBlockAtIndex(sortedBlocks.length, { x: rect.left, y: rect.bottom + 5 });
              }}
              className="w-full justify-start gap-3 py-4 text-muted-foreground hover:text-foreground hover:bg-accent/50 border-2 border-dashed border-border hover:border-coral transition-all"
            >
              <Plus className="w-5 h-5" />
              <span className="text-base">Add another block</span>
            </Button>
          </div>
        </div>
      )}

      {/* Block Selector */}
      {showBlockSelector && (
        <BlockSelector
          onSelectBlock={handleSelectBlock}
          onClose={handleCloseBlockSelector}
          position={blockSelectorPosition}
        />
      )}
    </div>
  );
};