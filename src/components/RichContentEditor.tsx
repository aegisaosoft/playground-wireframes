import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Upload, GripVertical, Type, Image as ImageIcon, List, Heading } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ContentBlock {
  id: string;
  type: 'text' | 'heading' | 'image' | 'bullet_list';
  content: string;
  imageUrl?: string;
  imageAlt?: string;
  headingLevel?: number;
  order: number;
}

interface RichContentEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

export const RichContentEditor = ({ blocks, onChange }: RichContentEditorProps) => {
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);

  const addBlock = (type: ContentBlock['type']) => {
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type,
      content: '',
      order: blocks.length,
      ...(type === 'heading' && { headingLevel: 2 }),
    };
    onChange([...blocks, newBlock]);
  };

  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    onChange(blocks.map(block => 
      block.id === id ? { ...block, ...updates } : block
    ));
  };

  const removeBlock = (id: string) => {
    onChange(blocks.filter(block => block.id !== id));
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

  const handleImageUpload = (blockId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        updateBlock(blockId, { imageUrl, content: file.name });
      };
      reader.readAsDataURL(file);
    }
  };

  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Content Blocks</h4>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addBlock('text')}
          >
            <Type className="w-4 h-4 mr-2" />
            Text
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addBlock('heading')}
          >
            <Heading className="w-4 h-4 mr-2" />
            Heading
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addBlock('image')}
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Image
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addBlock('bullet_list')}
          >
            <List className="w-4 h-4 mr-2" />
            List
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {sortedBlocks.map((block) => (
          <Card
            key={block.id}
            className={cn(
              "border transition-all duration-200",
              draggedBlock === block.id && "opacity-50"
            )}
            draggable
            onDragStart={(e) => handleDragStart(e, block.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, block.id)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                <CardTitle className="text-sm capitalize">
                  {block.type.replace('_', ' ')} Block
                </CardTitle>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeBlock(block.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {block.type === 'text' && (
                <div>
                  <Label>Text Content</Label>
                  <Textarea
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                    placeholder="Enter your text content..."
                    rows={4}
                  />
                </div>
              )}

              {block.type === 'heading' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Heading Text</Label>
                      <Input
                        value={block.content}
                        onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                        placeholder="Enter heading text..."
                      />
                    </div>
                    <div>
                      <Label>Heading Level</Label>
                      <Select
                        value={block.headingLevel?.toString() || "2"}
                        onValueChange={(value) => updateBlock(block.id, { headingLevel: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">H1 - Large</SelectItem>
                          <SelectItem value="2">H2 - Medium</SelectItem>
                          <SelectItem value="3">H3 - Small</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {block.type === 'image' && (
                <div className="space-y-3">
                  <div>
                    <Label>Image</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-4">
                      {block.imageUrl ? (
                        <div className="space-y-2">
                          <img
                            src={block.imageUrl}
                            alt={block.imageAlt || "Content image"}
                            className="w-full max-h-48 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateBlock(block.id, { imageUrl: '', content: '' })}
                          >
                            Remove Image
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                          <div className="mt-2">
                            <label htmlFor={`image-upload-${block.id}`} className="cursor-pointer">
                              <span className="text-coral hover:underline text-sm">
                                Upload an image
                              </span>
                              <input
                                id={`image-upload-${block.id}`}
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(block.id, e)}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label>Alt Text (Optional)</Label>
                    <Input
                      value={block.imageAlt || ''}
                      onChange={(e) => updateBlock(block.id, { imageAlt: e.target.value })}
                      placeholder="Describe the image for accessibility..."
                    />
                  </div>
                </div>
              )}

              {block.type === 'bullet_list' && (
                <div>
                  <Label>List Items (one per line)</Label>
                  <Textarea
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                    placeholder="• First item&#10;• Second item&#10;• Third item"
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Each line will become a bullet point
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {blocks.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center text-muted-foreground">
            <div className="space-y-2">
              <p>No content blocks yet</p>
              <p className="text-sm">Add text, headings, images, or lists to create your retreat story</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};