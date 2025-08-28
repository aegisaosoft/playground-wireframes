import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Upload } from 'lucide-react';

interface ImageBlockProps {
  data: { url: string; alt: string };
  onChange: (data: { url: string; alt: string }) => void;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({ data, onChange }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ImageIcon className="w-5 h-5 text-neon-purple" />
        <h3 className="text-xl font-semibold text-foreground">Hero Image</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Image URL</label>
          <Input
            value={data.url}
            onChange={(e) => onChange({ ...data, url: e.target.value })}
            placeholder="https://example.com/image.jpg"
            className="bg-white/5 border-white/10 text-foreground focus:ring-neon-purple/50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Alt Text</label>
          <Input
            value={data.alt}
            onChange={(e) => onChange({ ...data, alt: e.target.value })}
            placeholder="Describe the image..."
            className="bg-white/5 border-white/10 text-foreground focus:ring-neon-purple/50"
          />
        </div>

        {/* Image Preview */}
        <div className="relative">
          {data.url ? (
            <div className="relative w-full h-64 bg-black/20 rounded-lg border border-white/10 overflow-hidden">
              {!imageError ? (
                <img
                  src={data.url}
                  alt={data.alt || 'Preview'}
                  className="w-full h-full object-cover"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Failed to load image</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-64 bg-black/20 rounded-lg border border-dashed border-white/20 flex items-center justify-center">
              <div className="text-center">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Enter image URL to see preview</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};