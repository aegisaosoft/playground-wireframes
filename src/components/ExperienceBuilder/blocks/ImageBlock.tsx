import React, { useState, useRef, useCallback } from 'react';
import { resolveApiResourceUrl } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';
import { useNotification } from '@/contexts/NotificationContext';

interface ImageBlockProps {
  data: { url: string; alt: string; file?: File };
  onChange: (data: { url: string; alt: string; file?: File }) => void;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({ data, onChange }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showError } = useNotification();

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showError('Invalid File Type', 'Please select an image file');
      return;
    }

    setIsUploading(true);
    
    try {
      // Create object URL for preview and store the File object
      const objectUrl = URL.createObjectURL(file);
      
      onChange({ ...data, url: objectUrl, file: file });
    } catch (error) {
      showError('Upload Failed', 'Error uploading file. Please try again.');
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
    onChange({ ...data, url: '', file: null });
  }, [data, onChange]);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const displayUrl = data.url
    ? (data.url.startsWith('blob:') ? data.url : (resolveApiResourceUrl(data.url) as string))
    : '';

  return (
    <div className="space-y-4">
      {/* Hide Overlays Toggle */}
      {displayUrl && (
        <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/10">
          <div className="space-y-1">
            <Label htmlFor="hide-overlays" className="text-sm font-medium text-foreground">
              Hide system overlays on banner
            </Label>
            <p className="text-xs text-muted-foreground">
              Turn this on if your banner already contains text/branding
            </p>
          </div>
          <Switch
            id="hide-overlays"
            checked={data.hideOverlays || false}
            onCheckedChange={(checked) => onChange({ ...data, hideOverlays: checked })}
          />
        </div>
      )}

      {!displayUrl ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFileDialog}
          className={`
            w-full h-96 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer
            flex items-center justify-center
            ${isDragOver 
              ? 'border-neon-purple bg-neon-purple/10' 
              : 'border-white/20 bg-black/20 hover:border-neon-purple/50 hover:bg-neon-purple/5'
            }
          `}
        >
          <div className="text-center">
            <Upload className={`w-16 h-16 mx-auto mb-4 ${isDragOver ? 'text-neon-purple' : 'text-muted-foreground'}`} />
            <p className={`text-xl font-semibold mb-2 ${isDragOver ? 'text-neon-purple' : 'text-foreground'}`}>
              {isDragOver ? 'Drop your image here' : 'Upload Cover Image'}
            </p>
            <p className="text-sm text-muted-foreground">
              Drag & drop or click to browse
            </p>
          </div>
        </div>
      ) : (
        <div className="relative w-full bg-black/20 rounded-xl border border-white/10 overflow-hidden group" style={{ aspectRatio: '4/3' }}>
          <img
            src={displayUrl}
            alt={data.alt || 'Cover image'}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <div className="flex gap-3">
              <Button
                onClick={openFileDialog}
                size="lg"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                variant="outline"
              >
                <Upload className="w-4 h-4 mr-2" />
                Replace Image
              </Button>
              <Button
                onClick={handleRemoveImage}
                size="lg"
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

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {isUploading && (
        <div className="text-center py-2">
          <p className="text-sm text-muted-foreground">Uploading image...</p>
        </div>
      )}

    </div>
  );
};
