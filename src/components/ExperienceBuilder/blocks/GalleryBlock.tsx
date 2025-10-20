import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Grid3X3, Plus, Trash2, Image as ImageIcon, Upload, X } from 'lucide-react';
import { useNotification } from '@/contexts/NotificationContext';

interface GalleryImage {
  url: string;
  alt: string;
  file?: File | null;  // ✅ Store the actual File object
  id?: string;  // ✅ Database ID for existing images (for deletion)
}

interface GalleryBlockProps {
  data: { images: GalleryImage[] };
  onChange: (data: { images: GalleryImage[] }) => void;
  experienceId?: string;  // ✅ Experience ID for deleting images from backend
  onDeleteImage?: (imageId: string) => Promise<void>;  // ✅ Callback for deleting from backend
}

export const GalleryBlock: React.FC<GalleryBlockProps> = ({ data, onChange, experienceId, onDeleteImage }) => {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState<{ [key: number]: boolean }>({});
  const [isDeleting, setIsDeleting] = useState<{ [key: number]: boolean }>({});
  const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});
  const { showError } = useNotification();

  const handleFileUpload = useCallback(async (file: File, index: number) => {
    if (!file.type.startsWith('image/')) {
      showError('Invalid File Type', 'Please select an image file');
      return;
    }

    setIsUploading(prev => ({ ...prev, [index]: true }));
    
    try {
      // Create object URL for preview
      const objectUrl = URL.createObjectURL(file);
      
      
      // ✅ Store BOTH the preview URL AND the File object
      const newImages = [...data.images];
      newImages[index] = { 
        ...newImages[index], 
        url: objectUrl,
        file: file  // ✅ Store the actual File object
      };
      onChange({ images: newImages });
    } catch (error) {
      showError('Upload Failed', 'Error uploading file. Please try again.');
    } finally {
      setIsUploading(prev => ({ ...prev, [index]: false }));
    }
  }, [data.images, onChange]);

  const handleDrop = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0], index);
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOverIndex(null);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0], index);
    }
  }, [handleFileUpload]);

  const addImage = () => {
    const newImages = [...data.images, { url: '', alt: '', file: null }];
    onChange({ images: newImages });
  };

  const removeImage = async (index: number) => {
    const image = data.images[index];
    
    // If image has an ID, it's saved in the database - delete from backend
    if (image.id && experienceId && onDeleteImage) {
      try {
        setIsDeleting(prev => ({ ...prev, [index]: true }));
        await onDeleteImage(image.id);
      } catch (error) {
        showError('Delete Failed', 'Failed to delete image from server');
        setIsDeleting(prev => ({ ...prev, [index]: false }));
        return; // Don't remove from UI if backend deletion failed
      } finally {
        setIsDeleting(prev => ({ ...prev, [index]: false }));
      }
    }
    
    // Clean up object URL if it exists
    if (image.url.startsWith('blob:')) {
      URL.revokeObjectURL(image.url);
    }
    
    // Remove from local state
    const newImages = data.images.filter((_, i) => i !== index);
    onChange({ images: newImages });
    
    // Clean up refs and state
    delete fileInputRefs.current[index];
    setIsUploading(prev => {
      const newState = { ...prev };
      delete newState[index];
      return newState;
    });
  };

  const updateImage = (index: number, field: keyof GalleryImage, value: string) => {
    const newImages = [...data.images];
    newImages[index] = { ...newImages[index], [field]: value };
    onChange({ images: newImages });
  };

  const openFileDialog = (index: number) => {
    fileInputRefs.current[index]?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Grid3X3 className="w-5 h-5 text-neon-purple" />
        <h3 className="text-xl font-semibold text-foreground">Gallery</h3>
      </div>

      <div className="space-y-4">
        {data.images.map((image, index) => (
          <div key={index} className="p-4 bg-white/5 border border-white/10 rounded-lg">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Upload Area or Preview */}
              <div className="relative">
                {!image.url ? (
                  <div
                    onDrop={(e) => handleDrop(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onClick={() => openFileDialog(index)}
                    className={`
                      w-full h-40 rounded-lg border-2 border-dashed transition-all duration-200 cursor-pointer
                      flex items-center justify-center
                      ${dragOverIndex === index 
                        ? 'border-neon-purple bg-neon-purple/10' 
                        : 'border-white/20 bg-black/20 hover:border-neon-purple/50 hover:bg-neon-purple/5'
                      }
                    `}
                  >
                    <div className="text-center">
                      <Upload className={`w-8 h-8 mx-auto mb-2 ${dragOverIndex === index ? 'text-neon-purple' : 'text-muted-foreground'}`} />
                      <p className={`text-sm font-medium mb-1 ${dragOverIndex === index ? 'text-neon-purple' : 'text-foreground'}`}>
                        {dragOverIndex === index ? 'Drop image here' : 'Drag & drop image'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        or click to browse
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-40 bg-black/20 rounded-lg border border-white/10 overflow-hidden group">
                    <img
                      src={image.url}
                      alt={image.alt || 'Gallery preview'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => openFileDialog(index)}
                          size="sm"
                          className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                          variant="outline"
                        >
                          <Upload className="w-3 h-3 mr-1" />
                          Replace
                        </Button>
                        <Button
                          onClick={() => removeImage(index)}
                          size="sm"
                          variant="destructive"
                          className="bg-destructive/80 hover:bg-destructive"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Hidden File Input */}
                <input
                  ref={(el) => fileInputRefs.current[index] = el}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e, index)}
                  className="hidden"
                />
              </div>

              {/* Alt Text and Actions */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Alt Text</label>
                  <Input
                    value={image.alt}
                    onChange={(e) => updateImage(index, 'alt', e.target.value)}
                    className="bg-white/5 border-white/10 text-foreground"
                    placeholder="Describe the image..."
                  />
                </div>

                {isUploading[index] && (
                  <div className="text-center py-2">
                    <p className="text-xs text-muted-foreground">Uploading image...</p>
                  </div>
                )}

                {isDeleting[index] && (
                  <div className="text-center py-2">
                    <p className="text-xs text-destructive">Deleting image...</p>
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeImage(index)}
                  disabled={isDeleting[index]}
                  className="text-destructive hover:text-destructive hover:bg-destructive/20 w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isDeleting[index] ? 'Deleting...' : 'Remove Image'}
                </Button>
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