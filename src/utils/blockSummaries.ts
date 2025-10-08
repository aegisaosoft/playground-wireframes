import { Block } from '@/types/experienceBuilder';
import { format } from 'date-fns';

export const getBlockSummary = (block: Block): string => {
  switch (block.type) {
    case 'title':
      return block.data.text || 'Untitled';
    
    case 'dates':
      if (block.data.startDate && block.data.endDate) {
        const start = new Date(block.data.startDate);
        const end = new Date(block.data.endDate);
        return `${format(start, 'MMM d')}–${format(end, 'd, yyyy')}`;
      }
      return 'No dates set';
    
    case 'location':
      if (block.data.city && block.data.country) {
        return `${block.data.city}, ${block.data.country}`;
      }
      return 'No location set';
    
    case 'tickets':
      const tierCount = block.data.tiers?.length || 0;
      return tierCount === 1 ? '1 tier' : `${tierCount} tiers`;
    
    case 'highlights':
      const highlightCount = block.data.highlights?.length || 0;
      return highlightCount === 1 ? '1 highlight' : `${highlightCount} highlights`;
    
    case 'agendaDay':
      const itemCount = block.data.items?.length || 0;
      const dateStr = block.data.date ? format(new Date(block.data.date), 'MMM d') : 'Day';
      return `${dateStr} • ${itemCount} activities`;
    
    case 'gallery':
      const imageCount = block.data.images?.length || 0;
      return imageCount === 1 ? '1 image' : `${imageCount} images`;
    
    case 'faq':
      const faqCount = block.data.items?.length || 0;
      return faqCount === 1 ? '1 question' : `${faqCount} questions`;
    
    case 'resources':
      const resourceCount = block.data.resources?.length || 0;
      return resourceCount === 1 ? '1 resource' : `${resourceCount} resources`;
    
    case 'richText':
      const content = block.data.content || '';
      const preview = content.replace(/<[^>]*>/g, '').substring(0, 50);
      return preview ? preview + (content.length > 50 ? '...' : '') : 'Empty';
    
    case 'image':
      return block.data.alt || 'Cover image';
    
    case 'cta':
      return block.data.text || 'Call to action';
    
    case 'logistics':
      return block.data.address || 'Logistics info';
    
    default:
      return 'Block content';
  }
};

export const isRepeatableBlock = (type: string): boolean => {
  const repeatableTypes = ['image', 'richText', 'highlights', 'agendaDay', 'gallery', 'faq', 'cta', 'resources', 'logistics'];
  return repeatableTypes.includes(type);
};

export const isSingletonBlock = (type: string): boolean => {
  const singletonTypes = ['title', 'dates', 'location', 'tickets'];
  return singletonTypes.includes(type);
};
