export type BlockType = 
  | 'title'
  | 'dates' 
  | 'location'
  | 'image'
  | 'richText'
  | 'highlights'
  | 'agendaDay'
  | 'tickets'
  | 'gallery'
  | 'faq'
  | 'cta'
  | 'resources'
  | 'logistics';

export interface Block {
  id: string;
  type: BlockType;
  data: any;
  order: number;
}

export interface BlockPaletteItem {
  type: BlockType;
  label: string;
  icon: string;
  description: string;
}