import React from 'react';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';

interface LocationBlockProps {
  data: { city: string; country: string };
  onChange: (data: { city: string; country: string }) => void;
}

export const LocationBlock: React.FC<LocationBlockProps> = ({ data, onChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-300">City</label>
        <Input
          value={data.city}
          onChange={(e) => onChange({ ...data, city: e.target.value })}
          placeholder="Bali"
          className="bg-white/5 border border-white/10 rounded-xl text-white focus:border-white/20 focus:outline-none"
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-300">Country</label>
        <Input
          value={data.country}
          onChange={(e) => onChange({ ...data, country: e.target.value })}
          placeholder="Indonesia"
          className="bg-white/5 border border-white/10 rounded-xl text-white focus:border-white/20 focus:outline-none"
        />
      </div>
    </div>
  );
};