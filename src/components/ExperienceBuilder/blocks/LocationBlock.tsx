import React from 'react';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';

interface LocationBlockProps {
  data: { location: string };
  onChange: (data: { location: string }) => void;
}

export const LocationBlock: React.FC<LocationBlockProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-3">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          value={data.location}
          onChange={(e) => onChange({ location: e.target.value })}
          placeholder="Search for a location or venue..."
          className="pl-10 h-12 text-base bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground focus:ring-neon-cyan/50"
        />
      </div>
    </div>
  );
};