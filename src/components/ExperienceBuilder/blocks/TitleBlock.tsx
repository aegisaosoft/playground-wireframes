import React from 'react';

interface TitleBlockProps {
  data: { text: string };
  onChange: (data: { text: string }) => void;
}

export const TitleBlock: React.FC<TitleBlockProps> = ({ data, onChange }) => {
  return (
    <input
      value={data.text}
      onChange={(e) => onChange({ text: e.target.value })}
      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-lg md:text-xl font-bold placeholder:text-neutral-500 focus:border-white/20 focus:outline-none text-white"
      placeholder="experience name"
    />
  );
};