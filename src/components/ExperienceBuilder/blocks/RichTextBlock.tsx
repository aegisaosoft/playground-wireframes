import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';

interface RichTextBlockProps {
  data: { content: string };
  onChange: (data: { content: string }) => void;
}

export const RichTextBlock: React.FC<RichTextBlockProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-neon-orange" />
        <h3 className="text-xl font-semibold text-foreground">Story & Description</h3>
      </div>

      <Textarea
        value={data.content}
        onChange={(e) => onChange({ content: e.target.value })}
        placeholder="Tell the story of your experience... What makes it unique? What will participants discover? Paint a picture with your words."
        className="min-h-[200px] bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground resize-none focus:ring-neon-orange/50"
      />
      
      <div className="text-sm text-muted-foreground">
        Share what makes this experience special, what participants will learn, and why they should join.
      </div>
    </div>
  );
};