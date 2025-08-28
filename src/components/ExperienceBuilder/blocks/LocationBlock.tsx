import React from 'react';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';

interface LocationBlockProps {
  data: { city: string; country: string };
  onChange: (data: { city: string; country: string }) => void;
}

export const LocationBlock: React.FC<LocationBlockProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MapPin className="w-5 h-5 text-neon-cyan" />
        <h3 className="text-xl font-semibold text-foreground">Location</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">City</label>
          <Input
            value={data.city}
            onChange={(e) => onChange({ ...data, city: e.target.value })}
            placeholder="e.g. Bali"
            className="bg-white/5 border-white/10 text-foreground focus:ring-neon-cyan/50"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Country</label>
          <Input
            value={data.country}
            onChange={(e) => onChange({ ...data, country: e.target.value })}
            placeholder="e.g. Indonesia"
            className="bg-white/5 border-white/10 text-foreground focus:ring-neon-cyan/50"
          />
        </div>
      </div>
    </div>
  );
};