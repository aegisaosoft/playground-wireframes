import React from 'react';
import { Combobox, ComboboxOption } from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';

interface CategoryComboboxProps {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

// Define available categories with their colors
const categoryOptions: ComboboxOption[] = [
  {
    value: 'tech',
    label: 'Technology',
    color: 'bg-neon-cyan',
    textColor: 'text-black'
  },
  {
    value: 'wellness',
    label: 'Wellness',
    color: 'bg-neon-green',
    textColor: 'text-black'
  },
  {
    value: 'business',
    label: 'Business',
    color: 'bg-neon-purple',
    textColor: 'text-white'
  },
  {
    value: 'adventure',
    label: 'Adventure',
    color: 'bg-neon-orange',
    textColor: 'text-black'
  },
  {
    value: 'culinary',
    label: 'Culinary',
    color: 'bg-neon-yellow',
    textColor: 'text-black'
  },
  {
    value: 'creative',
    label: 'Creative',
    color: 'bg-neon-pink',
    textColor: 'text-white'
  }
];

export const CategoryCombobox: React.FC<CategoryComboboxProps> = ({
  value,
  onValueChange,
  disabled = false,
  className
}) => {
  return (
    <div className={`space-y-2 ${className || ''}`}>
      <Label htmlFor="category-select" className="text-sm font-medium text-foreground">
        Category
      </Label>
      <Combobox
        options={categoryOptions}
        value={value}
        onValueChange={onValueChange}
        placeholder="Select a category..."
        searchPlaceholder="Search categories..."
        emptyText="No category found."
        disabled={disabled}
        className="w-full"
      />
    </div>
  );
};

export default CategoryCombobox;
