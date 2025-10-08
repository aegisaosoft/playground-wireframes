import React from 'react';
import { BlockType } from '@/types/experienceBuilder';
import { Button } from '@/components/ui/button';
import { 
  Image, 
  FileText, 
  Stars,
  Clock, 
  Ticket, 
  Grid3X3, 
  HelpCircle, 
  MousePointer,
  Folder,
  Mic,
  Sparkles,
  MapPin
} from 'lucide-react';

interface BlockPaletteProps {
  onAddBlock: (type: BlockType) => void;
  onVoiceCreate: () => void;
  onScrollToBlock: (type: BlockType) => void;
}

const blockItems = [
  { type: 'image' as BlockType, label: 'Cover Image', icon: Image, description: '' },
  { type: 'richText' as BlockType, label: 'Description', icon: FileText, description: '' },
  { type: 'highlights' as BlockType, label: 'Highlights', icon: Stars, description: '' },
  { type: 'agendaDay' as BlockType, label: 'Agenda', icon: Clock, description: '' },
  { type: 'tickets' as BlockType, label: 'Tickets', icon: Ticket, description: '' },
  { type: 'logistics' as BlockType, label: 'Logistics & Info', icon: MapPin, description: '' },
  { type: 'gallery' as BlockType, label: 'Gallery', icon: Grid3X3, description: '' },
  { type: 'faq' as BlockType, label: 'FAQ', icon: HelpCircle, description: '' },
  { type: 'resources' as BlockType, label: 'Resources', icon: Folder, description: '' },
];

export const BlockPalette: React.FC<BlockPaletteProps> = ({ onAddBlock, onVoiceCreate, onScrollToBlock }) => {
  return (
    <div className="w-64 bg-background border-r border-border p-6">
      {/* Voice Creation Button */}
      <Button
        onClick={onVoiceCreate}
        variant="outline"
        className="w-full justify-start gap-3 h-auto py-3 mb-8 border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-colors"
      >
        <Mic className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">Create with Voice</span>
      </Button>
      
      <div className="space-y-1">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-2">
          Add Section
        </h2>
        
        {blockItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.type}
              onClick={() => onScrollToBlock(item.type)}
              className="w-full px-3 py-2.5 rounded-md hover:bg-accent transition-colors text-left group flex items-center gap-3"
            >
              <IconComponent className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="text-sm text-foreground font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};