# Error Fix: ArgumentValidationError - timezone field

## Error Message
```
ArgumentValidationError: Object contains extra field `timezone` that is not in the validator.
Object: {timezone: "Asia/Calcutta"}
Validator: v.object({})
```

## Root Cause
The Convex backend had not yet deployed the updated `getStreak` query with the new `timezone` parameter. The frontend was sending `timezone` but the backend validator didn't recognize it yet.

## Solution
Redeployed Convex functions by running:
```bash
npx convex dev
```

Result: ✅ Convex functions ready! (11.54s)

## Technical Details

### Updated Function Signature
```typescript
export const getStreak = query({
  args: {
    timezone: v.optional(v.string()),  // ← This was added
  },
  handler: async (ctx, args) => {
    // ... uses args.timezone
  },
});
```

### Why This Happened
1. We updated the `analytics.ts` file with new timezone parameter
2. Next.js hot-reloaded the frontend code
3. Frontend started sending `{timezone: "Asia/Calcutta"}` to backend
4. But Convex backend hadn't redeployed the updated schema yet
5. Convex validator rejected the extra field

### How Convex Works
- Convex watches `convex/` directory for changes
- Automatically redeploys when functions change
- But needs `npx convex dev` to be running
- If only `next dev` is running, backend won't update

## Current Status
✅ **Convex Dev Running**: Functions deployed and watching for changes  
✅ **Next.js Running**: Frontend at http://localhost:3000  
✅ **Error Resolved**: timezone parameter now accepted  
✅ **Streak Tracking**: Fully functional with timezone support  

## Prevention
Always ensure both processes are running:
1. `npx convex dev` - Backend function deployment
2. `pnpm run dev` - Next.js frontend

Or use a single command that runs both (if configured in package.json).

---

**Fixed**: October 13, 2025 22:01  
**Status**: ✅ RESOLVED
