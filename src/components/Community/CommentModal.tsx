import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  ThumbsUp, 
  Reply,
  Heart,
  MoreHorizontal
} from 'lucide-react';
import { communityService } from '@/services/community.service';
import { useToast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: Date | string;  // ✅ API returns string, convert to Date when needed
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
}

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  idea?: {
    id: string;
    title: string;
    postedBy: { name: string; avatar?: string };
  };
  update?: {
    id: string;
    organizer: { name: string; avatar?: string };
    updateType: string;
    content: { text: string };
  };
}

// Mock comments data
const mockComments: Comment[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Sarah Chen',
    userAvatar: '/swfault_awatar.png',
    content: 'This sounds amazing! I\'ve been looking for something exactly like this. Count me in! 🙋‍♀️',
    timestamp: new Date('2024-01-15T14:30:00'),
    likes: 5,
    isLiked: false,
    replies: [
      {
        id: '1-1',
        userId: 'user2',
        userName: 'Alex Thompson',
        userAvatar: '/swfault_awatar.png',
        content: 'Same here! Would love to connect with other developers who are into wellness.',
        timestamp: new Date('2024-01-15T15:15:00'),
        likes: 2,
        isLiked: true
      }
    ]
  },
  {
    id: '2',
    userId: 'user3',
    userName: 'Maria Santos',
    content: 'What\'s the rough budget estimate for something like this? Also curious about accommodation options.',
    timestamp: new Date('2024-01-15T16:20:00'),
    likes: 3,
    isLiked: false
  },
  {
    id: '3',
    userId: 'user4',
    userName: 'Jordan Kim',
    userAvatar: '/swfault_awatar.png',
    content: 'I organized something similar in Thailand last year. Happy to share some insights if helpful!',
    timestamp: new Date('2024-01-15T17:45:00'),
    likes: 8,
    isLiked: true
  }
];

