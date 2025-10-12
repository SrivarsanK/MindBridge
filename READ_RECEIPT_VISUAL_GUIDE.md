# Read Receipt Visual Guide

## Quick Reference

### Read Receipt States

```
┌─────────────────────────────────────────────────────────┐
│  MESSAGE STATUS INDICATORS                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📤 Sending...                                          │
│     [Spinner icon] → Optimistic update in progress      │
│                                                          │
│  ✓  Sent                                                │
│     Single gray check → Message encrypted & sent        │
│                                                          │
│  ✓✓ Delivered                                           │
│     Double gray checks → Peer received & decrypted      │
│                                                          │
│  ✓✓ Seen (Blue)                                         │
│     Double blue checks → Peer viewed for 1+ seconds     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Visual Examples

### Your Message Timeline

```
You: Hey, are you there?
     2:30 PM [Spinner] ← Sending

You: Hey, are you there?
     2:30 PM ✓ ← Sent to server

You: Hey, are you there?
     2:30 PM ✓✓ ← Peer received

You: Hey, are you there?
     2:30 PM ✓✓ ← Peer saw message (blue)
```

### Chat View Example

```
┌────────────────────────────────────────────────┐
│  ← Peer Name        [End-to-end encrypted] ✓  │
├────────────────────────────────────────────────┤
│                                                │
│  ┌──────────────────────────┐                 │
│  │ Hi! How are you?         │                 │
│  │ 2:25 PM                  │ ← Peer's message│
│  └──────────────────────────┘                 │
│                                                │
│                 ┌──────────────────────────┐   │
│                 │ I'm doing okay, thanks!  │   │
│                 │ 2:26 PM ✓✓              │   │ ← Your message
│                 └──────────────────────────┘   │   (double blue = seen)
│                                                │
│  ┌──────────────────────────┐                 │
│  │ That's good to hear      │                 │
│  │ 2:27 PM                  │                 │
│  └──────────────────────────┘                 │
│                                                │
│                 ┌──────────────────────────┐   │
│                 │ Thanks for asking!       │   │
│                 │ 2:28 PM ✓               │   │ ← Your new message
│                 └──────────────────────────┘   │   (single check = sent)
│                                                │
├────────────────────────────────────────────────┤
│  [Type your message...]            [Send 📤]  │
└────────────────────────────────────────────────┘
```

## Color Coding

| Status     | Icon         | Color          | Meaning                              |
|------------|--------------|----------------|--------------------------------------|
| Sending    | ⏳ (spinner) | Gray (opacity) | Optimistic - not confirmed yet       |
| Sent       | ✓            | Gray 50%       | Server confirmed receipt             |
| Delivered  | ✓✓           | Gray 70%       | Peer's device received               |
| Seen       | ✓✓           | Blue (#60A5FA) | Peer actively viewed                 |

## CSS Classes Used

```tsx
// Sent (single gray check)
<Check className="h-3 w-3 opacity-50" />

// Delivered (double gray checks)
<div className="relative">
  <Check className="h-3 w-3 opacity-70" />
  <Check className="h-3 w-3 opacity-70 absolute -left-1" />
</div>

// Seen (double blue checks)
<div className="relative text-blue-400">
  <Check className="h-3 w-3" />
  <Check className="h-3 w-3 absolute -left-1" />
</div>

// Sending (loading spinner)
<Loader2 className="h-3 w-3 animate-spin opacity-50" />
```

## Status Progression Flow

```
User Action          →  Status      →  Visual Indicator
────────────────────────────────────────────────────────
Click Send           →  Sending     →  ⏳ Spinner
Server confirms      →  Sent        →  ✓ Gray
Peer receives        →  Delivered   →  ✓✓ Gray
Peer views (1s+)     →  Seen        →  ✓✓ Blue
```

## Tooltip Text

When hovering over check marks:

- ✓ → "Sent"
- ✓✓ (gray) → "Delivered"
- ✓✓ (blue) → "Seen"

## Implementation Details

### Position in Message Bubble

```
┌────────────────────────────────┐
│ Your message text here         │
│                                │
│ 2:30 PM ✓✓ ← Timestamp + Icon │
└────────────────────────────────┘
   ↑        ↑
   Time   Status
```

### Only Show for Your Messages

```tsx
{msg.isMine && !isOptimistic && msg.deliveryStatus && (
  // Render check marks
)}
```

**Rule**: Check marks only appear on YOUR sent messages, not on received messages.

## WhatsApp Comparison

| Feature              | WhatsApp    | MindBridge |
|----------------------|-------------|------------|
| Single check (sent)  | ✓           | ✓          |
| Double check (deliv) | ✓✓          | ✓✓         |
| Blue checks (read)   | ✓✓ (blue)   | ✓✓ (blue)  |
| Clock icon (sending) | 🕐          | ⏳         |
| Position             | Bottom-right| Bottom-right|
| Size                 | 16x16px     | 12x12px    |

## Browser Compatibility

✅ Chrome/Edge (Chromium)  
✅ Firefox  
✅ Safari  
✅ Mobile browsers  

Icons use Lucide React, which supports all modern browsers.

## Accessibility

- Icons have `title` attributes for tooltips
- Visual and semantic meaning combined
- Color is not the only differentiator (single vs. double checks)
- Works in high contrast mode

## Performance

- Icons are SVG (lightweight)
- No additional network requests
- Rendered client-side
- Reactive updates via Convex real-time queries

## Summary

✓ = Sent (1 check, gray)  
✓✓ = Delivered (2 checks, gray)  
✓✓ = Seen (2 checks, blue)  

Just like WhatsApp, but with end-to-end encryption and anonymous peers!
