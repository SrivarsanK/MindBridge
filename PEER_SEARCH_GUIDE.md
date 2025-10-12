# Peer Search Feature Guide

## Overview
The Peer Search page provides an advanced interface for users to find compatible peer connections based on mood, interests, and connection needs.

## Location
- **Route**: `/peer-search`
- **File**: `app/peer-search/page.tsx`

## Features

### 1. Mood Selection
- **6 Mood Options**: Anxious, Lonely, Stressed, Sad, Hopeful, Confused
- Visual color-coded cards for each mood
- Selected mood is highlighted with primary color
- Required field for matching

### 2. Connection Need Level
- **Scale**: 1-10 slider
- **Range**: "Just browsing" (1) to "Really need someone" (10)
- Visual progress bar with 10 segments
- Helps match users with similar urgency levels
- Accessible with proper ARIA labels

### 3. Interest Selection
- **18 Predefined Interests**:
  - Music, Reading, Gaming, Sports, Art, Coding
  - Movies, Travel, Cooking, Photography, Fitness, Meditation
  - Writing, Dancing, Nature, Science, Fashion, Volunteering
- **Search Functionality**: Filter interests by keyword
- **Multi-select**: Choose multiple interests
- **Visual Feedback**: Selected interests shown as badges with remove button
- **Minimum**: At least 1 interest required

### 4. Active Connections Sidebar
- **Real-time Display**: Shows current active peer matches
- **Match Score**: Displays compatibility percentage
- **Ice Breaker**: Shows conversation starter
- **Message Count**: Number of messages exchanged
- **Quick Navigation**: Click to open peer chat
- **Empty State**: Friendly message when no connections

### 5. Privacy & Safety

#### Privacy Protection
- 🔒 **End-to-End Encryption**: All conversations encrypted
- 👤 **Anonymous Identity**: No personal information shared
- 🎯 **Mood-Based Matching**: Algorithm uses mood + interests
- 🌍 **Timezone Matching**: Within ±3 hours for compatibility

#### Safety Features
- Never share personal information
- Report inappropriate behavior
- End conversations anytime
- 24/7 crisis support available

### 6. How It Works

**Step 1: Share Your Mood**
- Select current emotional state
- Helps find empathetic matches

**Step 2: AI Finds Matches**
- Backend processes match request
- Filters by mood compatibility, interests, timezone
- Calculates match scores
- Generates ice-breakers

**Step 3: Start Chatting**
- Anonymous connection established
- Encrypted messages
- Can view in Active Connections

## Technical Implementation

### Frontend Components
```typescript
// Main component
app/peer-search/page.tsx

// Updated dashboard card
components/dashboard/peer-matching-card.tsx (added "Advanced Search" button)
```

### State Management
```typescript
- selectedMood: string        // Current mood selection
- lonelinessLevel: number     // 1-10 connection need
- selectedInterests: string[] // Array of selected interests
- searchQuery: string         // Interest search filter
- isSearching: boolean        // Loading state
- showFilters: boolean        // Toggle interest search
```

### Convex Queries & Mutations
```typescript
// Queries
api.peerMatching.getActiveMatches  // Get user's active connections
api.auth.loggedInUser              // Current user authentication

// Mutations
api.peerMatching.requestPeerMatch  // Submit match request
  Parameters: { mood, lonelinessLevel, interests[] }
```

### Backend Logic (convex/peerMatching.ts)

#### Match Request Flow
1. **User submits**: mood, lonelinessLevel, interests
2. **Validation**: Check privacy settings (allowPeerMatching)
3. **Schedule**: Internal action processPeerMatch
4. **Find Peers**: loadPotentialMatches query
   - Filter by timezone (±3 hours)
   - Check accountStatus === "active"
   - Respect privacy settings
5. **Calculate Scores**: Mood + interest compatibility
6. **Create Match**: Insert into peerMatches table
7. **Generate Ice-breaker**: AI-powered conversation starter
8. **Audit Log**: Record match creation

#### Match Criteria
```typescript
{
  moodCompatibility: number,      // 0-1 score
  timezoneMatch: boolean,         // Within ±3 hours
  lonelinessLevel: number,        // 1-10
  sharedInterests: string[]       // Array of common interests
}
```

## User Flow

### From Dashboard
1. Navigate to dashboard (`/dashboard`)
2. Find "Peer Matching" card in right sidebar
3. Click "Advanced Search" button
4. Redirects to `/peer-search`

### Direct Access
- URL: `https://yourdomain.com/peer-search`
- Requires authentication (auto sign-in with anonymous)

### Search Process
1. **Select Mood** (required)
2. **Adjust Connection Need** (1-10 slider)
3. **Choose Interests** (minimum 1 required)
   - Use search bar to filter
   - Click badges to toggle selection
4. **Click "Find a Peer Connection"**
5. **Processing**: Shows "Finding Your Perfect Match..."
6. **Success**: Redirects to dashboard after 2 seconds
7. **New Match**: Appears in "Active Connections" sidebar

## Accessibility

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Tab through mood cards, slider, interest badges
- Enter/Space to select

### Screen Readers
- ARIA labels on range slider
- Semantic HTML structure
- Descriptive button text

