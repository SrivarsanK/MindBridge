# Testing Guide - Peer Matching Feature

## Current Status
✅ **App Running**: http://localhost:3000
✅ **Dashboard Loaded**: http://localhost:3000/dashboard
✅ **Peer Matching Card**: Visible on dashboard

## Testing Steps

### 1. Initial Setup - Create User Profile

Since you need a user profile for peer matching to work:

**Option A: Complete Onboarding**
1. Navigate to: http://localhost:3000/onboarding/step-1
2. Complete all 4 steps
3. On Step 4/4, check the "Anonymous peer matching" checkbox
4. Click "Finish" - this will create your profile with privacy settings
5. You'll be redirected to the dashboard

**Option B: Quick Profile Creation (If already on dashboard)**
If you see an error about "Profile not found":
1. Go back to onboarding: http://localhost:3000/onboarding/step-1
2. Complete the flow as above

### 2. Test Peer Matching Toggle

**Current State**: The toggle switch should be visible in the "Peer Matching" card

**Test Steps**:
1. ✅ Locate the "Peer Matching" card on dashboard
2. ✅ Find the "Enable matching" toggle switch
3. ✅ Click the toggle to enable peer matching
4. ✅ Toggle should turn on (blue/primary color)
5. ✅ Open browser DevTools Console (F12)
6. ✅ Check for any errors - should be none
7. ✅ Refresh the page
8. ✅ Toggle should remain enabled (synced with database)

**Expected Behavior**:
- Toggle smoothly transitions on/off
- No console errors
- State persists across page refreshes
- Privacy settings updated in Convex database

### 3. Test Mood Selection

**Prerequisites**: Peer matching must be enabled

**Test Steps**:
1. ✅ After enabling peer matching, mood buttons should appear
2. ✅ You'll see 4 mood options:
   - Neutral
   - Anxious
   - Low
   - Lonely
3. ✅ Click each mood option
4. ✅ Selected mood should highlight (border-primary, bg-primary/10)
5. ✅ Only one mood can be selected at a time

**Expected Behavior**:
- Smooth visual feedback on selection
- Selected mood has distinct styling
- Clicking another mood deselects previous

### 4. Test Find a Match

**Prerequisites**: 
- Peer matching enabled
- Mood selected
- Profile created with privacy settings

**Test Steps**:
1. ✅ Select a mood (e.g., "Anxious")
2. ✅ Click "Find a match" button
3. ✅ Button should change to "Finding a match..." with animated search icon
4. ✅ Button is disabled during search
5. ✅ After ~3 seconds, search completes

**Expected Results**:

**Scenario A: No Matches Found (Most Likely)**
- Button returns to "Find a match"
- No active matches appear
- This is normal if you're the only user in the system
- Check console for: "No matches found" or similar message

**Scenario B: Match Found (If other users exist)**
- Active match appears in "Active Matches" section
- Shows:
  - "Peer Connection" label
  - Message count (0 initially)
  - Ice-breaker message
  - X button to end conversation
- Mood selection and "Find a match" button hide

### 5. Test Active Match Display

**Prerequisites**: Active match must exist

**Test Steps**:
1. ✅ Check "Active Matches" section appears
2. ✅ Verify match details are displayed:
   - Message count
   - Ice-breaker message (e.g., "What's been on your mind lately?")
3. ✅ Hover over the X button
4. ✅ Click X to end conversation
5. ✅ Confirm match is removed
6. ✅ Mood selection reappears
7. ✅ "Find a match" button reappears

**Expected Behavior**:
- Smooth transitions
- Match removal is instant
- UI updates reactively

### 6. Test Privacy Settings Persistence

**Test Steps**:
1. ✅ Enable peer matching
2. ✅ Close browser tab
3. ✅ Reopen: http://localhost:3000/dashboard
4. ✅ Toggle should still be enabled
5. ✅ Disable peer matching
6. ✅ Refresh page
7. ✅ Toggle should be disabled

**Expected Behavior**:
- Settings persist across sessions
- Database updates happen immediately
- No console errors

### 7. Test Error Handling

**Test A: Profile Not Found**
1. ✅ If you skip onboarding, profile won't exist
2. ✅ Toggle switch should be disabled
3. ✅ Clicking toggle should show no action

**Test B: Matching Without Enabling**
1. ✅ Disable peer matching
2. ✅ "Find a match" button should be disabled
3. ✅ Button has opacity-50 and cursor-not-allowed
4. ✅ Clicking does nothing

**Test C: Request Match Error**
1. ✅ Check browser console (F12)
2. ✅ Click "Find a match"
3. ✅ If error occurs, alert should display
4. ✅ Error message should be descriptive

## Testing with Multiple Users

To properly test matching, you need 2+ users:

### Setup Multiple Users:

**Option 1: Use Multiple Browsers**
1. Open Chrome: http://localhost:3000
2. Open Firefox: http://localhost:3000
3. Complete onboarding in both
4. Enable peer matching in both
5. Try to find matches

**Option 2: Use Incognito/Private Windows**
1. Open normal browser window
2. Open incognito window
3. Sign in as different users
4. Test matching between them

