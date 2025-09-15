import React from 'react';
import { BlockType } from '@/types/experienceBuilder';
import { 
  Image, 
  FileText, 
  Clock, 
  Ticket, 
  Grid3X3, 
  HelpCircle, 
  MousePointer 
} from 'lucide-react';

interface BlockPaletteProps {
  onAddBlock: (type: BlockType) => void;
}

const blockItems = [
  { type: 'image' as BlockType, label: 'Cover Image', icon: Image, description: '' },
  { type: 'richText' as BlockType, label: 'Description', icon: FileText, description: '' },
  { type: 'agendaDay' as BlockType, label: 'Agenda', icon: Clock, description: '' },
  { type: 'tickets' as BlockType, label: 'Tickets', icon: Ticket, description: '' },
  { type: 'gallery' as BlockType, label: 'Gallery', icon: Grid3X3, description: '' },
  { type: 'faq' as BlockType, label: 'FAQ', icon: HelpCircle, description: '' },
  { type: 'cta' as BlockType, label: 'Call to Action', icon: MousePointer, description: '' },
];

export const BlockPalette: React.FC<BlockPaletteProps> = ({ onAddBlock }) => {
  return (
    <div className="w-80 bg-black/20 border-r border-white/10 p-6">
      <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
        <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse" />
        Block Palette
      </h2>
      
      <div className="space-y-2">
        {blockItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.type}
              onClick={() => onAddBlock(item.type)}
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
                   {item.description && (
                     <div className="text-muted-foreground text-sm mt-1">
                       {item.description}
                     </div>
                   )}
                 </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-gradient-dark rounded-lg border border-white/10">
        <h3 className="text-sm font-medium text-foreground mb-2">💡 Pro Tip</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Drag blocks to reorder them, or click to add instantly. Each block can be edited inline for maximum speed.
        </p>
      </div>
    </div>
  );
};