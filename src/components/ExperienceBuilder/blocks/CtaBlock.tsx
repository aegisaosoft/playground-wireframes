import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MousePointer } from 'lucide-react';

interface CtaBlockProps {
  data: { text: string; style: 'primary' | 'outline' };
  onChange: (data: { text: string; style: 'primary' | 'outline' }) => void;
}

export const CtaBlock: React.FC<CtaBlockProps> = ({ data, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MousePointer className="w-5 h-5 text-neon-pink" />
        <h3 className="text-xl font-semibold text-foreground">Call to Action</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Button Text</label>
          <Input
            value={data.text}
            onChange={(e) => onChange({ ...data, text: e.target.value })}
            className="bg-white/5 border-white/10 text-foreground"
            placeholder="Book Your Spot Now"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Button Style</label>
          <div className="flex gap-2">
            <Button
              variant={data.style === 'primary' ? 'default' : 'outline'}
              onClick={() => onChange({ ...data, style: 'primary' })}
              className={data.style === 'primary' 
                ? 'bg-gradient-neon text-black' 
                : 'bg-white/5 border-white/10 text-foreground hover:bg-white/10'
              }
            >
              Primary
            </Button>
            <Button
              variant={data.style === 'outline' ? 'default' : 'outline'}
              onClick={() => onChange({ ...data, style: 'outline' })}
              className={data.style === 'outline' 
                ? 'bg-gradient-neon text-black' 
                : 'bg-white/5 border-white/10 text-foreground hover:bg-white/10'
              }
            >
              Outline
            </Button>
          </div>
        </div>

        {/* Preview */}
        <div className="p-6 bg-gradient-dark rounded-lg border border-white/10">
          <div className="text-sm font-medium text-foreground mb-3">Preview:</div>
          <div className="flex justify-center">
            <Button
              size="lg"
              variant={data.style === 'primary' ? 'default' : 'outline'}
              className={
                data.style === 'primary'
                  ? 'bg-gradient-neon text-black font-semibold shadow-neon px-8'
                  : 'bg-transparent border-2 border-neon-pink text-neon-pink hover:bg-neon-pink/10 px-8'
              }
            >
              {data.text || 'Button Text'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};