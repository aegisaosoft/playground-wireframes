import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  type: 'image' | 'pdf' | 'other';
}

interface FileUploadZoneProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({ files, onFilesChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const getFileType = (file: File): 'image' | 'pdf' | 'other' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type === 'application/pdf') return 'pdf';
    return 'other';
  };

  const processFiles = useCallback(async (fileList: FileList) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    
    const newFiles: UploadedFile[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Unsupported file type",
          description: `${file.name} is not supported. Please upload images or PDFs.`,
          variant: "destructive"
        });
        continue;
      }
      
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 10MB limit.`,
          variant: "destructive"
        });
        continue;
      }

      const fileType = getFileType(file);
      let preview: string | undefined;

      if (fileType === 'image') {
        preview = URL.createObjectURL(file);
      }

      newFiles.push({
        id: `${Date.now()}-${i}`,
        file,
        preview,
        type: fileType
      });
    }

    onFilesChange([...files, ...newFiles]);
  }, [files, onFilesChange, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  }, [processFiles]);

  const removeFile = useCallback((id: string) => {
    const fileToRemove = files.find(f => f.id === id);
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    onFilesChange(files.filter(f => f.id !== id));
  }, [files, onFilesChange]);

  return (
    <div className="space-y-4">
      <Card
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed transition-all duration-200 ${
          isDragging 
            ? 'border-neon-cyan bg-neon-cyan/10 scale-[1.02]' 
            : 'border-white/20 bg-white/5 hover:border-white/30'
        }`}
      >
        <div className="p-8 text-center">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-all ${
            isDragging ? 'bg-neon-cyan/20' : 'bg-gradient-neon'
          }`}>
            <Upload className={`w-8 h-8 ${isDragging ? 'text-neon-cyan' : 'text-background'}`} />
          </div>
          
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Upload Reference Materials
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Drag and drop screenshots, photos, or PDFs here
          </p>
          
          <input
            type="file"
            id="file-upload"
            className="hidden"
            multiple
            accept="image/*,application/pdf"
            onChange={handleFileSelect}
          />
          
          <Button
            type="button"
            variant="outline"
            className="border-white/20"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            Choose Files
          </Button>
          
          <p className="text-xs text-muted-foreground mt-3">
            Supported: JPG, PNG, WebP, GIF, PDF (Max 10MB each)
          </p>
        </div>
      </Card>

      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {files.map((file) => (
            <Card key={file.id} className="relative group bg-white/5 border-white/10 overflow-hidden">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeFile(file.id)}
                className="absolute top-1 right-1 z-10 w-6 h-6 p-0 bg-background/80 hover:bg-red-500/80 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </Button>
              
              {file.type === 'image' && file.preview ? (
                <div className="aspect-square relative">
                  <img
                    src={file.preview}
                    alt={file.file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square flex flex-col items-center justify-center p-4 bg-gradient-dark">
                  {file.type === 'pdf' ? (
                    <FileText className="w-12 h-12 text-red-400 mb-2" />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-muted-foreground mb-2" />
                  )}
                </div>
              )}
              
              <div className="p-2 bg-background/80 backdrop-blur-sm">
                <p className="text-xs text-foreground truncate" title={file.file.name}>
                  {file.file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(file.file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
