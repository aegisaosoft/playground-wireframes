import React, { useState } from 'react';
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
  MapPin,
  Calendar,
  Plus
} from 'lucide-react';

interface BlockPaletteProps {
  onAddBlock: (type: BlockType) => void;
  onVoiceCreate: () => void;
  onScrollToBlock: (type: BlockType) => void;
}

const essentialBlocks = [
  { type: 'image' as BlockType, label: 'Cover Image', icon: Image },
  { type: 'dates' as BlockType, label: 'Dates', icon: Calendar },
  { type: 'location' as BlockType, label: 'Location', icon: MapPin },
  { type: 'richText' as BlockType, label: 'Description', icon: FileText },
  { type: 'tickets' as BlockType, label: 'Tickets', icon: Ticket },
];

const additionalBlocks = [
  { type: 'highlights' as BlockType, label: 'Highlights', icon: Stars },
  { type: 'agendaDay' as BlockType, label: 'Agenda', icon: Clock },
  { type: 'logistics' as BlockType, label: 'Logistics', icon: MapPin },
  { type: 'gallery' as BlockType, label: 'Gallery', icon: Grid3X3 },
  { type: 'faq' as BlockType, label: 'FAQ', icon: HelpCircle },
];

export const BlockPalette: React.FC<BlockPaletteProps> = ({ onAddBlock, onVoiceCreate, onScrollToBlock }) => {
  const [showMore, setShowMore] = useState(false);

  const renderBlockButton = (item: { type: BlockType; label: string; icon: any }) => {
    const IconComponent = item.icon;
    return (
      <button
        key={item.type}
        onClick={() => onScrollToBlock(item.type)}
        className="w-full p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-neon-pink/30 hover:shadow-neon/20 transition-all duration-200 text-left group"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-gradient-neon rounded-md flex items-center justify-center group-hover:shadow-neon/40">
            <IconComponent className="w-4 h-4 text-black" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-foreground font-medium group-hover:text-neon-pink transition-colors">
              {item.label}
            </div>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="w-80 bg-black/20 border-r border-white/10 p-6">
      {/* Voice Creation Button */}
      <div className="mb-6">
        <Button
          onClick={onVoiceCreate}
          className="w-full bg-gradient-to-r from-neon-purple to-neon-pink hover:from-neon-pink hover:to-neon-purple text-background font-semibold py-4 rounded-lg shadow-neon hover:shadow-neon/60 transition-all duration-300 group"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <Mic className="w-4 h-4" />
            </div>
            <span className="text-base">🎙 Create with Voice</span>
            <Sparkles className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
          </div>
        </Button>
      </div>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#0b0b12] px-2 text-muted-foreground">Or build manually</span>
        </div>
      </div>
      
      <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
        <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse" />
        Block Palette
      </h2>
      
      <div className="space-y-2">
        {/* Essential blocks */}
        {essentialBlocks.map(renderBlockButton)}
        
        {/* Add More button */}
        <button
          onClick={() => setShowMore(!showMore)}
          className="w-full p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-neon-cyan/30 transition-all duration-200 text-left group"
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 bg-gradient-to-br from-neon-cyan to-neon-purple rounded-md flex items-center justify-center transition-transform duration-200 ${showMore ? 'rotate-45' : ''}`}>
              <Plus className="w-4 h-4 text-black" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-foreground font-medium group-hover:text-neon-cyan transition-colors">
                Add more
              </div>
            </div>
          </div>
        </button>

        {/* Additional blocks (collapsible) */}
        {showMore && (
          <div className="space-y-2 pt-2">
            {additionalBlocks.map(renderBlockButton)}
          </div>
        )}
      </div>
    </div>
  );
};