import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ZoomIn, ZoomOut, Move } from 'lucide-react';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string) => void;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  onCropComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // 4:3 aspect ratio dimensions
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;

  useEffect(() => {
    if (imageUrl && isOpen) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setImage(img);
        // Center the image initially
        const scale = Math.max(CANVAS_WIDTH / img.width, CANVAS_HEIGHT / img.height);
        setZoom(scale);
        setPosition({
          x: (CANVAS_WIDTH - img.width * scale) / 2,
          y: (CANVAS_HEIGHT - img.height * scale) / 2,
        });
      };
      img.src = imageUrl;
    }
  }, [imageUrl, isOpen]);

  useEffect(() => {
    if (image && canvasRef.current) {
      drawCanvas();
    }
  }, [image, zoom, position]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !image) return;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw image
    ctx.drawImage(
      image,
      position.x,
      position.y,
      image.width * zoom,
      image.height * zoom
    );

    // Draw safe zone overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Clear the safe area
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.drawImage(
      image,
      position.x,
      position.y,
      image.width * zoom,
      image.height * zoom
    );

    // Draw safe zone indicators
    // Top safe zone (for tags)
    ctx.fillStyle = 'rgba(255, 105, 180, 0.2)'; // neon-pink with transparency
    ctx.fillRect(0, 0, CANVAS_WIDTH, 80);
    
    // Bottom safe zone (for title and gradient)
    ctx.fillStyle = 'rgba(0, 255, 255, 0.2)'; // neon-cyan with transparency
    ctx.fillRect(0, CANVAS_HEIGHT - 120, CANVAS_WIDTH, 120);

    // Draw border
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw safe zone labels
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 14px Inter, system-ui, sans-serif';
    ctx.fillText('Top Safe Zone (Tags)', 10, 25);
    ctx.fillText('Bottom Safe Zone (Title)', 10, CANVAS_HEIGHT - 95);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a new canvas for the cropped image
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = CANVAS_WIDTH;
    croppedCanvas.height = CANVAS_HEIGHT;
    const ctx = croppedCanvas.getContext('2d');
    
    if (!ctx || !image) return;

    // Draw the cropped image
    ctx.drawImage(
      image,
      position.x,
      position.y,
      image.width * zoom,
      image.height * zoom
    );

    // Convert to blob and create URL
    croppedCanvas.toBlob((blob) => {
      if (blob) {
        const croppedUrl = URL.createObjectURL(blob);
        onCropComplete(croppedUrl);
        onClose();
      }
    }, 'image/jpeg', 0.95);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Crop Image to 4:3 Ratio</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Position your image within the frame. Colored overlays show where system elements will appear.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-center bg-black/50 rounded-lg p-4">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="cursor-move border-2 border-neon-cyan/50 rounded-lg"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <ZoomOut className="w-5 h-5 text-muted-foreground" />
              <Slider
                value={[zoom]}
                onValueChange={(value) => setZoom(value[0])}
                min={0.1}
                max={3}
                step={0.1}
                className="flex-1"
              />
              <ZoomIn className="w-5 h-5 text-muted-foreground" />
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Move className="w-4 h-4" />
              <span>Drag the image to reposition</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-neon-pink/40 border border-neon-pink rounded" />
              <span className="text-muted-foreground">Top: Category tags area</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-neon-cyan/40 border border-neon-cyan rounded" />
              <span className="text-muted-foreground">Bottom: Title and gradient area</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCrop} className="bg-neon-cyan text-background hover:bg-neon-cyan/90">
            Apply Crop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
