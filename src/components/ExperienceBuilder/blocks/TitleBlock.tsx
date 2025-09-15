import React from 'react';

interface TitleBlockProps {
  data: { text: string };
  onChange: (data: { text: string }) => void;
}

export const TitleBlock: React.FC<TitleBlockProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-neutral-300 uppercase tracking-wider">Experience Name</label>
      <input
        value={data.text}
        onChange={(e) => onChange({ text: e.target.value })}
        className="w-full bg-transparent border-0 border-b-2 border-white/10 focus:border-neon-pink/50 rounded-none p-0 pb-2 text-2xl md:text-3xl font-bold placeholder:text-neutral-500 focus:outline-none text-white transition-colors"
        placeholder="Enter your experience name"
      />
    </div>
  );
};