### Visual Indicators
- Color-coded moods with labels
- High contrast borders on selection
- Loading states with spinners
- Success/error feedback

## Error Handling

### Validation Errors
```typescript
// No mood selected
alert("Please select your current mood")

// No interests selected
alert("Please select at least one interest")
```

### Network Errors
```typescript
try {
  await requestPeerMatch({ mood, lonelinessLevel, interests })
} catch (error) {
  console.error("Error requesting peer match:", error)
  alert("Failed to request peer match. Please try again.")
  setIsSearching(false)
}
```

### Privacy Check
- Backend validates `allowPeerMatching` setting
- Returns error if disabled
- User must enable in dashboard first

## Performance

### Optimizations
- Interest search is client-side (no API calls)
- Active matches cached by Convex
- Debounced search input (instant filtering)
- Lazy loading of match results

### Loading States
- Button shows spinner during search
- Text changes to "Finding Your Perfect Match..."
- Button disabled during processing
- Auto-redirect after success

## Future Enhancements

### Potential Features
1. **Filter by Availability**
   - Show only users online now
   - Filter by recent activity

2. **Match Preview**
   - Show potential matches before committing
   - Display compatibility breakdown
   - Preview ice-breaker

3. **Saved Searches**
   - Save preferred mood + interest combinations
   - Quick re-search with saved criteria

4. **Match History**
   - View past connections
   - Re-match with previous peers
   - Rating system for matches

5. **Advanced Filters**
   - Age range (if opted in)
   - Language preference
   - Conversation style (listener vs. talker)

6. **Real-time Updates**
   - Live count of searching users
   - Estimated wait time
   - Match notification

## Integration Points

### Dashboard Card
- Quick match button (existing flow)
- Advanced search button (NEW - navigates to search page)
- Active matches display
- Online user stats

### Backend Schema
```typescript
// peerMatches table
{
  user1Id: Id<"users">,
  user2Id: Id<"users">,
  matchScore: number,
  matchCriteria: {
    moodCompatibility: number,
    timezoneMatch: boolean,
    lonelinessLevel: number,
    sharedInterests: string[]
  },
  status: "pending" | "active" | "completed" | "reported" | "blocked",
  iceBreaker: string,
  createdAt: number,
  lastActivityAt: number,
  messageCount: number
}
```

### Navigation Flow
```
Dashboard → Peer Matching Card → Advanced Search Button → Peer Search Page
                                                              ↓
                                                         Submit Match
                                                              ↓
                                                        Back to Dashboard
                                                              ↓
                                                    View in Active Connections
```

## Testing Checklist

### Functional Tests
- [ ] Mood selection works
- [ ] Slider adjusts connection level
- [ ] Interest search filters correctly
- [ ] Interest selection/deselection works
- [ ] Submit validates required fields
- [ ] Match request succeeds
- [ ] Redirects to dashboard after success
- [ ] Active matches display correctly

### UI Tests
- [ ] Responsive on mobile/tablet/desktop
- [ ] Animations smooth
- [ ] Loading states visible
- [ ] Error messages clear
- [ ] Back button works
- [ ] Privacy notice visible

### Accessibility Tests
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast sufficient
- [ ] Focus indicators visible
- [ ] ARIA labels present

### Edge Cases
- [ ] No interests selected → shows error
- [ ] No mood selected → shows error
- [ ] Network failure → shows error
- [ ] Privacy disabled → backend rejects
- [ ] Multiple rapid clicks → prevents duplicates

## Deployment Notes

### Requirements
- Next.js 15.2.4+
- Convex backend deployed
- Authentication configured
- Privacy settings enabled in schema

### Environment
- No additional environment variables needed
- Uses existing Convex configuration
- Inherits authentication from layout

### Monitoring
- Track match request success rate
- Monitor average search time
- Log failed matches for debugging
- Alert on privacy violations

## Support & Troubleshooting

### Common Issues

**"Please wait while your profile is being created"**
- Profile creation in progress
- Wait a few seconds and try again

**"Failed to request peer match"**
- Check network connection
- Verify privacy settings enabled
- Check browser console for errors

**No active matches showing**
- Matches may take time to process
- Refresh page to update
- Check if matches completed/ended

**Search button disabled**
- Ensure mood selected
- Ensure at least 1 interest selected
- Check privacy settings enabled

### Debug Mode
```typescript
// Enable console logging
console.log("Match request:", { mood, lonelinessLevel, interests })
console.log("Active matches:", activeMatches)
console.log("Current user:", currentUser)
```

## Security Considerations

### Data Protection
- No personal information in match criteria
- Interests are generic categories (no custom input)
- Mood is predefined enum (no free text)
- Connection level is numeric (no PII)

### Privacy Compliance
- Users control matching via toggle
- Can end connections anytime
- No data retention beyond settings
- Audit logs for compliance

### Abuse Prevention
- Rate limiting on match requests
- Report system for inappropriate behavior
- Block functionality for problem users
- Automatic crisis detection

---

**Created**: April 21, 2025  
**Last Updated**: April 21, 2025  
**Version**: 1.0.0  
**Status**: ✅ Implemented & Ready for Testing
