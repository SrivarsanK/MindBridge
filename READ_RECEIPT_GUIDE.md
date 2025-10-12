# Read Receipt Feature Implementation Guide

## Overview
The read receipt feature provides WhatsApp-like delivery status indicators for peer-to-peer encrypted messages, showing three states: **sent**, **delivered**, and **read** (seen).

## Visual Indicators

### 1. **Sent** (Single Gray Check ✓)
- Message has been sent to the server
- Encrypted and stored in database
- Peer hasn't received it yet

### 2. **Delivered** (Double Gray Checks ✓✓)
- Message has been received by the peer's device
- Peer's app has decrypted the message
- Automatically marked when peer's chat page loads the message

### 3. **Read/Seen** (Double Blue Checks ✓✓)
- Message has been viewed by the peer
- Peer had the chat open for at least 1 second
- Indicates active engagement

## Technical Implementation

### Database Schema
```typescript
// convex/schema.ts - peerMessages table
deliveryStatus: v.union(
  v.literal("sent"),      // Initial state when message is sent
  v.literal("delivered"), // Marked when peer receives message
  v.literal("read")       // Marked when peer views message for 1+ seconds
)
```

### Backend Mutations

#### 1. Mark Messages as Delivered
```typescript
// convex/peerMatching.ts
export const markMessagesAsDelivered = mutation({
  args: {
    matchId: v.id("peerMatches"),
    messageIds: v.array(v.id("peerMessages")),
  },
  handler: async (ctx, args) => {
    // Updates messages from "sent" → "delivered"
    // Only updates messages sent by the OTHER user
    // Called when peer's app receives messages
  }
})
```

#### 2. Mark Messages as Seen
```typescript
// convex/peerMatching.ts
export const markMessagesAsSeen = mutation({
  args: {
    matchId: v.id("peerMatches"),
    messageIds: v.array(v.id("peerMessages")),
  },
  handler: async (ctx, args) => {
    // Updates messages to "read"
    // Only updates messages sent by the OTHER user
    // Called after 1 second delay when viewing chat
  }
})
```

### Frontend Implementation

#### Message Interface Update
```typescript
interface DecryptedMessage {
  _id: string
  senderId: string
  plaintext: string
  timestamp: number
  isMine: boolean
  deliveryStatus?: "sent" | "delivered" | "read"
  decryptionFailed?: boolean
}
```

#### Automatic Status Updates

**Mark as Delivered** (Immediate):
```typescript
useEffect(() => {
  // Runs when messages are decrypted
  const undeliveredMessages = decryptedMessages
    .filter(msg => !msg.isMine && msg.deliveryStatus === "sent")
    .map(msg => msg._id)
  
  if (undeliveredMessages.length > 0) {
    markAsDelivered({ matchId, messageIds: undeliveredMessages })
  }
}, [decryptedMessages])
```

