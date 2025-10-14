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
      <label className="text-sm font-medium text-muted-foreground">Experience Name</label>
      <input
        ref={inputRef}
        value={data.text}
        onChange={(e) => onChange({ text: e.target.value })}
        className="w-full bg-transparent border-0 border-b-2 border-white/10 focus:border-neon-pink/50 rounded-none p-0 pb-3 text-3xl md:text-4xl font-bold placeholder:text-muted-foreground focus:outline-none text-foreground transition-colors"
        placeholder="Give your experience a name"
      />
    </div>
  );
};
