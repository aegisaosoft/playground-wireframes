import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Image as ImageIcon,
  FileText,
  Stars,
  Clock,
  Ticket,
  Grid3X3,
  HelpCircle,
  Folder,
  Info
} from 'lucide-react';
import { BlockType } from '@/types/experienceBuilder';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AddBlockButtonProps {
  onAddBlock: (type: BlockType) => void;
  excludeTypes?: BlockType[];
}

interface BlockOption {
  type: BlockType;
  label: string;
  icon: any;
  description: string;
  category: 'content' | 'booking' | 'operations';
}

const blockOptions: BlockOption[] = [
  // Content blocks
  { type: 'image', label: 'Cover Image', icon: ImageIcon, description: 'Add hero image', category: 'content' },
  { type: 'richText', label: 'Description', icon: FileText, description: 'Rich text content', category: 'content' },
  { type: 'highlights', label: 'Highlights', icon: Stars, description: 'Key features list', category: 'content' },
  { type: 'agendaDay', label: 'Agenda Day', icon: Clock, description: 'Daily schedule', category: 'content' },
  { type: 'gallery', label: 'Gallery', icon: Grid3X3, description: 'Image gallery', category: 'content' },
  
  // Booking blocks
  { type: 'tickets', label: 'Tickets', icon: Ticket, description: 'Ticket tiers & pricing', category: 'booking' },
  
  // Operations blocks
  { type: 'logistics', label: 'Logistics & Info', icon: Info, description: 'Travel & accommodation', category: 'operations' },
  { type: 'resources', label: 'Resources', icon: Folder, description: 'Files & documents', category: 'operations' },
  { type: 'faq', label: 'FAQ', icon: HelpCircle, description: 'Common questions', category: 'operations' },
];

export const AddBlockButton: React.FC<AddBlockButtonProps> = ({ 
  onAddBlock,
  excludeTypes = []
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const availableBlocks = blockOptions.filter(
    block => !excludeTypes.includes(block.type)
  );

  const groupedBlocks = {
    content: availableBlocks.filter(b => b.category === 'content'),
    booking: availableBlocks.filter(b => b.category === 'booking'),
    operations: availableBlocks.filter(b => b.category === 'operations'),
  };

  const handleAddBlock = (type: BlockType) => {
    onAddBlock(type);
    setIsOpen(false);
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 h-14 px-6 bg-gradient-neon text-black font-semibold hover:opacity-90 shadow-neon z-50"
        size="lg"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add Section
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl bg-gradient-dark border-white/10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground">Add Section</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Choose a block type to add to your experience
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Content Blocks */}
            {groupedBlocks.content.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                  Content
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {groupedBlocks.content.map((block) => {
                    const Icon = block.icon;
                    return (
                      <button
                        key={block.type}
                        onClick={() => handleAddBlock(block.type)}
                        className="flex items-start gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-neon-cyan/50 rounded-lg transition-all text-left group"
                      >
                        <div className="p-2 bg-neon-cyan/10 rounded-lg group-hover:bg-neon-cyan/20 transition-colors">
                          <Icon className="w-5 h-5 text-neon-cyan" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground mb-0.5">{block.label}</div>
                          <div className="text-xs text-muted-foreground">{block.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Booking Blocks */}
            {groupedBlocks.booking.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                  Booking
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {groupedBlocks.booking.map((block) => {
                    const Icon = block.icon;
                    return (
                      <button
                        key={block.type}
                        onClick={() => handleAddBlock(block.type)}
                        className="flex items-start gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-neon-purple/50 rounded-lg transition-all text-left group"
                      >
                        <div className="p-2 bg-neon-purple/10 rounded-lg group-hover:bg-neon-purple/20 transition-colors">
                          <Icon className="w-5 h-5 text-neon-purple" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground mb-0.5">{block.label}</div>
                          <div className="text-xs text-muted-foreground">{block.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Operations Blocks */}
            {groupedBlocks.operations.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                  Operations
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {groupedBlocks.operations.map((block) => {
                    const Icon = block.icon;
                    return (
                      <button
                        key={block.type}
                        onClick={() => handleAddBlock(block.type)}
                        className="flex items-start gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-neon-yellow/50 rounded-lg transition-all text-left group"
                      >
                        <div className="p-2 bg-neon-yellow/10 rounded-lg group-hover:bg-neon-yellow/20 transition-colors">
                          <Icon className="w-5 h-5 text-neon-yellow" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground mb-0.5">{block.label}</div>
                          <div className="text-xs text-muted-foreground">{block.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
