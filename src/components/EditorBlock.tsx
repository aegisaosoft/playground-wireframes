import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Upload, GripVertical, MoreHorizontal } from "lucide-react";
import { ContentBlock } from "./RichContentEditor";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EditorBlockProps {
  block: ContentBlock;
  onUpdate: (updates: Partial<ContentBlock>) => void;
  onRemove: () => void;
  onAddBelow: (position: { x: number; y: number }) => void;
  onFocus: () => void;
  onSlashCommand?: (position: { x: number; y: number }) => void;
  isFocused: boolean;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export const EditorBlock = ({ 
  block, 
  onUpdate, 
  onRemove, 
  onAddBelow, 
  onFocus, 
  onSlashCommand,
  isFocused,
  isDragging,
  onDragStart,
  onDragOver,
  onDrop
}: EditorBlockProps) => {
  const [showControls, setShowControls] = useState(false);
  const blockRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isFocused && block.type === 'text' && textareaRef.current) {
      textareaRef.current.focus();
    }
    if (isFocused && block.type === 'heading' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused, block.type]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        onUpdate({ imageUrl, content: file.name });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      e.preventDefault();
      const rect = blockRef.current?.getBoundingClientRect();
      if (rect) {
        onAddBelow({ x: rect.left, y: rect.bottom + 5 });
      }
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    onUpdate({ content: value });
    
    // Check for slash command
    if (value === '/' && onSlashCommand) {
      const rect = e.target.getBoundingClientRect();
      onSlashCommand({ x: rect.left, y: rect.bottom + 5 });
      // Clear the slash
      onUpdate({ content: '' });
    }
  };

  const handlePlusClick = () => {
    const rect = blockRef.current?.getBoundingClientRect();
    if (rect) {
      onAddBelow({ x: rect.left, y: rect.bottom + 5 });
    }
  };

  // Check if this is a divider block
  const isDivider = block.type === 'text' && block.content === '---DIVIDER---';

  if (isDivider) {
    return (
      <div
        ref={blockRef}
        className={cn(
          "group relative my-6 py-2",
          isDragging && "opacity-50"
        )}
        draggable
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
        onClick={onFocus}
      >
        {/* Controls */}
        <div className={cn(
          "absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-full flex items-center gap-1 pr-2 transition-opacity",
          showControls || isFocused ? "opacity-100" : "opacity-0"
        )}>
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 cursor-move hover:bg-accent"
            onMouseDown={(e) => e.preventDefault()}
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 hover:bg-coral hover:text-white transition-colors"
            onClick={handlePlusClick}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-border"></div>
          
          {(showControls || isFocused) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="w-6 h-6 p-0">
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                <DropdownMenuItem onClick={onRemove} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <div className="flex-1 h-px bg-border"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={blockRef}
      className={cn(
        "group relative",
        isFocused && "ring-2 ring-coral/20 rounded-lg",
        isDragging && "opacity-50"
      )}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onClick={onFocus}
      onKeyDown={handleKeyDown}
    >
      {/* Controls */}
      <div className={cn(
        "absolute left-0 top-0 transform -translate-x-full flex items-start gap-1 pr-3 pt-3 transition-opacity",
        showControls || isFocused ? "opacity-100" : "opacity-0"
      )}>
        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 p-0 cursor-move hover:bg-accent"
          onMouseDown={(e) => e.preventDefault()}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 p-0 hover:bg-coral hover:text-white transition-colors"
          onClick={handlePlusClick}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Block Content */}
      <div className="pl-1">
        {block.type === 'text' && (
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={block.content}
              onChange={handleTextChange}
              placeholder="Type something or press '/' for commands..."
              className="border-none shadow-none resize-none p-4 focus:ring-0 min-h-[80px] text-base leading-relaxed"
            />
            {block.content === '' && (
              <div className="absolute left-4 top-4 text-muted-foreground/50 pointer-events-none text-base">
                Type '/' to see block options
              </div>
            )}
          </div>
        )}

        {block.type === 'heading' && (
          <div className="space-y-3 p-4">
            <div className="flex items-center gap-3">
              <Input
                ref={inputRef}
                value={block.content}
                onChange={(e) => onUpdate({ content: e.target.value })}
                placeholder="Heading text..."
                className="border-none shadow-none font-bold focus:ring-0 p-0 text-2xl"
                style={{ 
                  fontSize: block.headingLevel === 1 ? '32px' : block.headingLevel === 2 ? '24px' : '20px'
                }}
              />
              <Select
                value={block.headingLevel?.toString() || "2"}
                onValueChange={(value) => onUpdate({ headingLevel: parseInt(value) })}
              >
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">H1</SelectItem>
                  <SelectItem value="2">H2</SelectItem>
                  <SelectItem value="3">H3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {block.type === 'image' && (
          <div className="p-4 space-y-3">
            <div className="border-2 border-dashed border-border rounded-lg p-6">
              {block.imageUrl ? (
                <div className="space-y-3">
                  <img
                    src={block.imageUrl}
                    alt={block.imageAlt || "Content image"}
                    className="w-full max-h-64 object-cover rounded-lg"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdate({ imageUrl: '', content: '' })}
                    >
                      Remove Image
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div className="mt-4">
                    <label htmlFor={`image-upload-${block.id}`} className="cursor-pointer">
                      <span className="text-coral hover:underline text-base font-medium">
                        Click to upload an image
                      </span>
                      <input
                        id={`image-upload-${block.id}`}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    or drag and drop
                  </p>
                </div>
              )}
            </div>
            <Input
              value={block.imageAlt || ''}
              onChange={(e) => onUpdate({ imageAlt: e.target.value })}
              placeholder="Alt text (optional)"
              className="text-sm"
            />
          </div>
        )}

        {block.type === 'bullet_list' && (
          <div className="p-4">
            <Textarea
              value={block.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              placeholder="• First item&#10;• Second item&#10;• Third item"
              className="border-none shadow-none resize-none focus:ring-0 min-h-[100px] text-base leading-relaxed"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Each line will become a bullet point
            </p>
          </div>
        )}
      </div>

      {/* Remove button */}
      {(showControls || isFocused) && (
        <div className="absolute right-3 top-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0 hover:bg-accent">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onRemove} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete block
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
};