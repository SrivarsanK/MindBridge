# Testing Guide: Read Receipts

## Quick Test (5 minutes)

### Setup
1. Make sure both servers are running:
   ```bash
   npm run dev      # Next.js (port 3004)
   npx convex dev   # Convex backend
   ```

2. Open two browser windows side-by-side

### Test 1: Single User (Optimistic Updates)
**Browser 1:**
1. Navigate to `/dashboard`
2. Click "Find Peers" → Select mood → Click "Find a Peer Connection"
3. Wait for match (or use existing chat)
4. Type a message and click Send
5. **Expected:** See loading spinner ⏳ → Single gray check ✓

### Test 2: Two Users (Delivery Status)
**Browser 1 (User A):**
1. Send message: "Hello!"
2. Watch the status indicator

**Browser 2 (User B):**
1. Open the SAME chat (use the matchId from URL)
2. Message should appear automatically

**Browser 1 (User A):**
3. **Expected:** Check changes from ✓ → ✓✓ (double gray)
4. Status = "delivered"

### Test 3: Read Status (Seen)
**Browser 2 (User B):**
1. Keep chat open for 2+ seconds
2. Make sure you're looking at the message

**Browser 1 (User A):**
2. **Expected:** Checks turn BLUE ✓✓
3. Status = "read" (seen)

### Test 4: Multiple Messages
**Browser 1 (User A):**
1. Send 3 rapid messages
2. All should show single checks ✓

**Browser 2 (User B):**
1. Open chat
2. Wait 2 seconds

**Browser 1 (User A):**
3. **Expected:** All 3 messages update together:
   - ✓ → ✓✓ (gray) → ✓✓ (blue)

### Test 5: Offline/Online
**Browser 1 (User A):**
1. Send message while Browser 2 is closed

**Browser 2 (User B):**
2. Don't open yet

**Browser 1 (User A):**
3. **Expected:** Message stays at single check ✓

**Browser 2 (User B):**
4. Now open chat

**Browser 1 (User A):**
5. **Expected:** Check updates to ✓✓ gray then ✓✓ blue

## Visual Verification

### What You Should See

#### Sending State
```
You: Hello!
     2:30 PM [🔄 spinner]
```

#### Sent State
```
You: Hello!
     2:30 PM ✓
```

#### Delivered State  
```
You: Hello!
     2:30 PM ✓✓
```
*(Gray checks)*

#### Seen State
```
You: Hello!
     2:30 PM ✓✓
```
*(Blue checks)*

## Browser Console Checks

### Expected Console Logs

**When sending:**
```
📤 Encryption ready! Sending 1 queued messages...
✅ Queued message sent: "Hello!"
✅ Message sent successfully
```

**When marking as delivered:**
```
(No console log - happens silently)
```

**When marking as seen:**
```
(No console log - happens silently)
```

### Check for Errors
Open DevTools (F12) → Console tab

**Should NOT see:**
- ❌ "Failed to mark as delivered"
- ❌ "Failed to mark as seen"  
- ❌ TypeScript errors
- ❌ React key warnings

## Network Tab Verification

### Convex Mutations Called

Open DevTools → Network → Filter: "convex"

**Should see requests to:**
1. `sendPeerMessage` - When sending
2. `markMessagesAsDelivered` - When peer receives
3. `markMessagesAsSeen` - After 1 second viewing

**Response should be:**
```json
{
  "success": true
}
```

## Database Verification

### Check Convex Dashboard

1. Go to https://dashboard.convex.dev
2. Navigate to your project
3. Open "Data" → "peerMessages" table
4. Find your message
5. Check `deliveryStatus` field:
   - Should progress: "sent" → "delivered" → "read"

## Troubleshooting

### Issue: No check marks appear
**Fixes:**
- Refresh page (Ctrl+R)
- Check both servers are running
- Clear browser cache
- Check browser console for errors

### Issue: Stuck at single check
**Causes:**
- Peer hasn't opened chat yet
- Encryption not ready
- Network issue

**Fixes:**
- Wait for peer to join
- Check Convex connection
- Refresh both browsers

### Issue: Checks appear on peer's messages
**This is a bug!** Check marks should ONLY appear on YOUR messages.

**Fix:** File should filter by `msg.isMine === true`

### Issue: Blue checks appear instantly
**This is a bug!** Should have 1 second delay.

**Fix:** Check the setTimeout in markAsSeen useEffect

## Expected Behavior Summary

| Action | Browser 1 (Sender) | Browser 2 (Receiver) |
|--------|-------------------|---------------------|
| Send message | ⏳ → ✓ | (nothing yet) |
| Peer receives | ✓ → ✓✓ gray | Message appears |
| Peer views | ✓✓ gray → ✓✓ blue | (no change) |

## Performance Checks

### Should be fast:
- ✅ Check marks update within 1-2 seconds
- ✅ No page lag or freezing
- ✅ Smooth animations
- ✅ Real-time updates

### Red flags:
- ❌ Delays > 5 seconds
- ❌ Multiple re-renders
- ❌ Memory leaks
- ❌ Infinite loops

## Mobile Testing (Optional)

1. Open on phone browser
2. Repeat tests above
3. Check touch responsiveness
4. Verify icons are visible (not too small)

## Success Criteria

✅ Messages show correct status progression  
✅ Visual indicators match status (color/icon)  
✅ No console errors  
✅ Works across multiple browsers  
✅ Status updates happen automatically  
✅ E2E encryption still works  
✅ Peer anonymity maintained  

## Need Help?

- Check `READ_RECEIPT_GUIDE.md` for technical details
- Check `READ_RECEIPT_VISUAL_GUIDE.md` for visual reference
- Check `READ_RECEIPT_IMPLEMENTATION_SUMMARY.md` for overview

---

**Happy Testing! 🎉**

If all tests pass, the read receipt feature is working perfectly!
