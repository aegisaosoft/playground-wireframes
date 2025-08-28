import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Grid3X3, Plus, Trash2, Image as ImageIcon } from 'lucide-react';

interface GalleryImage {
  url: string;
  alt: string;
}

interface GalleryBlockProps {
  data: { images: GalleryImage[] };
  onChange: (data: { images: GalleryImage[] }) => void;
}

export const GalleryBlock: React.FC<GalleryBlockProps> = ({ data, onChange }) => {
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});

  const addImage = () => {
    const newImages = [...data.images, { url: '', alt: '' }];
    onChange({ images: newImages });
  };

  const removeImage = (index: number) => {
    const newImages = data.images.filter((_, i) => i !== index);
    onChange({ images: newImages });
    setImageErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });
  };

  const updateImage = (index: number, field: keyof GalleryImage, value: string) => {
    const newImages = [...data.images];
    newImages[index] = { ...newImages[index], [field]: value };
    onChange({ images: newImages });
    
    if (field === 'url') {
      setImageErrors(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleImageError = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  const handleImageLoad = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: false }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Grid3X3 className="w-5 h-5 text-neon-purple" />
        <h3 className="text-xl font-semibold text-foreground">Photo Gallery</h3>
      </div>

      <div className="space-y-4">
        {data.images.map((image, index) => (
          <div key={index} className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Form inputs */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Image URL</label>
                  <Input
                    value={image.url}
                    onChange={(e) => updateImage(index, 'url', e.target.value)}
                    className="bg-white/5 border-white/10 text-foreground"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Alt Text</label>
                  <Input
                    value={image.alt}
                    onChange={(e) => updateImage(index, 'alt', e.target.value)}
                    className="bg-white/5 border-white/10 text-foreground"
                    placeholder="Describe the image..."
                  />
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeImage(index)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/20 w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove Image
                </Button>
              </div>

              {/* Image preview */}
              <div className="relative">
                {image.url ? (
                  <div className="relative w-full h-40 bg-black/20 rounded-lg border border-white/10 overflow-hidden">
                    {!imageErrors[index] ? (
                      <img
                        src={image.url}
                        alt={image.alt || 'Gallery preview'}
                        className="w-full h-full object-cover"
                        onLoad={() => handleImageLoad(index)}
                        onError={() => handleImageError(index)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground">Failed to load</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-40 bg-black/20 rounded-lg border border-dashed border-white/20 flex items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Enter URL to preview</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        <Button
          variant="outline"
          onClick={addImage}
          className="w-full bg-white/5 border-white/10 text-foreground hover:bg-white/10 hover:border-neon-purple/50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Image
        </Button>

        {data.images.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
            <Grid3X3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No images added yet. Start building your gallery!</p>
          </div>
        )}
      </div>
    </div>
  );
};