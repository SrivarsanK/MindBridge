# Profile Creation Error - Debug Guide

## Changes Made

I've added comprehensive error logging to help diagnose profile creation issues for new users.

### Backend Changes (convex/users.ts)

Added extensive logging to `createOrUpdateProfile` mutation:
- `[createOrUpdateProfile] Starting profile creation/update` - Function entry
- `[createOrUpdateProfile] Args:` - Shows all arguments passed
- `[createOrUpdateProfile] User ID:` - Shows authenticated user ID
- `[createOrUpdateProfile] Existing profile found:` - Whether updating or creating
- `[createOrUpdateProfile] Profile data to insert:` - Exact data being saved
- `[createOrUpdateProfile] Profile created with ID:` - Success confirmation
- `[createOrUpdateProfile] ERROR:` - Any errors that occur

### Frontend Changes (app/onboarding/step-2/page.tsx)

Added detailed logging to `handleContinue` function:
- `[Step2] handleContinue called` - Function entry
- `[Step2] Form data:` - Shows name, age, gender entered
- `[Step2] Calling createProfile with:` - Data being sent to backend
- `[Step2] Profile created successfully:` - Success confirmation
- `[Step2] Failed to save profile:` - Error details

## How to Test and Debug

### Step 1: Start Fresh

1. **Stop all terminals** (Ctrl+C)

2. **Start Convex dev server:**
   ```bash
   npx convex dev
   ```
   Wait for: `✔ Convex functions ready!`

3. **Start Next.js dev server** (in new terminal):
   ```bash
   pnpm run dev
   ```
   Wait for: `✓ Ready`

### Step 2: Test with a New User

1. **Open browser in incognito/private mode**
2. Go to: http://localhost:3000
3. **Sign up as a new user**
4. **Open browser console** (F12 → Console tab)

### Step 3: Go Through Onboarding

1. Complete Step 1 (if applicable)
2. On **Step 2** (Profile Creation):
   - Enter a display name
   - Optionally enter age
   - Optionally select gender
   - **Open browser console BEFORE clicking Continue**

3. Click "Continue" button

### Step 4: Observe Logs

**In Browser Console:**
```
[Step2] handleContinue called
[Step2] Form data: { name: "...", age: "...", gender: "..." }
[Step2] Starting profile creation...
[Step2] Calling createProfile with: { displayName: "...", ... }
```

**In Convex Terminal:**
```
[CONVEX M(users:createOrUpdateProfile)] [LOG] '[createOrUpdateProfile] Starting profile creation/update'
[CONVEX M(users:createOrUpdateProfile)] [LOG] '[createOrUpdateProfile] Args:' {...}
[CONVEX M(users:createOrUpdateProfile)] [LOG] '[createOrUpdateProfile] User ID:' 'xxx...'
[CONVEX M(users:createOrUpdateProfile)] [LOG] '[createOrUpdateProfile] Existing profile found:' false
[CONVEX M(users:createOrUpdateProfile)] [LOG] '[createOrUpdateProfile] Creating new profile for user:' 'xxx...'
[CONVEX M(users:createOrUpdateProfile)] [LOG] '[createOrUpdateProfile] Profile data to insert:' {...}
[CONVEX M(users:createOrUpdateProfile)] [LOG] '[createOrUpdateProfile] Profile created with ID:' 'xxx...'
```

**Back in Browser Console:**
```
[Step2] Profile created successfully: "xxx..."
[Step2] Navigating to step 3...
```

## Common Error Scenarios

### Error 1: "Not authenticated"

**Browser Console:**
```
[Step2] Failed to save profile: Error: Not authenticated
```

**Convex Terminal:**
```
[CONVEX M(users:createOrUpdateProfile)] [LOG] '[createOrUpdateProfile] User ID:' null
[CONVEX M(users:createOrUpdateProfile)] [ERROR] '[createOrUpdateProfile] Not authenticated - no userId'
```

**Fix:**
- User is not properly logged in
- Check Clerk authentication setup
- Verify auth token is being sent
- Try logging out and back in

### Error 2: Schema validation error

**Convex Terminal:**
```
[CONVEX M(users:createOrUpdateProfile)] [ERROR] '[createOrUpdateProfile] ERROR:' ...
```

**Look for:**
- Missing required fields in schema
- Type mismatches (string vs number, etc.)
- Invalid enum values

**Fix:**
- Check schema.ts userProfiles table definition
- Verify all required fields are provided
- Check data types match schema

### Error 3: Missing timezone

**Browser Console:**
```
[Step2] Calling createProfile with: { displayName: "...", timezone: undefined }
```

**Fix:**
- Browser doesn't support Intl.DateTimeFormat
- Add fallback: `timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"`

### Error 4: Database insert fails

**Convex Terminal:**
```
[CONVEX M(users:createOrUpdateProfile)] [LOG] '[createOrUpdateProfile] Profile data to insert:' {...}
[CONVEX M(users:createOrUpdateProfile)] [ERROR] '[createOrUpdateProfile] ERROR:' ...
```

**Fix:**
- Check Convex dashboard for database issues
- Verify index "by_user_id" exists on userProfiles table
- Check if auditLogs table exists

## What to Share for Help

If the error persists, please provide:

### 1. Browser Console Output
```
[Copy all [Step2] logs here]
```

### 2. Convex Terminal Output
```
[Copy all [createOrUpdateProfile] logs here]
```

### 3. Error Details
- What step did it fail at?
- Is there an alert/error message shown to user?
- Does the page redirect or stay on Step 2?

### 4. User Status
- Is this a brand new user or existing user?
- Did they complete authentication?
- Can they access other parts of the app?

## Manual Database Check

If mutation seems to succeed but profile isn't created:

1. Open Convex Dashboard: https://dashboard.convex.dev/
2. Go to your project
3. Click "Data" tab
4. Check "userProfiles" table
5. Search for the user ID shown in logs
6. Verify profile data is correct

## Quick Validation Checklist

- [ ] User is authenticated (has valid auth token)
- [ ] `createOrUpdateProfile` function exists in convex/users.ts
- [ ] `userProfiles` table exists with correct schema
- [ ] `by_user_id` index exists on userProfiles
- [ ] `auditLogs` table exists
- [ ] Browser supports Intl.DateTimeFormat for timezone
- [ ] No CORS or network errors in browser Network tab
- [ ] Convex deployment is online and responding

## Next Steps

1. Follow the testing steps above
2. Copy all relevant logs (browser + Convex terminal)
3. Share them so we can pinpoint the exact issue
4. We'll fix it together!

---

**Status**: Debug logging added, awaiting test results
**Last Updated**: October 13, 2025
