# Peer Matching Feature Updates - Time Limit & Online Users

## Changes Made

### ✅ 1. Added Time Limit for Matching (30 seconds)

**File**: `components/dashboard/peer-matching-card.tsx`

#### Features:
- **Countdown Timer**: 30-second timer displayed during matching
- **Visual Progress Bar**: Animated progress indicator showing remaining time
- **Auto-Stop**: Matching automatically stops after 30 seconds if no match found
- **Real-time Updates**: Timer counts down every second (30s → 29s → 28s...)

#### Implementation:
```typescript
const MATCH_TIMEOUT = 30000; // 30 seconds
const [timeLeft, setTimeLeft] = useState(30)

// Countdown effect
useEffect(() => {
  let timer: NodeJS.Timeout
  if (isSearching && timeLeft > 0) {
    timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsSearching(false)
          return 30
        }
        return prev - 1
      })
    }, 1000)
  }
  return () => clearInterval(timer)
}, [isSearching, timeLeft])
```

#### UI Display:
- Button text: "Finding a match... 30s" → "Finding a match... 0s"
- Progress bar animates from 100% to 0% width over 30 seconds
- Smooth linear transition for visual feedback

---

### ✅ 2. Added Online Users Display

**File**: `convex/peerMatching.ts`

#### New Query: `getOnlineUsersStats`

Returns real-time statistics about peer matching users:

```typescript
{
  onlineCount: number,      // Users active in last 5 minutes
  searchingCount: number,   // Users currently matching (last 30s)
  totalAvailable: number    // Online but not currently matching
}
```

#### Logic:
- **Online Status**: Users active within last 5 minutes
- **Matching Status**: Users with pending matches in last 30 seconds
- **Filters**: Only counts users with peer matching enabled and active accounts

#### Implementation:
```typescript
export const getOnlineUsersStats = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    
    // Get recently active users with peer matching enabled
    const onlineUsers = await ctx.db
      .query("userProfiles")
      .withIndex("by_last_active")
      .order("desc")
      .filter((q) => 
        q.and(
          q.gte(q.field("lastActive"), fiveMinutesAgo),
          q.eq(q.field("privacySettings.allowPeerMatching"), true),
          q.eq(q.field("accountStatus"), "active")
        )
      )
      .collect();
    
    // Count users currently searching
    const thirtySecondsAgo = now - 30 * 1000;
    const recentMatches = await ctx.db
      .query("peerMatches")
      .withIndex("by_last_activity")
      .order("desc")
      .filter((q) => 
        q.and(
          q.gte(q.field("createdAt"), thirtySecondsAgo),
          q.eq(q.field("status"), "pending")
        )
      )
      .collect();
    
    return {
      onlineCount: onlineUsers.length,
      searchingCount: recentMatches.length,
      totalAvailable: onlineUsers.length - recentMatches.length
    };
  },
});
```

---

### ✅ 3. Updated UI to Display Online Stats

**File**: `components/dashboard/peer-matching-card.tsx`

#### Header Display:
```tsx
<div className="flex items-center justify-between">
  <div className="flex items-center gap-2">
    <Users className="h-5 w-5 text-primary" />
    <CardTitle className="text-lg">Peer Matching</CardTitle>
  </div>
  
  {/* Online Users Stats */}
  {onlineStats && (
    <div className="flex items-center gap-2 text-xs">
      {/* Online Count */}
      <div className="flex items-center gap-1">
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
        <span className="text-muted-foreground">
          {onlineStats.onlineCount} Online
        </span>
      </div>
      
      {/* Searching Count (only shown if > 0) */}
      {onlineStats.searchingCount > 0 && (
        <div className="flex items-center gap-1">
          <Loader2 className="h-3 w-3 text-orange-500 animate-spin" />
          <span className="text-muted-foreground">
            {onlineStats.searchingCount} Matching
          </span>
        </div>
      )}
    </div>
  )}
</div>
```

#### Visual Indicators:
- **Green Pulsing Dot**: Indicates users online
- **Orange Spinning Icon**: Shows users currently matching
- **Real-time Updates**: Stats refresh automatically via Convex

---

### ✅ 4. Added Auto-Update Last Active Status

**File**: `components/dashboard/peer-matching-card.tsx`

#### Implementation:
```typescript
const updateLastActive = useMutation(api.users.updateLastActive)

useEffect(() => {
  const interval = setInterval(() => {
    updateLastActive()
  }, 60000) // Update every minute
  
  // Initial update
  updateLastActive()
  
  return () => clearInterval(interval)
}, [updateLastActive])
```

#### Purpose:
- Updates user's `lastActive` timestamp every minute
- Ensures accurate "online" status for all users
- Runs automatically in background while on dashboard

---

## UI/UX Improvements

