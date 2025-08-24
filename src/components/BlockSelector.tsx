import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Type, Heading, Image, List, Minus, Search } from "lucide-react";
import { ContentBlock } from "./RichContentEditor";

export interface BlockType {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  type: ContentBlock['type'];
}

const blockTypes: BlockType[] = [
  {
    id: 'text',
    name: 'Text',
    description: 'Add a paragraph of text',
    icon: Type,
    type: 'text'
  },
  {
    id: 'heading',
    name: 'Heading',
    description: 'Add a section heading',
    icon: Heading,
    type: 'heading'
  },
  {
    id: 'image',
    name: 'Image',
    description: 'Upload and display an image',
    icon: Image,
    type: 'image'
  },
  {
    id: 'bullet_list',
    name: 'Bullet List',
    description: 'Create a bulleted list',
    icon: List,
    type: 'bullet_list'
  },
  {
    id: 'divider',
    name: 'Divider',
    description: 'Add a visual separator',
    icon: Minus,
    type: 'text' // We'll handle this as a special text block
  }
];

interface BlockSelectorProps {
  onSelectBlock: (type: ContentBlock['type'], isDivider?: boolean) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

export const BlockSelector = ({ onSelectBlock, onClose, position }: BlockSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBlocks = blockTypes.filter(block =>
    block.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    block.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectBlock = (blockType: BlockType) => {
    if (blockType.id === 'divider') {
      onSelectBlock('text', true); // Pass special flag for divider
    } else {
      onSelectBlock(blockType.type);
    }
    onClose();
  };

  return (
    <>
      {/* Overlay to close selector when clicking outside */}
      <div 
        className="fixed inset-0 z-40 bg-transparent"
        onClick={onClose}
      />
      
      {/* Block selector positioned within viewport */}
      <div 
        className="fixed z-50 w-80 max-w-[90vw]"
        style={{ 
          left: Math.min(Math.max(position.x, 10), window.innerWidth - 320 - 10),
          top: Math.min(Math.max(position.y, 10), window.innerHeight - 400 - 10),
          maxHeight: Math.min(400, window.innerHeight - 20)
        }}
      >
        <Card className="border shadow-lg bg-background">
          <CardContent className="p-3">
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search blocks..."
                className="pl-9 h-8 text-sm"
                autoFocus
              />
            </div>

            {/* Block Options */}
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {filteredBlocks.map((block) => {
                const IconComponent = block.icon;
                return (
                  <Button
                    key={block.id}
                    variant="ghost"
                    className="w-full justify-start h-auto p-3 hover:bg-accent"
                    onClick={() => handleSelectBlock(block)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <IconComponent className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-sm">{block.name}</div>
                        <div className="text-xs text-muted-foreground">{block.description}</div>
                      </div>
                    </div>
                  </Button>
                );
              })}
              
              {filteredBlocks.length === 0 && (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  No blocks found
                </div>
              )}
            </div>
          </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};