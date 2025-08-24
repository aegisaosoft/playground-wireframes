import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, FileText, AlertCircle } from "lucide-react";

export interface TicketTier {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description: string;
}

export interface ApplicationField {
  id: string;
  type: 'text' | 'multiple_choice' | 'short_answer';
  label: string;
  required: boolean;
  options?: string[];
}

interface ApplicationPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueToApply: () => void;
  retreatTitle: string;
  selectedTicketTier?: TicketTier;
  applicationFields: ApplicationField[];
  mode?: 'preview' | 'apply'; // New prop to distinguish between preview and apply modes
}

export const ApplicationPreviewModal = ({
  isOpen,
  onClose,
  onContinueToApply,
  retreatTitle,
  selectedTicketTier,
  applicationFields,
  mode = 'apply' // Default to apply mode for regular users
}: ApplicationPreviewModalProps) => {
  const hasQuestions = applicationFields && applicationFields.length > 0;

  const renderFieldPreview = (field: ApplicationField) => {
    switch (field.type) {
      case 'text':
        return (
          <div className="border rounded-md p-3 bg-muted/30">
            <span className="text-sm text-muted-foreground">Long text answer</span>
          </div>
        );
      case 'short_answer':
        return (
          <div className="border rounded-md p-3 bg-muted/30">
            <span className="text-sm text-muted-foreground">Short text answer</span>
          </div>
        );
      case 'multiple_choice':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-4 h-4 border rounded-sm bg-muted/30" />
                <span className="text-sm text-muted-foreground">{option}</span>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader className="space-y-4">
          {mode === 'preview' && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Preview Application Form
              </Badge>
            </div>
          )}
          <DialogTitle className="text-xl font-semibold">
            {mode === 'preview' ? `Application Preview for ${retreatTitle}` : `Apply to ${retreatTitle}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto max-h-[50vh] pr-2">
          {/* Ticket Tier Info */}
          {selectedTicketTier && (
            <Card className="border-l-4 border-l-coral">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-lg">{selectedTicketTier.name}</h4>
                    {selectedTicketTier.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedTicketTier.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-coral">
                      ${selectedTicketTier.price}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selectedTicketTier.quantity} spots available
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Application Questions Preview */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <FileText className="w-5 h-5 text-coral" />
              <h3 className="font-semibold">Application Questions</h3>
            </div>

            {!hasQuestions ? (
              <Card className="border-dashed">
                <CardContent className="p-6 text-center">
                  <AlertCircle className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No questions required. You may proceed to apply.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {applicationFields.map((field, index) => (
                  <div key={field.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        Question {index + 1}
                      </span>
                      {field.required && (
                        <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                          Required
                        </Badge>
                      )}
                    </div>
                    <label className="font-medium">{field.label}</label>
                    {renderFieldPreview(field)}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {mode === 'preview' ? 'Close Preview' : 'Back'}
          </Button>
          <Button
            onClick={onContinueToApply}
            className="bg-coral hover:bg-coral-dark text-white px-6"
          >
            {mode === 'preview' ? 'Close Preview' : 'Continue to Apply'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};