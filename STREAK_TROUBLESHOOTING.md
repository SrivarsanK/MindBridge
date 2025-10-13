# Streak Counter Troubleshooting Guide

## Issue
Streak counter not updating after logging in and checking in.

## Changes Made

### 1. Improved Streak Display
**Before**: Only showed when `currentStreak > 0`
**After**: Always shows with helpful message

- ✨ **No streak**: Shows "Start Your Streak!" with sparkle emoji
- 🔥 **Active streak**: Shows fire emoji with day count

### 2. Added Debug Logging
Added console.log statements to track:
- Streak data received from backend
- Check-in save operations
- Timezone being used

### 3. Better UI Feedback
- Streak box always visible
- Clear call-to-action when no streak
- Immediate visual feedback after check-in

## How to Debug

### Step 1: Open Browser Console
1. Open http://localhost:3000/dashboard
2. Press `F12` or `Ctrl+Shift+I` to open DevTools
3. Go to "Console" tab

### Step 2: Check Streak Data
Look for console output:
```
Streak Data: {
  currentStreak: 0 or 1 or 2...,
  longestStreak: 0 or 1 or 2...,
  hasCheckedInToday: true or false,
  totalCheckins: 0 or 1 or 2...,
  recentCheckinDates: [...],
  todayDate: "2025-10-13"
}
```

**What to look for**:
- Is `streakData` null or undefined? → Backend not responding
- Is `currentStreak` 0 when it should be 1+? → Calculation issue
- Is `hasCheckedInToday` false after check-in? → Save issue
- Is `todayDate` correct for your timezone? → Timezone issue

### Step 3: Save a Check-in
1. Select a mood (neutral/anxious/low/lonely)
2. Click "Save Check-in"
3. Watch console for:
```
Saving check-in with mood: neutral timezone: Asia/Calcutta
Check-in result: { checkinId: "...", isNewCheckin: true }
```

**What to look for**:
- Does it say "Saving check-in..."? → Function called
- Is there a result? → Backend responded
- Is `isNewCheckin` true or false? → New vs. update
- Any errors? → Backend issue

### Step 4: Check Convex Dashboard
1. Open Convex dashboard: https://dashboard.convex.dev/
2. Find your project
3. Go to "Data" tab
4. Look at `dailyCheckins` table

**What to look for**:
- Are there any entries? → Check-ins being saved
- What's the `checkinDate`? → Should be today (YYYY-MM-DD)
- What's the `userId`? → Should match your user
- Multiple entries for same date? → Should update, not create new

### Step 5: Verify Functions Deployed
Check terminal running `npx convex dev`:
```
✔ 22:05:41 Convex functions ready! (9.45s)
```

If not ready:
1. Stop with `Ctrl+C`
2. Run `npx convex dev` again
3. Wait for "Convex functions ready!"

## Common Issues & Solutions

### Issue 1: Streak Shows 0 After First Check-in
**Symptom**: Just checked in, but streak shows "Start Your Streak!"
**Cause**: Query not refetching after mutation
**Solution**: 
- Refresh page (F5)
- If still 0, check Convex dashboard for entries
- Check console for errors

### Issue 2: "Check in today!" Shows After Check-in
**Symptom**: Saved check-in, but reminder still shows
**Cause**: `hasCheckedInToday` not updating
**Solution**:
- Check console log: Is `hasCheckedInToday` true?
- Verify timezone matches: Should be "Asia/Calcutta"
- Check backend date calculation

### Issue 3: Streak Resets Every Day
**Symptom**: Have checked in multiple days, but streak is always 1
**Cause**: Timezone or date comparison issue
**Solution**:
- Check `todayDate` in console: Should be YYYY-MM-DD format
- Verify dates in `dailyCheckins` table: Should be consecutive
- Check timezone in userProfile: Should match browser

