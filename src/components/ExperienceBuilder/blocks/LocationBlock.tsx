import React from 'react';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';

interface LocationBlockProps {
  data: { location: string };
  onChange: (data: { location: string }) => void;
}

export const LocationBlock: React.FC<LocationBlockProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-4 h-4 text-neon-orange" />
        <label className="text-sm font-medium text-neutral-300 uppercase tracking-wider">Location</label>
      </div>
      
      <Input
        value={data.location}
        onChange={(e) => onChange({ location: e.target.value })}
        placeholder="Search for a location or venue..."
        className="bg-white/5 border border-white/10 rounded-xl text-white focus:border-neon-pink/50 focus:outline-none text-lg"
      />
    </div>
  );
};