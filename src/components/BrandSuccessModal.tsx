import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface BrandSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomizeBrand: () => void;
  hostName: string;
}

export const BrandSuccessModal = ({ 
  isOpen, 
  onClose, 
  onCustomizeBrand, 
  hostName 
}: BrandSuccessModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            Your Retreat Is Live!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              This retreat is currently hosted under your personal brand: 
              <span className="font-semibold text-foreground"> {hostName}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Want to customize your public host page for future retreats?
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={onCustomizeBrand}
              className="w-full bg-coral hover:bg-coral-dark text-white"
            >
              Customize Brand Page
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="w-full"
            >
              Skip for Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};