### Issue 4: Multiple Check-ins Same Day
**Symptom**: Multiple entries in database for same date
**Cause**: Update logic not working
**Solution**:
- Check `by_user_and_date` index exists in schema
- Verify `existingCheckin` query finds the entry
- Should patch existing, not insert new

### Issue 5: No Streak Display at All
**Symptom**: Streak box doesn't appear
**Cause**: `streakData` is null/undefined
**Solution**:
- Check console: Is there a "Streak Data:" log?
- Verify Convex is connected (no red errors in console)
- Check authentication: Must be logged in

## Expected Behavior

### First Time User:
1. Visit dashboard → See "✨ Start Your Streak!"
2. Select mood + Save → See "✅ Check-in saved"
3. Immediately → See "🔥 1 Day" (might need refresh)
4. Stat bar at top → Shows "1" under streak

### Day 2:
1. Visit dashboard → See "🔥 1 Day" + "Check in today!"
2. Select mood + Save → See "✅ Check-in saved"
3. See celebration → "🎉 Amazing! 2 days in a row!"
4. Counter updates → "🔥 2 Days"

### Day 3:
1. Visit dashboard → See "🔥 2 Days" + "Check in today!"
2. Select mood + Save → Milestone! "🔥 3-Day Streak!" insight
3. Counter updates → "🔥 3 Days"

### After Missing a Day:
1. Visit dashboard → See "✨ Start Your Streak!" (reset)
2. Longest streak preserved in "Best: X"
3. Can start building again

## Testing Checklist

Run through these steps:

- [ ] Open dashboard - No errors in console
- [ ] See streak box (either ✨ or 🔥)
- [ ] Console shows "Streak Data: {...}"
- [ ] Select a mood
- [ ] Click "Save Check-in"
- [ ] Console shows "Saving check-in..."
- [ ] Console shows "Check-in result: {...}"
- [ ] See green "Check-in saved" message
- [ ] Streak counter updates (or refresh page)
- [ ] Stat bar at top shows correct number
- [ ] Convex dashboard has entry in dailyCheckins
- [ ] Entry has correct checkinDate (today)
- [ ] Entry has correct userId (your user)

If ALL checkboxes pass but streak still 0:
- There's a calculation bug in getStreak query
- Share console output for debugging

## Quick Fix Commands

### Restart Everything:
```bash
# Stop all (Ctrl+C in each terminal)
# Then:
cd C:\Users\Arunavo\Desktop\Hackelite\MindBridge

# Terminal 1:
npx convex dev

# Terminal 2:
pnpm run dev
```

### Clear Cache:
1. Open DevTools (F12)
2. Right-click Refresh button
3. Click "Empty Cache and Hard Reload"

### Check Logs:
```bash
# See Convex logs
npx convex logs

# See Next.js logs
# Check terminal running pnpm run dev
```

## What I Should See in Console

**On Page Load**:
```
Streak Data: {
  currentStreak: 1,
  longestStreak: 1,
  hasCheckedInToday: true,
  totalCheckins: 1,
  recentCheckinDates: ["2025-10-13"],
  todayDate: "2025-10-13"
}
```

**On Check-in Save**:
```
Saving check-in with mood: neutral timezone: Asia/Calcutta
Check-in result: { checkinId: "abc123", isNewCheckin: true }
```

**After Save** (should auto-update):
```
Streak Data: {
  currentStreak: 1,  ← Should increment if new day
  longestStreak: 1,
  hasCheckedInToday: true,  ← Should be true now
  totalCheckins: 1,
  ...
}
```

## Next Steps

1. **Open Console**: F12 → Console tab
2. **Refresh Dashboard**: F5
3. **Share Console Output**: Copy all "Streak Data:" logs
4. **Try Check-in**: Select mood → Save → Share "Check-in result:" log
5. **Check Convex Dashboard**: Verify data is being saved

With this information, I can identify exactly where the issue is occurring.

---

**Updated**: October 13, 2025 22:10  
**Status**: Debugging in progress  
**Action Required**: Check browser console and share output
