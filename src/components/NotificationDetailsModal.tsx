import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, X, Bell, ExternalLink, Calendar, User, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

interface NotificationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: Notification | null;
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'application_approved':
      return <Check className="w-6 h-6 text-green-500" />;
    case 'application_pending':
      return <Clock className="w-6 h-6 text-yellow-500" />;
    case 'application_rejected':
      return <X className="w-6 h-6 text-red-500" />;
    case 'new_application':
    case 'ticket_purchased':
      return <Bell className="w-6 h-6 text-blue-500" />;
    case 'idea_comment':
    case 'comment_reply':
      return <Bell className="w-6 h-6 text-purple-500" />;
    default:
      return <Bell className="w-6 h-6 text-muted-foreground" />;
  }
};

const getNotificationBadgeColor = (type: Notification['type']) => {
  switch (type) {
    case 'application_approved':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'application_pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'application_rejected':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'new_application':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'ticket_purchased':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'idea_comment':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'comment_reply':
      return 'bg-pink-100 text-pink-800 border-pink-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getNotificationTitle = (type: Notification['type']) => {
  switch (type) {
    case 'application_approved':
      return 'Application Approved';
    case 'application_pending':
      return 'Application Pending';
    case 'application_rejected':
      return 'Application Rejected';
    case 'new_application':
      return 'New Application Received';
    case 'ticket_purchased':
      return 'Ticket Purchased';
    case 'idea_comment':
      return 'New Comment on Your Idea';
    case 'comment_reply':
      return 'New Reply to Your Comment';
    default:
      return 'Notification';
  }
};


export const NotificationDetailsModal: React.FC<NotificationDetailsModalProps> = ({
  isOpen,
  onClose,
  notification
}) => {
  const navigate = useNavigate();

  if (!notification) return null;

  const handleViewExperience = () => {
    if (notification.experienceId) {
      navigate(`/experiences/${notification.experienceId}`);
      onClose();
    }
  };

  const handleViewApplication = () => {
    if (notification.experienceId && notification.applicationId) {
      // Navigate to the specific application details
      navigate(`/experiences/${notification.experienceId}/applications/${notification.applicationId}`);
      onClose();
    }
  };

  const handleViewProfile = () => {
    if (notification.senderId) {
      navigate(`/profile/${notification.senderId}`);
      onClose();
    }
  };

  const handleViewCommunity = () => {
    if (notification.actionUrl) {
      // Use the specific action URL from the notification
      navigate(notification.actionUrl);
    } else {
      // Fallback to general community page
      navigate('/community');
    }
    onClose();
  };

  const getNotificationMessage = () => {
    switch (notification.type) {
      case 'application_approved':
        return (
          <span>
            Great news! Your application for <strong>{notification.retreatName}</strong> has been approved. You're all set to join this amazing experience!
          </span>
        );
      case 'application_pending':
        return (
          <span>
            Your application for <strong>{notification.retreatName}</strong> is currently being reviewed. We'll notify you as soon as we have an update.
          </span>
        );
      case 'application_rejected':
        return (
          <span>
            Unfortunately, your application for <strong>{notification.retreatName}</strong> was not accepted this time. Don't worry, there are many other amazing experiences waiting for you!
          </span>
        );
      case 'new_application':
        return (
          <span>
            <strong>{notification.userName}</strong> has submitted a new application for your experience <strong>{notification.retreatName}</strong>. Review their application to make a decision.
          </span>
        );
      case 'ticket_purchased':
        return (
          <span>
            <strong>{notification.userName}</strong> has purchased a ticket for <strong>{notification.retreatName}</strong>. They're excited to join your experience!
          </span>
        );
      case 'idea_comment':
        return (
          <span>
            <strong>{notification.userName}</strong> commented on your community idea <strong>{notification.retreatName}</strong>.{' '}
            <button 
              onClick={handleViewCommunity}
              className="text-neon-cyan hover:text-neon-cyan/80 underline hover:no-underline transition-colors cursor-pointer"
            >
              Check out what they have to say!
            </button>
          </span>
        );
      case 'comment_reply':
        return (
          <span>
            <strong>{notification.userName}</strong> replied to your comment on the idea <strong>{notification.retreatName}</strong>.{' '}
            <button 
              onClick={handleViewCommunity}
              className="text-neon-cyan hover:text-neon-cyan/80 underline hover:no-underline transition-colors cursor-pointer"
            >
              Continue the conversation!
            </button>
          </span>
        );
      default:
        return <span>{notification.message}</span>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {getNotificationIcon(notification.type)}
            <span>{getNotificationTitle(notification.type)}</span>
            <Badge className={`ml-auto ${getNotificationBadgeColor(notification.type)}`}>
              {notification.type.replace('_', ' ').toUpperCase()}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Notification Content */}
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <Avatar className="w-12 h-12 flex-shrink-0">
                <AvatarImage src={notification.avatarUrl} />
                <AvatarFallback>
                  {notification.userName ? 
                    notification.userName.split(' ').map(n => n[0]).join('') : 
                    'U'
                  }
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <p className="text-sm text-muted-foreground">
                  {getNotificationMessage()}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {notification.timestamp}
                  </div>
                  {notification.userName && (
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {notification.userName}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Experience Thumbnail */}
            {notification.thumbnailUrl && (
              <div className="w-full h-32 bg-muted rounded-lg overflow-hidden">
                <img 
                  src={notification.thumbnailUrl} 
                  alt={notification.retreatName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            {/* Primary action based on notification type */}
            {(notification.type === 'new_application' || notification.type === 'application_approved' || notification.type === 'application_pending' || notification.type === 'application_rejected') && notification.experienceId && notification.applicationId ? (
              <Button 
                onClick={handleViewApplication}
                className="w-full bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-pink/80 hover:to-neon-purple/80 text-white font-semibold"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Application
              </Button>
            ) : notification.experienceId ? (
              <Button 
                onClick={handleViewExperience}
                className="w-full bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-pink/80 hover:to-neon-purple/80 text-white font-semibold"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Experience
              </Button>
            ) : null}

            {/* Secondary actions */}
            {notification.experienceId && (
              <Button 
                onClick={handleViewExperience}
                variant="outline"
                className="w-full border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10 hover:border-neon-cyan"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Experience
              </Button>
            )}

            {notification.senderId && (
              <Button 
                onClick={handleViewProfile}
                variant="outline"
                className="w-full border-neon-yellow/50 text-neon-yellow hover:bg-neon-yellow/10 hover:border-neon-yellow"
              >
                <User className="w-4 h-4 mr-2" />
                View Profile
              </Button>
            )}
          </div>

          {/* Additional Info */}
          <div className="pt-4 border-t">
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Notification ID:</strong> {notification.id}</p>
              <p><strong>Type:</strong> {notification.type}</p>
              <p><strong>Status:</strong> {notification.isRead ? 'Read' : 'Unread'}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
