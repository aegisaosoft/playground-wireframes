import React from 'react';
import { Textarea } from '@/components/ui/textarea';

interface RichTextBlockProps {
  data: { content: string };
  onChange: (data: { content: string }) => void;
}

export const RichTextBlock: React.FC<RichTextBlockProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-muted-foreground">Description</label>
      <Textarea
        value={data.content}
        onChange={(e) => onChange({ content: e.target.value })}
        placeholder="Tell people what this experience is about..."
        className="min-h-[200px] bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground resize-y focus:ring-neon-orange/50 text-base leading-relaxed"
      />
      <p className="text-xs text-muted-foreground">
        Describe what makes this experience unique and what participants can expect
      </p>
    </div>
  );
};
