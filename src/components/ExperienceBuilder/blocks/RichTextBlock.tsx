import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Mic } from 'lucide-react';

interface RichTextBlockProps {
  data: { content: string };
  onChange: (data: { content: string }) => void;
}

export const RichTextBlock: React.FC<RichTextBlockProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end">
        <button
          type="button"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Mic className="w-3.5 h-3.5" />
          <span>Record</span>
        </button>
      </div>
      <Textarea
        value={data.content}
        onChange={(e) => onChange({ content: e.target.value })}
        placeholder="Tell people what this experience is about..."
        className="min-h-[200px] bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground resize-y focus:ring-neon-orange/50 text-base leading-relaxed"
      />
    </div>
  );
};
