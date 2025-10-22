import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface BeautifulNotificationProps {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  showActions?: boolean;
  confirmText?: string;
  cancelText?: string;
  variant?: 'overlay' | 'inline';
}

export const BeautifulNotification: React.FC<BeautifulNotificationProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
  onConfirm,
  onCancel,
  showActions = false,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'overlay'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (duration > 0 && !showActions) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, showActions]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300); // Match animation duration
  };

  const handleConfirm = () => {
    onConfirm?.();
    handleClose();
  };

  const handleCancel = () => {
    onCancel?.();
    handleClose();
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-neon-green" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-400" />;
      case 'info':
        return <Info className="w-6 h-6 text-neon-cyan" />;
      default:
        return <Info className="w-6 h-6 text-neon-cyan" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-neon-green/50';
      case 'error':
        return 'border-red-400/50';
      case 'warning':
        return 'border-yellow-400/50';
      case 'info':
        return 'border-neon-cyan/50';
      default:
        return 'border-neon-cyan/50';
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return variant === 'inline' ? 'bg-neon-green/20' : 'bg-neon-green/5';
      case 'error':
        return variant === 'inline' ? 'bg-red-500/25' : 'bg-red-500/5';
      case 'warning':
        return variant === 'inline' ? 'bg-yellow-500/20' : 'bg-yellow-500/5';
      case 'info':
        return variant === 'inline' ? 'bg-neon-cyan/20' : 'bg-neon-cyan/5';
      default:
        return variant === 'inline' ? 'bg-neon-cyan/20' : 'bg-neon-cyan/5';
    }
  };

  return (
    <div
      className={`
        ${variant === 'overlay' ? 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] w-full max-w-md mx-4' : 'relative w-full my-2'}
        ${getBackgroundColor()}
        ${getBorderColor()}
        border-2 rounded-2xl ${variant === 'inline' ? 'p-4' : 'p-6'} shadow-2xl ${variant === 'overlay' ? 'backdrop-blur-sm' : ''}
        transition-all duration-300 ease-out
        ${isVisible && !isLeaving 
          ? 'opacity-100 scale-100 translate-y-0' 
          : 'opacity-0 scale-95 translate-y-2'
        }
        ${isLeaving ? 'opacity-0 scale-95 translate-y-2' : ''}
      `}
    >
      {/* Glow effect */}
      {variant === 'overlay' && (
        <div className={`
          absolute inset-0 rounded-2xl blur-xl -z-10
          ${type === 'success' ? 'bg-neon-green/20' : ''}
          ${type === 'error' ? 'bg-red-400/20' : ''}
          ${type === 'warning' ? 'bg-yellow-400/20' : ''}
          ${type === 'info' ? 'bg-neon-cyan/20' : ''}
        `} />
      )}
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {getIcon()}
            <h3 className="text-lg font-semibold text-foreground">
              {title}
            </h3>
          </div>
          {!showActions && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground hover:bg-white/10 p-1 h-auto"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Message */}
        {message && (
          <p className={`mb-4 leading-relaxed ${variant === 'inline' ? 'text-foreground' : 'text-muted-foreground'}`}>
            {message}
          </p>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="border-white/20 text-foreground hover:bg-white/10"
            >
              {cancelText}
            </Button>
            <Button
              onClick={handleConfirm}
              className={`
                ${type === 'success' ? 'bg-neon-green hover:bg-neon-green/90' : ''}
                ${type === 'error' ? 'bg-red-500 hover:bg-red-600' : ''}
                ${type === 'warning' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
                ${type === 'info' ? 'bg-neon-cyan hover:bg-neon-cyan/90' : ''}
                text-background
              `}
            >
              {confirmText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
