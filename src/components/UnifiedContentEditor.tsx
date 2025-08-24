import { useState, useRef, useEffect, KeyboardEvent, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Upload, Trash2 } from "lucide-react";
import { ContentBlock } from "./RichContentEditor";
import { BlockSelector } from "./BlockSelector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface UnifiedContentEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  placeholder?: string;
}

interface ContentElement {
  id: string;
  type: 'paragraph' | 'heading' | 'image' | 'bullet_list' | 'divider';
  content: string;
  headingLevel?: number;
  imageUrl?: string;
  imageAlt?: string;
}

export const UnifiedContentEditor = ({ blocks, onChange, placeholder }: UnifiedContentEditorProps) => {
  const [elements, setElements] = useState<ContentElement[]>([]);
  const [showBlockSelector, setShowBlockSelector] = useState(false);
  const [blockSelectorPosition, setBlockSelectorPosition] = useState({ x: 0, y: 0 });
  const [activeElementIndex, setActiveElementIndex] = useState<number | null>(null);
  const [insertIndex, setInsertIndex] = useState(0);
  const [focusedElementIndex, setFocusedElementIndex] = useState<number | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const firstElementRef = useRef<HTMLTextAreaElement>(null);

  // Convert blocks to elements on mount and auto-focus
  useEffect(() => {
    if (blocks.length === 0) {
      setElements([{ id: '1', type: 'paragraph', content: '' }]);
    } else {
      const convertedElements: ContentElement[] = blocks.map(block => ({
        id: block.id,
        type: block.type === 'text' ? 'paragraph' : 
              block.content === '---DIVIDER---' ? 'divider' : 
              block.type as ContentElement['type'],
        content: block.content === '---DIVIDER---' ? '' : block.content,
        headingLevel: block.headingLevel,
        imageUrl: block.imageUrl,
        imageAlt: block.imageAlt
      }));
      setElements(convertedElements);
    }
  }, [blocks.length]); // Only depend on length to avoid re-render loops

  // Auto-focus the first element when editor loads
  useEffect(() => {
    if (elements.length > 0 && firstElementRef.current) {
      setTimeout(() => {
        firstElementRef.current?.focus();
      }, 100);
    }
  }, [elements.length]);

  // Memoize the conversion to avoid unnecessary re-renders
  const convertedBlocks = useMemo(() => {
    return elements.map((element, index) => ({
      id: element.id,
      type: element.type === 'paragraph' ? 'text' :
            element.type === 'divider' ? 'text' :
            element.type as ContentBlock['type'],
      content: element.type === 'divider' ? '---DIVIDER---' : element.content,
      order: index,
      headingLevel: element.headingLevel,
      imageUrl: element.imageUrl,
      imageAlt: element.imageAlt
    }));
  }, [elements]);

  // Debounced onChange to prevent re-render loops
  const debouncedOnChange = useCallback(() => {
    const timeoutId = setTimeout(() => {
      onChange(convertedBlocks);
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [convertedBlocks, onChange]);

  // Close block selector when pressing Escape  
  useEffect(() => {
    const handleKeyDown = (event: Event) => {
      const keyEvent = event as globalThis.KeyboardEvent;
      if (keyEvent.key === 'Escape' && showBlockSelector) {
        setShowBlockSelector(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showBlockSelector]);

  // Convert elements back to blocks when they change
  useEffect(() => {
    const cleanup = debouncedOnChange();
    return cleanup;
  }, [debouncedOnChange]);

  const addElement = (type: ContentBlock['type'], isDivider = false, index: number) => {
    const newElement: ContentElement = {
      id: Date.now().toString(),
      type: isDivider ? 'divider' : 
            type === 'text' ? 'paragraph' : 
            type as ContentElement['type'],
      content: '',
      ...(type === 'heading' && { headingLevel: 2 }),
    };

    const newElements = [...elements];
    newElements.splice(index, 0, newElement);
    setElements(newElements);
    setActiveElementIndex(index);
  };

  const updateElement = useCallback((index: number, updates: Partial<ContentElement>) => {
    setElements(prev => {
      const newElements = [...prev];
      newElements[index] = { ...newElements[index], ...updates };
      return newElements;
    });
  }, []);

  const removeElement = (index: number) => {
    if (elements.length === 1) {
      // Don't remove the last element, just clear it
      updateElement(index, { content: '', type: 'paragraph' });
      return;
    }
    
    const newElements = elements.filter((_, i) => i !== index);
    setElements(newElements);
    
    // Focus previous element or next if removing first
    const newFocusIndex = index > 0 ? index - 1 : 0;
    setActiveElementIndex(newFocusIndex);
  };

  const handleKeyDown = (e: KeyboardEvent, index: number) => {
    const element = elements[index];
    
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      // If current element is empty, show block selector
      if (!element.content.trim()) {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        setInsertIndex(index);
        setBlockSelectorPosition({ x: rect.left, y: rect.bottom + 5 });
        setShowBlockSelector(true);
        return;
      }
      
      // Create new paragraph after current element
      const newElement: ContentElement = {
        id: Date.now().toString(),
        type: 'paragraph',
        content: ''
      };
      
      const newElements = [...elements];
      newElements.splice(index + 1, 0, newElement);
      setElements(newElements);
      setActiveElementIndex(index + 1);
      
      // Focus the new element after a short delay
      setTimeout(() => {
        const nextInput = editorRef.current?.querySelector(`[data-element-index="${index + 1}"]`) as HTMLElement;
        nextInput?.focus();
      }, 10);
    }
    
    if ((e.key === 'Backspace' || e.key === 'Delete') && !element.content.trim()) {
      e.preventDefault();
      removeElement(index);
    }
  };

  const handlePlusClick = (index: number, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setInsertIndex(index + 1); // Insert after current element
    setBlockSelectorPosition({ x: rect.left, y: rect.bottom + 5 });
    setShowBlockSelector(true);
  };

  const handleSelectBlock = (type: ContentBlock['type'], isDivider = false) => {
    // Always insert new element at the specified index
    addElement(type, isDivider, insertIndex);
    setShowBlockSelector(false);
    setActiveElementIndex(insertIndex);
  };

  const handleImageUpload = useCallback((index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        // Use a more stable update that won't cause re-render loops
        updateElement(index, { 
          imageUrl, 
          content: file.name,
          imageAlt: file.name.replace(/\.[^/.]+$/, "") // Remove file extension for default alt
        });
      };
      reader.readAsDataURL(file);
    }
  }, [updateElement]);

  return (
    <div ref={editorRef} className="relative">
      <div className="min-h-[300px] bg-background focus-within:outline-none">
        <div className="space-y-0">
          {elements.map((element, index) => (
            <div key={element.id} className="group relative flex items-start">
              {/* Plus button - always visible when focused on this line */}
              <div className={cn(
                "flex-shrink-0 w-8 flex items-center justify-center py-2 mr-2 transition-opacity",
                (focusedElementIndex === index || (!element.content && element.type === 'paragraph')) 
                  ? "opacity-100" : "opacity-0 group-hover:opacity-60"
              )}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-7 h-7 p-0 hover:bg-coral hover:text-white rounded-full border-2 border-dashed border-muted-foreground hover:border-coral transition-all"
                  onClick={(e) => handlePlusClick(index, e)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Content area */}
              <div className="flex-1 min-h-[2rem]">
                {/* Paragraph */}
                {element.type === 'paragraph' && (
                  <textarea
                    ref={index === 0 ? firstElementRef : undefined}
                    data-element-index={index}
                    value={element.content}
                    onChange={(e) => updateElement(index, { content: e.target.value })}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onFocus={() => setFocusedElementIndex(index)}
                    onBlur={() => setFocusedElementIndex(null)}
                    placeholder={index === 0 && !element.content ? 
                      (placeholder || "Start writing your retreat story...") : 
                      "Continue writing..."}
                    className="w-full border-none outline-none resize-none bg-transparent text-base leading-relaxed py-2 placeholder:text-muted-foreground/60"
                    style={{ 
                      minHeight: '2rem',
                      height: element.content ? `${Math.max(2, element.content.split('\n').length * 1.5)}rem` : '2rem'
                    }}
                  />
                )}

                {/* Heading */}
                {element.type === 'heading' && (
                  <div className="flex items-center gap-3 py-2">
                    <input
                      data-element-index={index}
                      value={element.content}
                      onChange={(e) => updateElement(index, { content: e.target.value })}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onFocus={() => setFocusedElementIndex(index)}
                      onBlur={() => setFocusedElementIndex(null)}
                      placeholder="Heading text..."
                      className="flex-1 border-none outline-none bg-transparent font-bold placeholder:text-muted-foreground/60"
                      style={{ 
                        fontSize: element.headingLevel === 1 ? '28px' : element.headingLevel === 2 ? '22px' : '18px'
                      }}
                    />
                    <Select
                      value={element.headingLevel?.toString() || "2"}
                      onValueChange={(value) => updateElement(index, { headingLevel: parseInt(value) })}
                    >
                      <SelectTrigger className="w-16 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">H1</SelectItem>
                        <SelectItem value="2">H2</SelectItem>
                        <SelectItem value="3">H3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Image */}
                {element.type === 'image' && (
                  <div className="py-2">
                    {element.imageUrl ? (
                      <div className="space-y-3">
                        <img
                          src={element.imageUrl}
                          alt={element.imageAlt || "Content image"}
                          className="w-full max-h-64 object-cover rounded-lg"
                          loading="lazy"
                        />
                        <Input
                          value={element.imageAlt || ''}
                          onChange={(e) => updateElement(index, { imageAlt: e.target.value })}
                          onFocus={() => setFocusedElementIndex(index)}
                          onBlur={() => setFocusedElementIndex(null)}
                          placeholder="Alt text..."
                          className="text-sm border-none shadow-none bg-transparent placeholder:text-muted-foreground/60"
                        />
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                        <div className="mt-2">
                          <label 
                            htmlFor={`image-upload-${element.id}`} 
                            className="cursor-pointer inline-block"
                          >
                            <span className="text-coral hover:underline">
                              Click to upload an image
                            </span>
                          </label>
                          <input
                            id={`image-upload-${element.id}`}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(index, e)}
                            className="hidden"
                            key={`upload-${element.id}`} // Stable key to prevent recreation
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Bullet List */}
                {element.type === 'bullet_list' && (
                  <textarea
                    data-element-index={index}
                    value={element.content}
                    onChange={(e) => updateElement(index, { content: e.target.value })}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onFocus={() => setFocusedElementIndex(index)}
                    onBlur={() => setFocusedElementIndex(null)}
                    placeholder="• First item&#10;• Second item&#10;• Third item"
                    className="w-full border-none outline-none resize-none bg-transparent text-base leading-relaxed py-2 placeholder:text-muted-foreground/60"
                    style={{ 
                      minHeight: '3rem',
                      height: element.content ? `${Math.max(3, element.content.split('\n').length * 1.5)}rem` : '3rem'
                    }}
                  />
                )}

                {/* Divider */}
                {element.type === 'divider' && (
                  <div className="py-4">
                    <div className="w-full h-px bg-border"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Block Selector */}
      {showBlockSelector && (
        <BlockSelector
          onSelectBlock={handleSelectBlock}
          onClose={() => setShowBlockSelector(false)}
          position={blockSelectorPosition}
        />
      )}
    </div>
  );
};