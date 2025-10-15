import React from 'react';

interface TitleBlockProps {
  data: { text: string; category?: string };
  onChange: (data: { text: string; category?: string }) => void;
}

const categories = [
  { slug: 'tech', name: 'Tech', color: 'bg-neon-cyan', textColor: 'text-neon-cyan' },
  { slug: 'wellness', name: 'Wellness', color: 'bg-neon-green', textColor: 'text-neon-green' },
  { slug: 'business', name: 'Business', color: 'bg-neon-purple', textColor: 'text-neon-purple' },
  { slug: 'adventure', name: 'Adventure', color: 'bg-neon-orange', textColor: 'text-neon-orange' },
  { slug: 'culinary', name: 'Culinary', color: 'bg-neon-yellow', textColor: 'text-neon-yellow' },
  { slug: 'creative', name: 'Creative', color: 'bg-neon-pink', textColor: 'text-neon-pink' },
];

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