### Before:
- ❌ No time limit (searched indefinitely)
- ❌ No indication of how long matching takes
- ❌ No visibility of other users online
- ❌ Generic "Finding a match..." message

### After:
- ✅ **30-second time limit** with countdown
- ✅ **Visual progress bar** showing remaining time
- ✅ **Real-time online user count** (e.g., "3 Online")
- ✅ **Active matching indicator** (e.g., "2 Matching")
- ✅ **Better UX**: Users know exactly how long to wait

---

## Visual Examples

### Header with Online Stats:
```
┌─────────────────────────────────────────────┐
│ 👥 Peer Matching        🟢 3 Online 🟠 1 Matching │
│ Anonymous & encrypted                        │
└─────────────────────────────────────────────┘
```

### Search Button with Timer:
```
┌─────────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░       │
│      🔍 Finding a match... 15s              │
└─────────────────────────────────────────────┘
```

---

## Configuration

### Timeouts (Configurable):
```typescript
const MATCH_TIMEOUT = 30000;  // 30 seconds (change as needed)
```

### Online Status Window:
```typescript
const fiveMinutesAgo = now - 5 * 60 * 1000;  // 5 minutes
```

### Matching Status Window:
```typescript
const thirtySecondsAgo = now - 30 * 1000;  // 30 seconds
```

### Last Active Update Interval:
```typescript
setInterval(() => {
  updateLastActive()
}, 60000)  // 1 minute
```

---

## Testing Instructions

### Test Online User Count:
1. Open dashboard in browser 1
2. Enable peer matching
3. Open dashboard in browser 2 (incognito)
4. Enable peer matching
5. **Expected**: Header shows "2 Online"

### Test Matching Status:
1. Browser 1: Click "Find a match"
2. **Expected**: Header shows "1 Matching"
3. Browser 2: Click "Find a match"
4. **Expected**: Header shows "2 Matching"

### Test Timer:
1. Click "Find a match"
2. **Expected**: Button shows "Finding a match... 30s"
3. Watch countdown: 30s → 29s → 28s → ... → 1s → 0s
4. **Expected**: After 30 seconds, search stops automatically
5. **Expected**: Button returns to "Find a match"

### Test Progress Bar:
1. Click "Find a match"
2. **Expected**: Blue progress bar starts at full width
3. Watch progress bar shrink from right to left
4. **Expected**: Progress bar empties completely at 0 seconds

---

## Performance Considerations

### Query Efficiency:
- Uses indexed queries (`by_last_active`, `by_last_activity`)
- Filters at database level (not in application)
- Limits time ranges to reduce data processing

### Update Frequency:
- Last active: Updates every 60 seconds (not every second)
- Online stats: Reactive query, updates automatically
- Timer: Only runs when actively searching

### Resource Usage:
- Minimal: 1 mutation per minute per user
- Efficient: Indexed queries on user profiles
- Optimized: Timer uses single interval, not multiple

---

## Future Enhancements

### Potential Improvements:
1. **Configurable Timeout**: Let users choose 15s, 30s, 60s
2. **Priority Queue**: Match users who've waited longer first
3. **Match History**: Show previous match attempts
4. **Better Indicators**: Add "Available Now" badge
5. **Notifications**: Alert when match found
6. **Cancel Button**: Allow stopping search before timeout
7. **Retry Logic**: Auto-retry if network fails
8. **Sound Effects**: Audio notification on match

### Advanced Features:
1. **Peak Hours Display**: Show busiest times
2. **Match Success Rate**: Display percentage of successful matches
3. **Estimated Wait Time**: Predict match time based on online users
4. **Queue Position**: Show position in matching queue

---

## Troubleshooting

### Issue: Online count shows 0
**Solution**: 
- Check if users completed onboarding
- Verify `allowPeerMatching` is enabled
- Ensure `updateLastActive` is running

### Issue: Timer doesn't count down
**Solution**:
- Check browser console for errors
- Verify React hooks are working
- Ensure component is mounted

### Issue: Progress bar doesn't animate
**Solution**:
- Inline styles working (linting warning is OK)
- CSS transitions enabled in browser
- Check if `timeLeft` state is updating

### Issue: "Matching" status always 0
**Solution**:
- Need pending matches in database
- Check if `processPeerMatch` is running
- Verify match status is "pending"

---

## API Reference

### New Query:
```typescript
const onlineStats = useQuery(api.peerMatching.getOnlineUsersStats)
// Returns: { onlineCount, searchingCount, totalAvailable }
```

### Updated Mutation:
```typescript
const updateLastActive = useMutation(api.users.updateLastActive)
// No args, updates current user's lastActive timestamp
```

---

**Status**: ✅ Fully Implemented
**Testing**: Ready for QA
**Deployed**: Running on localhost:3001
**Last Updated**: October 12, 2025
