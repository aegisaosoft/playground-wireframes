import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { BeautifulNotification, NotificationType } from '@/components/BeautifulNotification';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  onConfirm?: () => void;
  onCancel?: () => void;
  showActions?: boolean;
  confirmText?: string;
  cancelText?: string;
}

interface NotificationContextType {
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  showSuccess: (title: string, message?: string, duration?: number) => void;
  showError: (title: string, message?: string, duration?: number) => void;
  showWarning: (title: string, message?: string, duration?: number) => void;
  showInfo: (title: string, message?: string, duration?: number) => void;
  showConfirm: (
    title: string, 
    message?: string, 
    onConfirm?: () => void, 
    onCancel?: () => void,
    confirmText?: string,
    cancelText?: string
  ) => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
    };
    
    setNotifications(prev => [...prev, newNotification]);
  }, []);

  const showSuccess = useCallback((title: string, message?: string, duration = 4000) => {
    showNotification({
      type: 'success',
      title,
      message,
      duration,
    });
  }, [showNotification]);

  const showError = useCallback((title: string, message?: string, duration = 6000) => {
    showNotification({
      type: 'error',
      title,
      message,
      duration,
    });
  }, [showNotification]);

  const showWarning = useCallback((title: string, message?: string, duration = 5000) => {
    showNotification({
      type: 'warning',
      title,
      message,
      duration,
    });
  }, [showNotification]);

  const showInfo = useCallback((title: string, message?: string, duration = 4000) => {
    showNotification({
      type: 'info',
      title,
      message,
      duration,
    });
  }, [showNotification]);

  const showConfirm = useCallback((
    title: string,
    message?: string,
    onConfirm?: () => void,
    onCancel?: () => void,
    confirmText = 'Confirm',
    cancelText = 'Cancel'
  ) => {
    showNotification({
      type: 'warning',
      title,
      message,
      duration: 0, // No auto-close for confirmations
      showActions: true,
      onConfirm,
      onCancel,
      confirmText,
      cancelText,
    });
  }, [showNotification]);

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showConfirm,
        removeNotification,
      }}
    >
      {children}
      
      {/* Render notifications */}
      <div className="fixed inset-0 pointer-events-none z-[9998]">
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <BeautifulNotification
              {...notification}
              onClose={removeNotification}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
