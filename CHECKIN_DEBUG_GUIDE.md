# Check-in Not Saving - Detailed Debug Guide

## Current Status

**Problem**: Check-ins are not being saved to the database
**Evidence**: Convex logs show 0 check-ins, no `recordDailyCheckin` mutation calls

## Debug Logging Added

I've added extensive logging to help diagnose the issue:

### Frontend Logging (Browser Console):
```javascript
// Component load:
'recordCheckin mutation loaded:' true/false

// Streak data:
'Streak Data:' { currentStreak: 0, ... }

// Button click:
'handleSaveCheckin called!'
'Current mood:' 'neutral' // or whatever you selected
'recordCheckin function:' [Function]

// Validation:
'Validation passed, calling mutation...'
'Saving check-in with mood:' 'neutral' 'timezone:' 'Asia/Calcutta'

// Result:
'Check-in result:' { checkinId: '...', isNewCheckin: true }
```

### Backend Logging (Convex Terminal):
```
[recordDailyCheckin] User: mh762xkfwtf3zzmfwh8azbsy317san68
[recordDailyCheckin] Timezone: Asia/Calcutta
[recordDailyCheckin] Today date: 2025-10-13
[recordDailyCheckin] Existing check-in: Not found
[recordDailyCheckin] Created new check-in: abc123...
```

## Testing Steps

### Step 1: Refresh Everything
1. **Stop both servers** (Ctrl+C in both terminals)
2. **Clear browser cache**: Ctrl+Shift+Delete → Clear cache
3. **Restart Convex**:
   ```bash
   cd C:\Users\Arunavo\Desktop\Hackelite\MindBridge
   npx convex dev
   ```
   Wait for: `✔ Convex functions ready!`

4. **Restart Next.js** (in new terminal):
   ```bash
   pnpm run dev
   ```
   Wait for: `✓ Ready in X s`

### Step 2: Open Fresh Browser Tab
1. Open **new incognito/private window**
2. Go to: http://localhost:3000
3. Login if needed
4. Navigate to Dashboard

### Step 3: Open Console FIRST
1. Press **F12** to open DevTools
2. Go to **Console** tab
3. Clear console (trash icon)
4. Keep it visible while testing

### Step 4: Try Check-in
1. **Look at console** - Should see:
   ```
   recordCheckin mutation loaded: true function
   Streak Data: { currentStreak: 0, ... }
   ```

2. **Click a mood** (neutral, anxious, low, or lonely)
   - Mood button should highlight
   - "Save Check-in" button should appear

3. **Click "Save Check-in"**
   - Watch console for new logs
   - Watch Convex terminal for backend logs

### Step 5: Analyze Results

## Troubleshooting Scenarios

### Scenario A: No "handleSaveCheckin called!" in console
**Problem**: Button click not triggering function
**Cause**: React event handler issue or button disabled
**Fix**:
1. Check if button is visible (not hidden by CSS)
2. Inspect button element - verify onClick prop exists
3. Try clicking mood first, THEN save button

### Scenario B: "Invalid mood!" error
**Problem**: Mood value not being set correctly
**Cause**: useMood() context issue
**Logs to check**:
```
handleSaveCheckin called!
Current mood: undefined  ← Problem!
```
**Fix**:
1. Verify mood-provider is wrapping the app
2. Check if setMood() is working (click different moods)
3. Console.log the mood value after selecting

### Scenario C: "recordCheckin function: undefined"
**Problem**: Mutation not loaded from Convex
**Cause**: Convex client not connected or API not generated
**Fix**:
1. Check Convex dashboard - is project online?
2. Verify .env.local has correct CONVEX_URL
3. Regenerate API: `npx convex dev` (restart)
4. Check network tab - any failed requests to convex.cloud?

