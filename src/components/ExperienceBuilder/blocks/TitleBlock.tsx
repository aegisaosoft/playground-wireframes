import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';

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
  const selectedCategory = categories.find(c => c.slug === data.category);
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    // Allow any changes - users can edit/delete text freely
    onChange({ ...data, text: newText });
  };
  
  return (
    <div className="space-y-8">
      <div className="space-y-2 mb-8">
        <label className="text-sm font-medium text-neutral-300 uppercase tracking-wider flex items-center gap-2">
          <span>Experience Name</span>
          <span className="text-xs text-neon-pink">(Required - Block cannot be deleted)</span>
        </label>
        <input
          value={data.text}
          onChange={handleTitleChange}
          required
          minLength={3}
          maxLength={255}
          className="w-full bg-transparent border-0 border-b-2 border-white/10 focus:border-neon-pink/50 rounded-none p-0 pb-2 text-2xl md:text-3xl font-bold placeholder:text-neutral-500 focus:outline-none text-white transition-colors"
          placeholder="Enter your experience name (minimum 3 characters)"
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-300 uppercase tracking-wider">Category</label>
        <Select 
          value={data.category || ''} 
          onValueChange={(value) => onChange({ ...data, category: value })}
        >
          <SelectTrigger className="w-full md:w-64 bg-black/40 border-white/10 hover:border-white/20 transition-colors">
            <SelectValue placeholder="Select category">
              {selectedCategory && (
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${selectedCategory.color}`} />
                  <span className={selectedCategory.textColor}>{selectedCategory.name}</span>
                </span>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-black/95 border-white/10 backdrop-blur-sm">
            {categories.map((category) => (
              <SelectItem 
                key={category.slug} 
                value={category.slug}
                className="hover:bg-white/10 focus:bg-white/10 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${category.color}`} />
                  <span className={category.textColor}>{category.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};