// Recursive component for unlimited nested replies
const RecursiveReply: React.FC<{
  reply: Comment;
  parentCommentId: string;
  parentReplyId: string;
  onLikeNestedReply: (nestedReplyId: string, replyId: string, parentId: string) => void;
  onSetNestedReplyingTo: (value: {parentId: string, replyId: string} | null) => void;
  formatTimeAgo: (date: Date | string) => string;
}> = ({ reply, parentCommentId, parentReplyId, onLikeNestedReply, onSetNestedReplyingTo, formatTimeAgo }) => {
  return (
    <div className="flex gap-2">
      <Avatar className="w-5 h-5 mt-1">
        <AvatarImage src={reply.userAvatar} />
        <AvatarFallback className="bg-neon-cyan/20 text-neon-cyan text-xs">
          {reply.userName.charAt(0)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="bg-white/3 rounded-lg p-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-xs text-white">
              {reply.userName}
            </span>
            <span className="text-xs text-white/60">
              {formatTimeAgo(reply.timestamp)}
            </span>
          </div>
          <p className="text-white/90 text-xs">{reply.content}</p>
        </div>
        
        <div className="flex items-center gap-2 mt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLikeNestedReply(reply.id, parentReplyId, parentCommentId)}
            className={`h-4 px-1 text-xs ${
              reply.isLiked 
                ? 'text-neon-pink bg-neon-pink/10' 
                : 'text-white/60 hover:text-neon-pink'
            }`}
          >
            <Heart className="w-3 h-3 mr-1" />
            {reply.likes > 0 && reply.likes}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSetNestedReplyingTo({parentId: parentCommentId, replyId: reply.id})}
            className="h-4 px-1 text-xs text-white/60 hover:text-neon-cyan"
          >
            <Reply className="w-3 h-3 mr-1" />
            Reply
          </Button>
        </div>

        {/* Recursively render deeper nested replies */}
        {reply.replies && reply.replies.length > 0 && (
          <div className="ml-4 space-y-2 border-l border-white/5 pl-4 mt-2">
            {reply.replies.map((nestedReply) => (
              <RecursiveReply
                key={nestedReply.id}
                reply={nestedReply}
                parentCommentId={parentCommentId}
                parentReplyId={reply.id}
                onLikeNestedReply={onLikeNestedReply}
                onSetNestedReplyingTo={onSetNestedReplyingTo}
                formatTimeAgo={formatTimeAgo}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const CommentModal = ({ isOpen, onClose, idea, update }: CommentModalProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [nestedReplyingTo, setNestedReplyingTo] = useState<{parentId: string, replyId: string} | null>(null);
  const [nestedReplyText, setNestedReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Fetch comments when modal opens
  useEffect(() => {
    const fetchComments = async () => {
      if (!isOpen || !idea) return;
      
      try {
        setIsLoading(true);
        console.log('📥 Fetching comments for idea:', idea.id);
        
        const fetchedComments = await communityService.getIdeaComments(idea.id);
        
        console.log('✅ Fetched comments:', fetchedComments);
        setComments(fetchedComments as Comment[]);
      } catch (error) {
        console.error('❌ Failed to fetch comments:', error);
        toast({
          title: "Error",
          description: "Failed to load comments",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [isOpen, idea, toast]);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !idea) return;

    try {
      setIsSubmitting(true);
      console.log('📤 Posting comment to idea:', idea.id);
      
      // Call API to create comment
      const createdComment = await communityService.createComment(idea.id, {
        content: newComment.trim()
      });
      
      console.log('✅ Comment created:', createdComment);

      // Add to local state
      setComments(prev => [...prev, createdComment as Comment]);
      setNewComment('');
    } catch (error) {
      console.error('❌ Failed to post comment:', error);
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitCommentOld = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: `new-${Date.now()}`,
      userId: 'current-user',
      userName: 'You',
      content: newComment,
      timestamp: new Date(),
      likes: 0,
      isLiked: false
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyText.trim() || !idea) return;

    try {
      setIsSubmitting(true);
      console.log('📤 Posting reply to comment:', parentId, 'on idea:', idea.id);
      
      // Call API to create reply
      const createdReply = await communityService.createComment(idea.id, {
        content: replyText.trim(),
        parentCommentId: parentId
      });
      
      console.log('✅ Reply created:', createdReply);

      // Add to local state
      setComments(prev => prev.map(comment => 
        comment.id === parentId 
          ? { ...comment, replies: [...(comment.replies || []), createdReply as Comment] }
          : comment
      ));
      
      setReplyText('');
      setReplyingTo(null);
    } catch (error) {
      console.error('❌ Failed to post reply:', error);
      toast({
        title: "Error",
        description: "Failed to post reply. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Recursive function to add a new reply to the correct nested location
  const addReplyToNestedStructure = (replies: Comment[], targetId: string, newReply: Comment): Comment[] => {
    return replies.map(reply => {
      if (reply.id === targetId) {
        return {
          ...reply,
          replies: [...(reply.replies || []), newReply]
        };
      }
      if (reply.replies && reply.replies.length > 0) {
        return {
          ...reply,
          replies: addReplyToNestedStructure(reply.replies, targetId, newReply)
        };
      }
      return reply;
    });
  };

  const handleSubmitNestedReply = async (parentId: string, replyId: string) => {
    if (!nestedReplyText.trim() || !idea) return;

    try {
      setIsSubmitting(true);
      console.log('📤 Posting nested reply to reply:', replyId, 'on idea:', idea.id);
      
      // Call API to create nested reply
      const createdNestedReply = await communityService.createComment(idea.id, {
        content: nestedReplyText.trim(),
        parentCommentId: replyId // Reply to the reply, not the original comment
      });
      
      console.log('✅ Nested reply created:', createdNestedReply);

      // Add to local state using recursive function
      setComments(prev => prev.map(comment => 
        comment.id === parentId 
          ? {
              ...comment, 
              replies: addReplyToNestedStructure(comment.replies || [], replyId, createdNestedReply as Comment)
            }
          : comment
      ));
      
      setNestedReplyText('');
      setNestedReplyingTo(null);
    } catch (error) {
      console.error('❌ Failed to post nested reply:', error);
      toast({
        title: "Error",
        description: "Failed to post reply. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = (commentId: string, isReply = false, parentId?: string) => {
    if (isReply && parentId) {
      setComments(prev => prev.map(comment => 
        comment.id === parentId 
          ? {
              ...comment,
              replies: comment.replies?.map(reply =>
                reply.id === commentId
                  ? {
                      ...reply,
                      isLiked: !reply.isLiked,
                      likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1
                    }
                  : reply
              )
            }
          : comment
      ));
    } else {
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? {
              ...comment,
              isLiked: !comment.isLiked,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
            }
          : comment
      ));
    }
  };

  // Recursive function to update likes in nested replies
  const updateReplyLike = (replies: Comment[], targetId: string): Comment[] => {
    return replies.map(reply => {
      if (reply.id === targetId) {
        return {
          ...reply,
          isLiked: !reply.isLiked,
          likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1
        };
      }
      if (reply.replies && reply.replies.length > 0) {
        return {
          ...reply,
          replies: updateReplyLike(reply.replies, targetId)
        };
      }
      return reply;
    });
  };

  const handleLikeNestedReply = (nestedReplyId: string, replyId: string, parentId: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === parentId 
        ? {
            ...comment,
            replies: comment.replies?.map(reply =>
              reply.id === replyId
                ? {
                    ...reply,
                    replies: updateReplyLike(reply.replies || [], nestedReplyId)
                  }
                : reply
            ) || []
          }
        : comment
    ));
  };

  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    const commentDate = typeof date === 'string' ? new Date(date) : date;
    const diffInMinutes = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const title = idea?.title || (update && `${update.organizer.name}'s ${update.updateType}`);
  const author = idea?.postedBy.name || update?.organizer.name;
  const authorAvatar = idea?.postedBy.avatar || update?.organizer.avatar;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background/95 backdrop-blur-sm border-white/20 text-white max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-3">
            <MessageCircle className="w-5 h-5 text-neon-cyan" />
            <div className="flex-1">
              <div className="truncate">{title}</div>
              {author && (
                <div className="text-sm font-normal text-white/60 flex items-center gap-2 mt-1">
                  <Avatar className="w-4 h-4">
                    <AvatarImage src={authorAvatar} />
                    <AvatarFallback className="bg-neon-cyan/20 text-neon-cyan text-xs">
                      {author.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  by {author}
                </div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Comment input */}
          <div className="space-y-3 pb-4 border-b border-white/10">
            <Textarea
              placeholder="Share your thoughts..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="bg-white/5 border-white/20 text-white placeholder:text-white/40 min-h-[80px]"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || isSubmitting}
                size="sm"
                className="bg-neon-cyan text-background hover:bg-neon-cyan/90 disabled:opacity-50"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Posting...' : 'Comment'}
              </Button>
            </div>
          </div>

          {/* Comments list */}
          <ScrollArea className="h-[60vh] w-full">
            <div className="space-y-4 pr-4">
              {isLoading ? (
                <div className="text-center py-8 text-white/60">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                  Loading comments...
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8 text-white/60">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2" />
                  No comments yet. Be the first to comment!
                </div>
              ) : (
                comments.map((comment) => (
                <div key={comment.id} className="space-y-3">
                  {/* Main comment */}
                  <div className="flex gap-3">
                    <Avatar className="w-8 h-8 mt-1">
                      <AvatarImage src={comment.userAvatar} />
                      <AvatarFallback className="bg-neon-cyan/20 text-neon-cyan text-xs">
                        {comment.userName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-2">
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-sm text-white">
                            {comment.userName}
                          </span>
                          <span className="text-xs text-white/60">
                            {formatTimeAgo(comment.timestamp)}
                          </span>
                        </div>
                        <p className="text-white/90 text-sm">{comment.content}</p>
                      </div>
                      
                      {/* Comment actions */}
                      <div className="flex items-center gap-4 text-xs">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLikeComment(comment.id)}
                          className={`h-6 px-2 ${
                            comment.isLiked 
                              ? 'text-neon-pink bg-neon-pink/10' 
                              : 'text-white/60 hover:text-neon-pink'
                          }`}
                        >
                          <Heart className="w-3 h-3 mr-1" />
                          {comment.likes > 0 && comment.likes}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setReplyingTo(comment.id)}
                          className="h-6 px-2 text-white/60 hover:text-white"
                        >
                          <Reply className="w-3 h-3 mr-1" />
                          Reply
                        </Button>
                      </div>

                      {/* Reply input */}
                      {replyingTo === comment.id && (
                        <div className="space-y-2 ml-4">
                          <Textarea
                            placeholder={`Reply to ${comment.userName}...`}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="bg-white/5 border-white/20 text-white placeholder:text-white/40 min-h-[60px] text-sm"
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleSubmitReply(comment.id)}
                              disabled={!replyText.trim() || isSubmitting}
                              size="sm"
                              className="bg-neon-cyan text-background hover:bg-neon-cyan/90 text-xs h-7"
                            >
                              Reply
                            </Button>
                            <Button
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText('');
                              }}
                              variant="ghost"
                              size="sm"
                              className="text-white/60 hover:text-white text-xs h-7"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="ml-4 space-y-3 border-l border-white/10 pl-4">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex gap-3">
                              <Avatar className="w-6 h-6 mt-1">
                                <AvatarImage src={reply.userAvatar} />
                                <AvatarFallback className="bg-neon-purple/20 text-neon-purple text-xs">
                                  {reply.userName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1 space-y-1">
                                <div className="bg-white/5 rounded-lg p-2">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-xs text-white">
                                      {reply.userName}
                                    </span>
                                    <span className="text-xs text-white/60">
                                      {formatTimeAgo(reply.timestamp)}
                                    </span>
                                  </div>
                                  <p className="text-white/90 text-xs">{reply.content}</p>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleLikeComment(reply.id, true, comment.id)}
                                    className={`h-5 px-2 text-xs ${
                                      reply.isLiked 
                                        ? 'text-neon-pink bg-neon-pink/10' 
                                        : 'text-white/60 hover:text-neon-pink'
                                    }`}
                                  >
                                    <Heart className="w-3 h-3 mr-1" />
                                    {reply.likes > 0 && reply.likes}
                                  </Button>
                                  
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setNestedReplyingTo({parentId: comment.id, replyId: reply.id})}
                                    className="h-5 px-2 text-xs text-white/60 hover:text-neon-cyan"
                                  >
                                    <Reply className="w-3 h-3 mr-1" />
                                    Reply
                                  </Button>
                                </div>
                                
                                {/* Nested Replies (replies to replies) - Recursive */}
                                {reply.replies && reply.replies.length > 0 && (
                                  <div className="ml-4 space-y-2 border-l border-white/5 pl-4 mt-2">
                                    {reply.replies.map((nestedReply) => (
                                      <RecursiveReply
                                        key={nestedReply.id}
                                        reply={nestedReply}
                                        parentCommentId={comment.id}
                                        parentReplyId={reply.id}
                                        onLikeNestedReply={handleLikeNestedReply}
                                        onSetNestedReplyingTo={setNestedReplyingTo}
                                        formatTimeAgo={formatTimeAgo}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                          
                          {/* Nested Reply Input */}
                          {nestedReplyingTo && nestedReplyingTo.parentId === comment.id && (
                            <div className="ml-4 space-y-2 border-l border-white/10 pl-4">
                              <Textarea
                                placeholder={`Reply to ${comment.replies?.find(r => r.id === nestedReplyingTo.replyId)?.userName || 'this reply'}...`}
                                value={nestedReplyText}
                                onChange={(e) => setNestedReplyText(e.target.value)}
                                className="bg-white/5 border-white/20 text-white placeholder:text-white/40 min-h-[60px] text-sm"
                              />
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleSubmitNestedReply(nestedReplyingTo.parentId, nestedReplyingTo.replyId)}
                                  disabled={!nestedReplyText.trim() || isSubmitting}
                                  size="sm"
                                  className="bg-neon-cyan text-background hover:bg-neon-cyan/90 text-xs h-7"
                                >
                                  Reply
                                </Button>
                                <Button
                                  onClick={() => {
                                    setNestedReplyingTo(null);
                                    setNestedReplyText('');
                                  }}
                                  variant="outline"
                                  size="sm"
                                  className="border-white/20 text-white/60 hover:bg-white/10 text-xs h-7"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                          
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};