import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Check, Clock, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Notification {
  id: string;
  type: 'application_approved' | 'application_pending' | 'application_rejected' | 'new_application' | 'ticket_purchased';
  message: string;
  retreatName: string;
  userName?: string;
  timestamp: string;
  avatarUrl?: string;
  thumbnailUrl?: string;
  isRead: boolean;
}

// Mock notification data
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'application_approved',
    message: "You've been approved for",
    retreatName: "Digital Detox & Mindfulness Retreat",
    timestamp: "2 hours ago",
    avatarUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=150&h=150&fit=crop&crop=face",
    thumbnailUrl: "/placeholder.svg",
    isRead: false
  },
  {
    id: '2',
    type: 'new_application',
    message: "applied to your retreat",
    retreatName: "Mountain Meditation Retreat",
    userName: "Alex Johnson",
    timestamp: "5 hours ago",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    thumbnailUrl: "/placeholder.svg",
    isRead: false
  },
  {
    id: '3',
    type: 'application_pending',
    message: "Your application for",
    retreatName: "Yoga & Cenote Healing Retreat",
    timestamp: "1 day ago",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    thumbnailUrl: "/placeholder.svg",
    isRead: true
  },
  {
    id: '4',
    type: 'ticket_purchased',
    message: "purchased a ticket for",
    retreatName: "Surf & Meditation Retreat",
    userName: "Maria Garcia",
    timestamp: "2 days ago",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    thumbnailUrl: "/placeholder.svg",
    isRead: true
  }
];

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
    default:
      return notification.message;
  }
};

export const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
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
          {notifications.length === 0 ? (
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
                  onClick={() => markAsRead(notification.id)}
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
  );
};