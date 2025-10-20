# 🚀 Real-Time Chat & Live Updates Implementation Guide

## Overview
This guide documents the **real-time chat and live updates** implementation using **SignalR** (Microsoft's WebSocket library) for the Experiences Platform.

## ✅ What Was Implemented

### **1. Real-Time Experience Chat** 💬
- Live chat rooms for each experience
- Automatic message broadcasting to all participants
- Typing indicators
- User presence (join/leave notifications)
- Message history persistence

### **2. Real-Time Community Updates** 🔄
- **Interest Button**: Updates instantly for all users when someone clicks "I'm Interested"
- **Comments**: New comments appear automatically without page refresh
- **Comment Counts**: Update in real-time on the mood board

---

## 📦 Backend Implementation

### **1. SignalR Setup**

#### **Package Installed:**
```bash
dotnet add package Microsoft.AspNetCore.SignalR
```

#### **Files Created:**

**`ExperiencesPlatformAPI/Models/ChatMessage.cs`**
- EF Core model for chat messages
- Fields: `Id`, `ExperienceId`, `UserId`, `Content`, `CreatedAt`

**`ExperiencesPlatformAPI/Hubs/ChatHub.cs`**
- SignalR Hub for real-time communication
- Methods:
  - `JoinExperience(experienceId)` - Join a chat room
  - `LeaveExperience(experienceId)` - Leave a chat room
  - `SendMessage(experienceId, message)` - Send a message
  - `StartTyping(experienceId)` - Typing indicator
  - `StopTyping(experienceId)` - Stop typing
- Events broadcast:
  - `ReceiveMessage` - New chat message
  - `UserJoined` - User entered chat
  - `UserLeft` - User left chat
  - `UserTyping` - Typing indicator

**`ExperiencesPlatformAPI/Controllers/ChatController.cs`**
- REST API for chat history
- Endpoints:
  - `GET /api/Chat/experience/{experienceId}` - Get chat history
  - `DELETE /api/Chat/{messageId}` - Delete own message

#### **Configuration in `Program.cs`:**

```csharp
// Add SignalR service
builder.Services.AddSignalR();

// JWT authentication for SignalR (query string support)
options.Events = new JwtBearerEvents
{
    OnMessageReceived = context =>
    {
        var accessToken = context.Request.Query["access_token"];
        var path = context.HttpContext.Request.Path;
        if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
        {
            context.Token = accessToken;
        }
        return Task.CompletedTask;
    }
};

// Map SignalR Hub
app.MapHub<ChatHub>("/hubs/chat");
```

#### **Real-Time Broadcasting in `IdeasController.cs`:**

- **Interest Updates**: When a user toggles interest, broadcast to all clients
- **New Comments**: When a comment is posted, notify all clients

```csharp
// Broadcast interest update
await _hubContext.Clients.All.SendAsync("InterestUpdated", ideaId.ToString(), responseData);

// Broadcast new comment
await _hubContext.Clients.All.SendAsync("NewComment", ideaId.ToString(), result);
```

### **2. Database Schema**

**Added `chat_messages` table:**

```sql
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content VARCHAR(2000) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_messages_experience ON chat_messages(experience_id);
CREATE INDEX idx_chat_messages_user ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at DESC);
```

**✅ Merged into:** `ExperiencesPlatformAPI/database_schema.sql` (lines 683-697)

---

## 🎨 Frontend Implementation

### **1. SignalR Client Setup**

#### **Package Installed:**
```bash
npm install @microsoft/signalr
```

#### **Files Created:**

**`src/services/signalr.service.ts`**
- Singleton SignalR connection manager
- Features:
  - Automatic reconnection with exponential backoff
  - JWT token authentication
  - Connection state management
  - Event listener registration

**Key Methods:**
- `initialize()` - Connect to SignalR hub
- `joinExperience(id)` - Join experience chat room
- `sendMessage(id, message)` - Send chat message
- `on(event, callback)` - Listen for events
- `off(event, callback)` - Unregister listeners

**`src/services/chat.service.ts`**
- REST API client for chat history
- Methods:
  - `getChatHistory(experienceId, limit)` - Fetch message history
  - `deleteMessage(messageId)` - Delete own message

### **2. Chat UI Component**

**`src/components/Chat/ChatRoom.tsx`**
- Full-featured chat room component
- Features:
  - Message history loading
  - Real-time message updates
  - Typing indicators
  - Online user count
  - Auto-scroll to new messages
  - Send messages with Enter key

**Usage:**
```tsx
<ChatRoom 
  experienceId="experience-uuid" 
  experienceTitle="Experience Name"
/>
```

### **3. Real-Time Community Updates**

**`src/components/Community/MoodBoard.tsx`**
- Added SignalR listeners for:
  - `InterestUpdated` - Update interest counts in real-time
  - `NewComment` - Update comment counts when new comments are posted

```typescript
// Listen for interest updates
signalRService.on('InterestUpdated', (ideaId, data) => {
  setIdeas(prev => prev.map(idea => 
    idea.id === ideaId 
      ? { ...idea, interestCount: data.interestCount }
      : idea
  ));
});

// Listen for new comments
signalRService.on('NewComment', (ideaId) => {
  setIdeas(prev => prev.map(idea => 
    idea.id === ideaId 
      ? { ...idea, commentCount: idea.commentCount + 1 }
      : idea
  ));
});
```

**`src/components/Community/CommentModal.tsx`**
- Added real-time comment listener
- New comments automatically appear for all users viewing the same idea

```typescript
signalRService.on('NewComment', (ideaId, comment) => {
  if (ideaId === idea.id && comment.userName !== 'You') {
    setComments(prev => [...prev, comment]);
  }
});
```

### **4. App Initialization**

**`src/App.tsx`**
- Initialize SignalR connection on app start (if user is authenticated)
- Disconnect on app unmount

```typescript
useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    signalRService.initialize().catch(console.error);
  }
  return () => {
    signalRService.disconnect();
  };
}, []);
```

### **5. Integration with Experience Portal**

**`src/pages/ExperiencePortal.tsx`**
- Replaced mock `PortalChat` with real `ChatRoom` component
- Added to "Chat" tab with 600px height

```tsx
<TabsContent value="chat" className="h-[600px]">
  <ChatRoom 
    experienceId={experienceId} 
    experienceTitle={experienceData.title}
  />
</TabsContent>
```

---

## 🔌 How It Works

### **Connection Flow:**

1. **User logs in** → JWT token stored in `localStorage`
2. **App loads** → `App.tsx` initializes SignalR connection with token
3. **SignalR connects** → WebSocket connection established to `https://localhost:7183/hubs/chat`
4. **User opens chat** → Frontend joins experience room via `JoinExperience(experienceId)`
5. **User sends message** → Frontend calls `SendMessage(experienceId, message)`
6. **Backend receives message** → Saves to DB and broadcasts `ReceiveMessage` to all clients in room
7. **All clients receive** → Message instantly appears for all users

### **Real-Time Events:**

| Event | Triggered When | Broadcast To | Updates |
|-------|---------------|--------------|---------|
| `ReceiveMessage` | New chat message sent | All users in experience room | Chat history |
| `UserJoined` | User joins experience | All users in experience room | Online count |
| `UserLeft` | User leaves experience | All users in experience room | Online count |
| `UserTyping` | User starts/stops typing | Other users in room | Typing indicator |
| `InterestUpdated` | "I'm Interested" clicked | All users (global) | Interest count |
| `NewComment` | Comment posted | All users (global) | Comment count |

---

## 🚀 Testing Guide

### **1. Test Real-Time Chat**

**Steps:**
1. Open two browser windows/tabs (or use incognito mode for second user)
2. Log in as different users in each window
3. Navigate to the same experience portal page
4. Click on the "Chat" tab in both windows
5. Send a message from one window
6. **Expected**: Message appears instantly in both windows
7. Type in one window
8. **Expected**: "User is typing..." appears in the other window

**Verification:**
- ✅ Messages sync instantly
- ✅ Typing indicators work
- ✅ Online user count updates when users join/leave
- ✅ Chat history loads when opening the tab

### **2. Test Real-Time Comments**

**Steps:**
1. Open two browser windows
2. Navigate to Community page in both
3. Click on the same idea to open the comment modal
4. Post a comment from one window
5. **Expected**: Comment appears instantly in both windows
6. **Expected**: Comment count on mood board updates in both windows

**Verification:**
- ✅ Comments sync in real-time
- ✅ Comment counts update automatically
- ✅ No duplicate comments appear

### **3. Test Real-Time Interest**

**Steps:**
1. Open two browser windows
2. Navigate to Community page in both
3. Click "I'm Interested" on an idea in one window
4. **Expected**: Interest count updates instantly in both windows
5. Click again to remove interest
6. **Expected**: Count decreases in both windows

**Verification:**
- ✅ Interest counts sync immediately
- ✅ Button state updates correctly
- ✅ No duplicate interest records created

---

## 🐛 Troubleshooting

### **SignalR Not Connecting**

**Symptoms:**
- Console shows "⚠️ SignalR not connected"
- Messages don't sync
- No typing indicators

**Solutions:**
1. Check if backend is running (`https://localhost:7183`)
2. Verify JWT token exists in `localStorage`
3. Check browser console for connection errors
4. Ensure CORS is configured correctly in `Program.cs`
5. Try refreshing the page

**Console Logs to Check:**
- `🔗 Initializing SignalR connection...`
- `✅ SignalR Connected! Connection ID: ...`
- `📍 Joined experience ...`

### **Messages Not Appearing**

**Check:**
1. Is SignalR connected? (check console)
2. Did you join the experience room?
3. Is the backend `ChatHub` receiving the message? (check backend logs)
4. Are there any CORS errors in the console?

### **Reconnection Issues**

**The service includes automatic reconnection:**
- Exponential backoff: 2s, 4s, 8s, 16s, 32s
- Max 5 reconnection attempts
- If it fails after 5 attempts, user needs to refresh

**Force Reconnect:**
```javascript
await signalRService.disconnect();
await signalRService.initialize();
```

---

## 📊 Performance Considerations

### **Scalability:**
- Each SignalR connection uses one WebSocket
- Backend can handle ~10,000 concurrent connections per server
- For larger scale, consider using SignalR with Azure SignalR Service or Redis backplane

### **Message Size:**
- Chat messages limited to 2,000 characters
- Prevents abuse and ensures performance

### **Connection Pooling:**
- Singleton pattern ensures one connection per user session
- Connection reused across all pages

### **Bandwidth:**
- WebSocket uses binary protocol (efficient)
- Typical message: ~500 bytes
- 100 messages/min = ~50 KB/min bandwidth

---

## 🔒 Security

### **Authentication:**
- JWT token required for SignalR connection
- Token passed via query string: `/hubs/chat?access_token=...`
- Backend validates token on every Hub method call

### **Authorization:**
- Users can only join experience rooms they have access to
- Users can only delete their own messages
- Unauthorized attempts are logged

### **Data Validation:**
- Message content is sanitized
- XSS protection via React's built-in escaping
- SQL injection prevented by EF Core parameterized queries

---

## 📝 API Endpoints

### **SignalR Hub**
- **URL**: `wss://localhost:7183/hubs/chat`
- **Authentication**: JWT via query string

### **REST API**
- `GET /api/Chat/experience/{experienceId}?limit=50` - Get chat history
- `DELETE /api/Chat/{messageId}` - Delete message (own messages only)

---

## 🎯 Future Enhancements

### **Potential Features:**
- [ ] Message reactions (emoji)
- [ ] File/image sharing
- [ ] Direct messages between users
- [ ] Message search
- [ ] Message editing
- [ ] Read receipts
- [ ] Push notifications for mobile
- [ ] Voice/video chat integration
- [ ] Message threading
- [ ] Mentions (@user)
- [ ] Rich text formatting (bold, italic, links)
- [ ] Chat moderator tools (mute, ban)

---

## 📚 References

- **SignalR Documentation**: https://learn.microsoft.com/en-us/aspnet/core/signalr/introduction
- **@microsoft/signalr NPM**: https://www.npmjs.com/package/@microsoft/signalr
- **WebSocket Protocol**: https://datatracker.ietf.org/doc/html/rfc6455

---

## ✅ Summary

**Backend:**
- ✅ SignalR Hub created (`ChatHub.cs`)
- ✅ Chat model & table added to database
- ✅ REST API for chat history (`ChatController.cs`)
- ✅ Real-time broadcasting in `IdeasController.cs`
- ✅ JWT authentication configured
- ✅ Database schema updated

**Frontend:**
- ✅ SignalR service created (`signalr.service.ts`)
- ✅ ChatRoom component built
- ✅ Real-time updates added to Community
- ✅ SignalR initialized in App.tsx
- ✅ Chat integrated into Experience Portal

**Features:**
- ✅ Real-time chat with message persistence
- ✅ Typing indicators
- ✅ User presence
- ✅ Auto-reconnection
- ✅ Real-time comment updates
- ✅ Real-time interest button updates

**Status:** 🟢 **FULLY IMPLEMENTED & WORKING**

---

*Last Updated: October 15, 2025*
*Platform: Experiences Platform (C# .NET 9 + React + SignalR)*

