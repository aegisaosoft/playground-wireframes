import { useState, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip, Pin, MoreHorizontal, Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ChatMessage } from '@/types/experiencePortal';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface PortalChatProps {
  experienceId: string;
  userRole: 'organizer' | 'co-host' | 'attendee' | 'pending';
}

// Mock data
const mockMessages: ChatMessage[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Alex Chen',
    userAvatar: '/placeholder.svg',
    content: 'Welcome everyone to Desert Code Camp! 🏜️ Excited to have you all here.',
    timestamp: new Date('2024-03-14T18:30:00'),
    isPinned: true,
    isSystemMessage: true
  },
  {
    id: '2', 
    userId: '2',
    userName: 'Sarah Martinez',
    userAvatar: '/placeholder.svg',
    content: 'Just arrived! The sunset views are incredible 🌅',
    timestamp: new Date('2024-03-14T19:15:00'),
    reactions: [{ emoji: '❤️', users: ['1', '3'] }]
  },
  {
    id: '3',
    userId: '3', 
    userName: 'Mike Johnson',
    userAvatar: '/placeholder.svg',
    content: 'Has anyone seen the equipment list? Want to make sure I have everything for tomorrow.',
    timestamp: new Date('2024-03-14T20:00:00')
  }
];

export const PortalChat = ({ experienceId, userRole }: PortalChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isHost = userRole === 'organizer' || userRole === 'co-host';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: 'current-user',
      userName: 'You',
      content: newMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const togglePin = (messageId: string) => {
    if (!isHost) return;
    
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isPinned: !msg.isPinned } : msg
    ));
  };

  const addReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = msg.reactions || [];
        const existingReaction = reactions.find(r => r.emoji === emoji);
        
        if (existingReaction) {
          // Toggle user's reaction
          const userIndex = existingReaction.users.indexOf('current-user');
          if (userIndex > -1) {
            existingReaction.users.splice(userIndex, 1);
            if (existingReaction.users.length === 0) {
              return { ...msg, reactions: reactions.filter(r => r.emoji !== emoji) };
            }
          } else {
            existingReaction.users.push('current-user');
          }
        } else {
          reactions.push({ emoji, users: ['current-user'] });
        }
        
        return { ...msg, reactions };
      }
      return msg;
    }));
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (messages.length === 0) {
    return (
      <Card className="bg-white/5 border-white/10 rounded-2xl">
        <CardContent className="p-8 text-center">
          <div className="text-6xl mb-4">👋</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Say hi and introduce yourself</h3>
          <p className="text-muted-foreground">Be the first to start the conversation!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 border-white/10 rounded-2xl h-[600px] flex flex-col">
      <CardHeader className="border-b border-white/10">
        <CardTitle className="text-foreground">Group Chat</CardTitle>
      </CardHeader>
      
      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="group">
            {message.isPinned && (
              <div className="flex items-center gap-2 mb-2 text-xs text-neon-yellow">
                <Pin className="w-3 h-3" />
                <span>Pinned message</span>
              </div>
            )}
            
            <div className={`flex gap-3 ${message.isSystemMessage ? 'bg-neon-cyan/10 p-3 rounded-lg border border-neon-cyan/20' : ''}`}>
              <Avatar className="w-8 h-8">
                <AvatarImage src={message.userAvatar} alt={message.userName} />
                <AvatarFallback className="bg-neon-pink/20 text-neon-pink text-xs">
                  {message.userName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-foreground text-sm">{message.userName}</span>
                  <span className="text-xs text-muted-foreground">{formatTimestamp(message.timestamp)}</span>
                  {message.isSystemMessage && (
                    <Badge className="bg-neon-cyan/20 text-neon-cyan text-xs">System</Badge>
                  )}
                </div>
                
                <p className="text-gray-300 text-sm mb-2">{message.content}</p>
                
                {/* Reactions */}
                {message.reactions && message.reactions.length > 0 && (
                  <div className="flex gap-1 mb-2">
                    {message.reactions.map((reaction, index) => (
                      <button
                        key={index}
                        onClick={() => addReaction(message.id, reaction.emoji)}
                        className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-800 hover:bg-gray-700 text-xs"
                      >
                        <span>{reaction.emoji}</span>
                        <span className="text-muted-foreground">{reaction.users.length}</span>
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Message Actions */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <button 
                    onClick={() => addReaction(message.id, '❤️')}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    ❤️
                  </button>
                  <button 
                    onClick={() => addReaction(message.id, '👍')}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    👍
                  </button>
                  <button 
                    onClick={() => addReaction(message.id, '😄')}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    😄
                  </button>
                  
                  {isHost && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="text-xs text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="w-3 h-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => togglePin(message.id)}>
                          <Pin className="w-4 h-4 mr-2" />
                          {message.isPinned ? 'Unpin' : 'Pin'} message
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </CardContent>
      
      {/* Message Input */}
      <div className="border-t border-white/10 p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="bg-white/5 border-white/20 text-foreground pr-20"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <Smile className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <Paperclip className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-gradient-neon hover:opacity-90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift + Enter for new line
        </p>
      </div>
    </Card>
  );
};