**Option 3: Use Different Devices**
1. Computer: http://localhost:3000
2. Phone on same network: http://192.168.31.185:3000
3. Complete onboarding on both
4. Test matching

### Multi-User Test Scenarios:

**Scenario 1: Basic Matching**
1. User A: Enable matching, select "Anxious", find match
2. User B: Enable matching, select "Anxious", find match
3. Result: Should match each other
4. Both should see active match

**Scenario 2: Different Moods**
1. User A: Select "Neutral"
2. User B: Select "Lonely"
3. Result: May still match (mood is one factor, not exclusive)

**Scenario 3: Timezone Compatibility**
- Both users are in same timezone (auto-detected)
- Should have high compatibility score

**Scenario 4: End Conversation**
1. User A: Click X to end match
2. User A: Match removed from their view
3. User B: Match status changes to "completed"
4. Both can request new matches

## Console Debugging

Open Browser DevTools (F12) and check for:

### Successful Operations:
```
✓ Profile loaded
✓ Privacy settings updated
✓ Match request sent
✓ Active matches loaded
```

### Common Errors:
```
❌ "Not authenticated" - Sign in required
❌ "Profile not found" - Complete onboarding
❌ "Peer matching is disabled" - Enable in privacy settings
❌ "Access denied" - Authorization issue
```

## Network Tab Inspection

1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Watch for Convex API calls:
   - `api.users.getCurrentProfile` - Loads user profile
   - `api.users.updatePrivacySettings` - Updates privacy
   - `api.peerMatching.requestPeerMatch` - Requests match
   - `api.peerMatching.getActiveMatches` - Loads matches
   - `api.peerMatching.endPeerMatch` - Ends conversation

## Database Verification

### Check Convex Dashboard:
1. Go to: https://dashboard.convex.dev
2. Select your "MindBridge" deployment
3. Check tables:

**userProfiles**:
```javascript
{
  userId: "j...",
  privacySettings: {
    allowPeerMatching: true, // Should be true if enabled
    allowDreamAnalysis: true,
    shareEmotionalPatterns: false,
    dataRetentionDays: 90
  },
  timezone: "Asia/Kolkata", // Auto-detected
  // ... other fields
}
```

**peerMatches**:
```javascript
{
  user1Id: "j...",
  user2Id: "j...",
  matchScore: 75,
  status: "active", // or "completed"
  iceBreaker: "What's been on your mind lately?",
  messageCount: 0,
  // ... other fields
}
```

**auditLogs**:
```javascript
{
  action: "peer_match_created",
  userId: "j...",
  details: "Matched with peer (score: 75)",
  // ... other fields
}
```

## Expected Test Results

### ✅ Pass Criteria:
- [ ] Toggle switch works and persists
- [ ] Mood selection is responsive
- [ ] "Find a match" button works
- [ ] Loading state displays correctly
- [ ] No console errors during normal operation
- [ ] Privacy settings sync with database
- [ ] Active matches display properly
- [ ] End conversation removes match
- [ ] Profile creation works in onboarding

### ❌ Known Limitations:
- [ ] No matches found (expected with single user)
- [ ] Actual E2E encryption not implemented (placeholder)
- [ ] Match messaging UI not yet built (backend ready)
- [ ] No notification when matched
- [ ] Ice-breaker is random, not AI-generated

## Next Steps After Testing

### If Everything Works:
1. ✅ Feature is functional!
2. Consider adding second test user
3. Test actual matching between users
4. Review audit logs in Convex dashboard
5. Test message sending/receiving (backend ready)

### If Issues Found:
1. Check browser console for errors
2. Verify Convex deployment is active
3. Ensure user profile exists
4. Check privacy settings in database
5. Review audit logs for failed operations
6. Clear browser cache and retry

## Performance Testing

### Load Testing:
1. Create multiple user profiles
2. Enable peer matching for all
3. Request matches simultaneously
4. Check response times
5. Monitor Convex dashboard metrics

### Stress Testing:
1. Rapidly toggle peer matching on/off
2. Request multiple matches quickly
3. Check for race conditions
4. Verify database consistency

## Security Testing

### Privacy Verification:
1. ✅ No personal information shown in matches
2. ✅ User IDs are not exposed to other users
3. ✅ Messages are encrypted (in schema)
4. ✅ Users can leave anytime
5. ✅ Report system is available

### Content Moderation:
1. Try sending inappropriate content
2. Check if flagged in moderationQueue
3. Verify audit log entry created
4. Confirm priority is set correctly

---

## Quick Test Checklist

Use this for rapid testing:

```
□ App running on localhost:3000
□ Dashboard loads without errors
□ Peer Matching card is visible
□ Toggle switch is functional
□ Mood selection works
□ "Find a match" button clickable
□ Loading state appears
□ No console errors
□ Privacy settings persist
□ Active matches display (if found)
□ End conversation works
□ Profile exists in database
```

---

**Status**: Ready for Testing ✅  
**Last Updated**: October 12, 2025  
**Tester**: Follow steps above sequentially
