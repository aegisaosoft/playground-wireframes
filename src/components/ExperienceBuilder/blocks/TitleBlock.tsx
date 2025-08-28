import React from 'react';
import { Input } from '@/components/ui/input';

interface TitleBlockProps {
  data: { text: string };
  onChange: (data: { text: string }) => void;
}

export const TitleBlock: React.FC<TitleBlockProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-4">
      <Input
        value={data.text}
        onChange={(e) => onChange({ text: e.target.value })}
        className="text-4xl font-bold bg-transparent border-none p-0 h-auto text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
        placeholder="Enter your experience title..."
      />
      <div className="text-sm text-muted-foreground">
        Make it compelling - this is the first thing people see
      </div>
    </div>
  );
};