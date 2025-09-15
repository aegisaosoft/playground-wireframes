import React, { useState, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Upload, X } from 'lucide-react';

interface ImageBlockProps {
  data: { url: string; alt: string };
  onChange: (data: { url: string; alt: string }) => void;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({ data, onChange }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setIsUploading(true);
    
    try {
      // Create object URL for preview
      const objectUrl = URL.createObjectURL(file);
      onChange({ ...data, url: objectUrl });
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    } finally {
      setIsUploading(false);
    }
  }, [data, onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, [handleFileUpload]);

  const handleRemoveImage = useCallback(() => {
    if (data.url.startsWith('blob:')) {
      URL.revokeObjectURL(data.url);
    }
    onChange({ ...data, url: '' });
  }, [data, onChange]);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ImageIcon className="w-5 h-5 text-neon-purple" />
        <h3 className="text-xl font-semibold text-foreground">Cover Image</h3>
      </div>

      <div className="space-y-4">
        {/* File Upload Area */}
        {!data.url ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={openFileDialog}
            className={`
              w-full h-64 rounded-lg border-2 border-dashed transition-all duration-200 cursor-pointer
              flex items-center justify-center
              ${isDragOver 
                ? 'border-neon-purple bg-neon-purple/10' 
                : 'border-white/20 bg-black/20 hover:border-neon-purple/50 hover:bg-neon-purple/5'
              }
            `}
          >
            <div className="text-center">
              <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragOver ? 'text-neon-purple' : 'text-muted-foreground'}`} />
              <p className={`text-lg font-medium mb-2 ${isDragOver ? 'text-neon-purple' : 'text-foreground'}`}>
                {isDragOver ? 'Drop your image here' : 'Drag & drop your image'}
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse files
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Supports: JPG, PNG, WEBP (max 20MB)
              </p>
            </div>
          </div>
        ) : (
          /* Image Preview with Remove Button */
          <div className="relative w-full h-64 bg-black/20 rounded-lg border border-white/10 overflow-hidden group">
            <img
              src={data.url}
              alt={data.alt || 'Preview'}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <div className="flex gap-2">
                <Button
                  onClick={openFileDialog}
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  variant="outline"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Replace
                </Button>
                <Button
                  onClick={handleRemoveImage}
                  size="sm"
                  variant="destructive"
                  className="bg-destructive/80 hover:bg-destructive"
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Alt Text Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Alt Text</label>
          <Input
            value={data.alt}
            onChange={(e) => onChange({ ...data, alt: e.target.value })}
            placeholder="Describe the image..."
            className="bg-white/5 border-white/10 text-foreground focus:ring-neon-purple/50"
          />
        </div>

        {isUploading && (
          <div className="text-center py-2">
            <p className="text-sm text-muted-foreground">Uploading image...</p>
          </div>
        )}
      </div>
    </div>
  );
};