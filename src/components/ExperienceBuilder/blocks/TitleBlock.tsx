import React from 'react';
import { CategoryCombobox } from '../CategoryCombobox';

interface TitleBlockProps {
  data: { text: string; category?: string };
  onChange: (data: { text: string; category?: string }) => void;
}

export const TitleBlock: React.FC<TitleBlockProps> = ({ data, onChange }) => {
  const handleTitleChange = (text: string) => {
    onChange({ text, category: data.category });
  };

  const handleCategoryChange = (category: string) => {
    onChange({ text: data.text, category });
  };

  return (
    <div className="space-y-4 p-6 bg-gradient-to-r from-neon-pink/10 via-transparent to-neon-pink/10 rounded-lg border border-neon-pink/20">
      <div className="mb-4 pb-2 border-b border-neon-pink/20">
        <span className="text-sm font-medium text-neon-pink uppercase tracking-wider">
          ✨ Title (Required)
        </span>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-300 uppercase tracking-wider">Experience Name</label>
        <input
          value={data.text}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full bg-transparent border-0 border-b-2 border-white/10 focus:border-neon-pink/50 rounded-none p-0 pb-2 text-2xl md:text-3xl font-bold placeholder:text-neutral-500 focus:outline-none text-white transition-colors"
          placeholder="Enter your experience name"
        />
      </div>
      
      <CategoryCombobox
        value={data.category}
        onValueChange={handleCategoryChange}
        className="max-w-xs"
      />
    </div>
  );
};
