import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Check, Clock, X, Loader2, MessageCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { notificationsService, Notification as ApiNotification } from "@/services/notifications.service";
import { useToast } from "@/hooks/use-toast";
import { NotificationDetailsModal } from "./NotificationDetailsModal";

interface Notification {
  id: string;
  type: 'application_approved' | 'application_pending' | 'application_rejected' | 'new_application' | 'ticket_purchased' | 'idea_comment' | 'comment_reply';
  message: string;
  retreatName: string;
  userName?: string;
  timestamp: string;
  avatarUrl?: string;
  thumbnailUrl?: string;
  isRead: boolean;
  actionUrl?: string;
  experienceId?: string;
  applicationId?: string;
  ideaId?: string;
  commentId?: string;
  senderId?: string;
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'application_approved':
      return <Check className="w-4 h-4 text-green-500" />;
    case 'application_pending':
      return <Clock className="w-4 h-4 text-yellow-500" />;
    case 'application_rejected':
      return <X className="w-4 h-4 text-red-500" />;
    case 'new_application':
    case 'ticket_purchased':
      return <Bell className="w-4 h-4 text-blue-500" />;
    case 'idea_comment':
    case 'comment_reply':
      return <MessageCircle className="w-4 h-4 text-purple-500" />;
    default:
      return <Bell className="w-4 h-4 text-muted-foreground" />;
  }
};

const getNotificationMessage = (notification: Notification) => {
  switch (notification.type) {
    case 'application_approved':
      return (
        <span>
          {notification.message} <strong>{notification.retreatName}</strong>!
        </span>
      );
    case 'application_pending':
      return (
        <span>
          {notification.message} <strong>{notification.retreatName}</strong> is under review.
        </span>
      );
    case 'application_rejected':
      return (
        <span>
          Unfortunately, you weren't selected for <strong>{notification.retreatName}</strong>.
        </span>
      );
    case 'new_application':
      return (
        <span>
          <strong>{notification.userName}</strong> {notification.message} <strong>{notification.retreatName}</strong>.
        </span>
      );
    case 'ticket_purchased':
      return (
        <span>
          <strong>{notification.userName}</strong> {notification.message} <strong>{notification.retreatName}</strong>.
        </span>
      );
    case 'idea_comment':
      return (
        <span>
          <strong>{notification.userName}</strong> commented on your idea <strong>{notification.retreatName}</strong>.
        </span>
      );
    case 'comment_reply':
      return (
        <span>
          <strong>{notification.userName}</strong> replied to your comment on <strong>{notification.retreatName}</strong>.
        </span>
      );
    default:
      return notification.message;
  }
};

export const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const { toast } = useToast();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Load notifications from API
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setIsLoading(true);
        
        const apiNotifications = await notificationsService.getMyNotifications();
        
        // Transform API notifications to match UI expectations
        const transformedNotifications: Notification[] = apiNotifications.map((apiNotif: ApiNotification) => {
          // Extract title from message for community notifications
          let retreatName = apiNotif.experience?.title || 'Experience';
          
          // For community notifications, extract idea title from message
          if (apiNotif.type === 'idea_comment' || apiNotif.type === 'comment_reply') {
            const messageMatch = apiNotif.message.match(/idea "([^"]+)"/);
            if (messageMatch) {
              retreatName = messageMatch[1];
            } else {
              retreatName = 'Community Idea';
            }
          }
          
          return {
            id: apiNotif.id,
            type: mapNotificationType(apiNotif.type),
            message: apiNotif.message,
            retreatName: retreatName,
            userName: apiNotif.sender?.name,
            timestamp: formatTimestamp(apiNotif.createdAt),
            avatarUrl: apiNotif.sender?.avatar,
            thumbnailUrl: apiNotif.experience?.coverImage, // Use experience cover image
            isRead: apiNotif.isRead,
            actionUrl: apiNotif.actionUrl,
            experienceId: apiNotif.experienceId,
            applicationId: apiNotif.applicationId,
            ideaId: apiNotif.ideaId,
            commentId: apiNotif.commentId,
            senderId: apiNotif.senderId
          };
        });
        
        setNotifications(transformedNotifications);
        
      } catch (error) {
        // Don't show error toast for notifications to avoid spam
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, []);

  // Helper function to map API notification types to UI types
  const mapNotificationType = (apiType: string): Notification['type'] => {
    switch (apiType.toLowerCase()) {
      case 'application_approved':
        return 'application_approved';
      case 'application_pending':
        return 'application_pending';
      case 'application_rejected':
        return 'application_rejected';
      case 'new_application':
        return 'new_application';
      case 'ticket_purchased':
        return 'ticket_purchased';
      case 'idea_comment':
        return 'idea_comment';
      case 'comment_reply':
        return 'comment_reply';
      default:
        return 'new_application'; // Default fallback
    }
  };

  // Helper function to format timestamp
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // Update local state immediately for better UX
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      
      // Call API to mark as read
      await notificationsService.markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('❌ Failed to mark notification as read:', error);
      // Revert local state on error
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: false } : n)
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      // Update local state immediately for better UX
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      
      // Call API to mark all as read
      await notificationsService.markAllNotificationsAsRead();
    } catch (error) {
      console.error('❌ Failed to mark all notifications as read:', error);
      // Revert local state on error
      setNotifications(prev => prev.map(n => ({ ...n, isRead: false })));
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsDetailsModalOpen(true);
    
    // Mark as read if not already read
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedNotification(null);
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-96 p-0 bg-background border shadow-lg" 
          align="end"
          sideOffset={8}
        >
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Notifications</h3>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Mark all as read
                </Button>
              )}
            </div>
          </div>
          
          <ScrollArea className="h-96">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">
                <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                <p>Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="p-2">
                {notifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`mb-2 cursor-pointer transition-colors hover:bg-muted/50 ${
                      !notification.isRead ? 'bg-blue-50/50 border-blue-200' : 'bg-background'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        {/* Profile Avatar */}
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarImage src={notification.avatarUrl} />
                          <AvatarFallback className="text-xs">
                            {notification.userName ? 
                              notification.userName.split(' ').map(n => n[0]).join('') : 
                              'R'
                            }
                          </AvatarFallback>
                        </Avatar>
                        
                        {/* Notification Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2">
                            <div className="flex-1">
                              <p className="text-sm leading-relaxed">
                                {getNotificationMessage(notification)}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {getNotificationIcon(notification.type)}
                                <span className="text-xs text-muted-foreground">
                                  {notification.timestamp}
                                </span>
                              </div>
                            </div>
                            
                            {/* Retreat Thumbnail */}
                            {notification.thumbnailUrl && (
                              <div className="w-12 h-12 bg-muted rounded-md overflow-hidden flex-shrink-0">
                                <img 
                                  src={notification.thumbnailUrl} 
                                  alt="Retreat"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          </div>
                          
                          {/* Unread indicator */}
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
          
          {notifications.length > 0 && (
            <div className="p-3 border-t">
              <Button variant="ghost" size="sm" className="w-full text-sm">
                View all notifications
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
      
      {/* Notification Details Modal */}
      <NotificationDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        notification={selectedNotification}
      />
    </>
  );
};