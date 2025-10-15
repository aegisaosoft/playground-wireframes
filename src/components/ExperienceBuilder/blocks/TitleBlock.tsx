import React, { useEffect, useRef } from 'react';

interface TitleBlockProps {
  data: { text: string };
  onChange: (data: { text: string }) => void;
}

export const TitleBlock: React.FC<TitleBlockProps> = ({ data, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Autofocus on mount if empty
    if (!data.text && inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        value={data.text}
        onChange={(e) => onChange({ text: e.target.value })}
        className="w-full bg-transparent border-0 border-b-2 border-white/20 focus:border-neon-pink/50 rounded-none p-0 pb-2 text-2xl md:text-3xl font-bold placeholder:text-muted-foreground/60 focus:outline-none text-foreground transition-colors"
        placeholder="Experience name"
      />
    </div>
  );
};