### Scenario D: Frontend logs work but no backend logs
**Problem**: Mutation called but not reaching backend
**Cause**: Authentication failure or network issue
**What you'd see**:
```
Frontend:
✓ handleSaveCheckin called!
✓ Current mood: neutral
✓ Validation passed, calling mutation...
✓ Saving check-in with mood: neutral timezone: Asia/Calcutta
✗ (hangs or error)

Backend:
(nothing - no logs at all)
```
**Fix**:
1. Check authentication - are you logged in?
2. Check network tab for 401/403 errors
3. Verify Convex client has auth token
4. Try logging out and back in

### Scenario E: "Not authenticated" error
**Problem**: getAuthUserId() returns null
**Logs**:
```
[CONVEX M(analytics:recordDailyCheckin)] [ERROR] Error: Not authenticated
```
**Fix**:
1. Check if user is signed in (check userProfile exists)
2. Verify Clerk/auth provider is working
3. Check auth.config.ts configuration
4. Try signing out and back in

### Scenario F: Backend logs appear but check-in not saved
**Problem**: Database insert failing
**Logs**:
```
✓ [recordDailyCheckin] User: ...
✓ [recordDailyCheckin] Timezone: Asia/Calcutta
✓ [recordDailyCheckin] Today date: 2025-10-13
✓ [recordDailyCheckin] Existing check-in: Not found
✗ (no "Created new check-in" log)
```
**Fix**:
1. Check schema - verify dailyCheckins table exists
2. Check indexes - verify by_user_and_date exists
3. Check for schema validation errors
4. Try manually inserting in Convex dashboard

## What to Share

Please copy and paste:

### 1. Browser Console Output (Full)
```
[Paste everything from console here]
```

### 2. Convex Terminal Output (New lines after click)
```
[Paste new lines that appear after clicking Save]
```

### 3. Network Tab Info
1. Open Network tab in DevTools
2. Filter by "convex"
3. Click "Save Check-in"
4. Share any failed requests (red) or 

errors

### 4. Behavior Description
- [ ] Can you see the mood buttons?
- [ ] Does clicking a mood highlight it?
- [ ] Does "Save Check-in" button appear?
- [ ] Does button stay enabled after clicking?
- [ ] Do you see any error toasts/messages?
- [ ] Does streak display appear (even with 0)?

## Quick Diagnostic Checklist

Run through these quickly:

- [ ] Convex dev running (`✔ Convex functions ready!`)
- [ ] Next.js dev running (`✓ Ready`)
- [ ] Browser console open (F12 → Console)
- [ ] Console shows: `recordCheckin mutation loaded: true`
- [ ] Console shows: `Streak Data: {...}`
- [ ] Clicked a mood - button highlights
- [ ] "Save Check-in" button appears
- [ ] Clicked "Save Check-in"
- [ ] Console shows: `handleSaveCheckin called!`
- [ ] Console shows: `Current mood: <something>`
- [ ] Console shows: `Validation passed...`
- [ ] Convex terminal shows: `[recordDailyCheckin]` logs
- [ ] No red errors anywhere

**If all ✓**: Check-in should save!
**If any ✗**: That's where the problem is!

## Manual Database Test

If mutation still doesn't work, let's test database directly:

1. Open Convex Dashboard: https://dashboard.convex.dev/
2. Go to your project
3. Click "Data" tab
4. Click "dailyCheckins" table
5. Click "+ Add Document"
6. Add manually:
   ```json
   {
     "userId": "mh762xkfwtf3zzmfwh8azbsy317san68",
     "mood": "neutral",
     "checkinDate": "2025-10-13",
     "timestamp": 1728849600000
   }
   ```
7. Save
8. Refresh dashboard - does streak show 1?

If manual entry works but mutation doesn't → Auth or API issue
If manual entry doesn't work → Schema or database issue

## Next Steps

1. Follow testing steps above
2. Share console and terminal output
3. I'll identify exact issue from logs
4. We'll fix it together!

---

**Status**: Debugging in progress
**Waiting for**: Console and terminal logs after clicking "Save Check-in"