**Mark as Seen** (1 Second Delay):
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    const unseenMessages = decryptedMessages
      .filter(msg => !msg.isMine && msg.deliveryStatus !== "read")
      .map(msg => msg._id)
    
    if (unseenMessages.length > 0) {
      markAsSeen({ matchId, messageIds: unseenMessages })
    }
  }, 1000) // 1 second delay ensures user is actually viewing
  
  return () => clearTimeout(timer)
}, [decryptedMessages])
```

#### Visual Rendering
```tsx
{msg.isMine && !isOptimistic && msg.deliveryStatus && (
  <span className="flex items-center">
    {/* Single check for "sent" */}
    {msg.deliveryStatus === "sent" && (
      <Check className="h-3 w-3 opacity-50" />
    )}
    
    {/* Double gray checks for "delivered" */}
    {msg.deliveryStatus === "delivered" && (
      <div className="relative">
        <Check className="h-3 w-3 opacity-70" />
        <Check className="h-3 w-3 opacity-70 absolute -left-1" />
      </div>
    )}
    
    {/* Double blue checks for "read" */}
    {msg.deliveryStatus === "read" && (
      <div className="relative text-blue-400">
        <Check className="h-3 w-3" />
        <Check className="h-3 w-3 absolute -left-1" />
      </div>
    )}
  </span>
)}
```

## User Experience Flow

### Scenario: Alice sends a message to Bob

1. **Alice types and sends message**
   - Message appears instantly with loading spinner (optimistic update)
   - Encrypted client-side → sent to server

2. **Message sent successfully**
   - Loading spinner disappears
   - **Single gray check ✓** appears
   - Status: `"sent"`

3. **Bob's app receives the message**
   - Bob's device decrypts the message
   - Auto-triggers `markMessagesAsDelivered` mutation
   - Alice sees **double gray checks ✓✓**
   - Status: `"delivered"`

4. **Bob views the chat**
   - After 1 second of viewing, auto-triggers `markMessagesAsSeen`
   - Alice sees **double blue checks ✓✓**
   - Status: `"read"`

## Privacy Considerations

### What Read Receipts Reveal
- ✅ Message was successfully sent to server
- ✅ Peer's device received and decrypted the message
- ✅ Peer actively viewed the chat for 1+ seconds

### What Read Receipts DON'T Reveal
- ❌ Exact location or IP address
- ❌ Device type or browser
- ❌ Whether peer took a screenshot
- ❌ Whether peer read the message content carefully
- ❌ Identity of the peer (maintains anonymity)

### E2E Encryption Compatibility
- ✅ Read receipts work with end-to-end encryption
- ✅ Status updates are separate from message content
- ✅ Server can update status without decrypting messages
- ✅ Status metadata is not encrypted (by design)

## Testing Guide

### Test Case 1: Single User (Optimistic Updates)
1. Open chat in browser
2. Send a message
3. **Expected**: Loading spinner → Single gray check ✓
4. Message should have `deliveryStatus: "sent"`

### Test Case 2: Two Users (Delivery Status)
1. Open chat as User A (Browser 1)
2. Open same chat as User B (Browser 2)
3. User A sends message
4. **Expected in Browser 1**: Single check → Double gray checks ✓✓
5. **Expected in Browser 2**: Message appears immediately

### Test Case 3: Read Status
1. Continue from Test Case 2
2. Keep User B's chat open for 1+ seconds
3. **Expected in Browser 1**: Double gray checks → Double blue checks ✓✓
4. Status should update to `"read"`

### Test Case 4: Offline → Online
1. User A sends message while User B is offline
2. **Expected**: Message stays at single check ✓
3. User B comes online and opens chat
4. **Expected**: Updates to double gray → double blue checks

### Test Case 5: Multiple Messages
1. User A sends 5 rapid messages
2. User B receives them
3. **Expected**: All messages get delivered checks simultaneously
4. User B views chat
5. **Expected**: All messages get read checks after 1 second

## Performance Optimizations

### Batch Updates
- Messages are marked in batches, not individually
- Reduces number of mutation calls
- Example: 10 messages = 1 mutation call (not 10)

### Debouncing
- "Seen" status has 1 second delay
- Prevents rapid updates if user scrolls quickly
- Cleanup on unmount prevents memory leaks

### Filtering
- Only marks messages sent by OTHER user
- Skips messages that already have correct status
- Ignores temporary/optimistic messages (`temp-` prefix)

## Troubleshooting

### Issue: Checks not updating
**Cause**: Convex backend not running or network offline  
**Fix**: Ensure `npm run dev` is running for Convex

### Issue: Blue checks appear immediately
**Cause**: Timer cleanup not working  
**Fix**: Check useEffect cleanup function returns properly

### Issue: Duplicate status updates
**Cause**: Missing dependency array or infinite re-renders  
**Fix**: Verify all useEffect hooks have correct dependencies

### Issue: Checks appear for peer's messages
**Cause**: Not filtering by `msg.isMine`  
**Fix**: Only show checks for messages where `msg.isMine === true`

## Future Enhancements

### Possible Additions
1. **Typing Indicators**: Show when peer is typing
2. **Last Seen Timestamp**: Display when peer was last active
3. **Notification Sounds**: Audio alert for new messages
4. **Read Receipt Toggle**: Allow users to disable read receipts
5. **Group Chat Support**: Extend to multiple participants
6. **Message Reactions**: Quick emoji responses

### Privacy Options
- Setting to disable sending read receipts
- Still receive receipts from others
- WhatsApp-style: "If you turn off read receipts, you won't see them from others"

## Code Files Modified

| File | Changes |
|------|---------|
| `convex/peerMatching.ts` | Added `markMessagesAsDelivered` and `markMessagesAsSeen` mutations |
| `app/peer-chat/[matchId]/page.tsx` | Added UI rendering, status update effects, check mark icons |
| `convex/schema.ts` | Already had `deliveryStatus` field (no changes needed) |

## Summary

✅ **Sent** - Single gray check (message encrypted and sent)  
✅ **Delivered** - Double gray checks (peer received and decrypted)  
✅ **Read** - Double blue checks (peer viewed for 1+ seconds)  

The read receipt system provides real-time feedback while maintaining end-to-end encryption and user anonymity. It follows WhatsApp's familiar UX patterns for intuitive understanding.

---

**Implementation Status**: ✅ Complete  
**Last Updated**: October 12, 2025  
**Compatible With**: E2E Encryption, Anonymous Peer Chat
