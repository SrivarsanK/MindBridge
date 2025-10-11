# Streak Tracking and Insights Implementation

## Overview
Successfully implemented functional streak tracking and insights generation for the MindBridge mental health platform.

## What Was Implemented

### 1. Database Schema Updates (`convex/schema.ts`)
Added two new tables:

#### `dailyCheckins` Table
- Tracks user daily check-ins with mood states
- Fields:
  - `userId`: Reference to user
  - `mood`: One of ["neutral", "anxious", "low", "lonely"]
  - `checkinDate`: Date in YYYY-MM-DD format
  - `timestamp`: Unix timestamp
  - `notes`: Optional user notes
- Indexes: by_user_id, by_user_and_date, by_timestamp

#### `userInsights` Table
- Stores generated insights for users
- Fields:
  - `userId`: Reference to user
  - `insightType`: Type of insight (mood_pattern, activity_streak, progress_milestone, wellness_tip)
  - `title`: Insight title
  - `description`: Insight message
  - `metadata`: JSON string with additional data
  - `generatedAt`: Creation timestamp
  - `expiresAt`: Optional expiration date
  - `dismissed`: Whether user dismissed the insight
- Indexes: by_user_id, by_user_and_type, by_generated_at

### 2. Backend Functions (`convex/analytics.ts`)
Created comprehensive analytics module with:

#### Mutations:
- **`recordDailyCheckin`**: Records a daily mood check-in
  - Updates existing check-in if already done today
  - Automatically generates insights after check-in
  
- **`generateInsights`**: Generates personalized insights
  - Analyzes last 7 days of check-ins
  - Identifies dominant mood patterns
  - Creates mood pattern insights with supportive messages
  
- **`dismissInsight`**: Allows users to dismiss insights

#### Queries:
- **`getStreak`**: Returns current and longest streaks
  - Calculates consecutive daily check-ins
  - Returns: currentStreak, longestStreak, hasCheckedInToday, totalCheckins
  
- **`getMoodHistory`**: Fetches mood history for specified days (default 30)
  - Returns chronological list of check-ins
  
- **`getUserInsights`**: Retrieves active insights for the user
  - Filters out dismissed and expired insights
  - Returns up to 10 most recent insights
  
- **`getInsightsCount`**: Returns total number of insights generated

### 3. UI Components

#### Updated `DailyCheckinCard` (`components/dashboard/daily-checkin-card.tsx`)
- Added Convex integration for saving check-ins
- Shows "Save Check-in" button when mood is selected
- Displays success message after saving
- Tracks whether user has checked in today
- Prevents duplicate check-ins

#### New `InsightsCard` (`components/dashboard/insights-card.tsx`)
- Displays personalized insights with icons
- Shows up to 3 most recent insights
- Dismissible insights with X button
- Empty state with helpful message
- Shows total insights count indicator

#### Updated `Dashboard` (`app/dashboard/page.tsx`)
- Integrated real-time streak data
- Integrated real-time insights count
- Added InsightsCard to the dashboard layout
- Stats bar now shows:
  - Privacy: 100% (static)
  - Streak: Dynamic from database
  - Insights: Dynamic count from database

## Features

### Streak Calculation
- **Current Streak**: Counts consecutive days of check-ins up to today
- **Longest Streak**: Calculates the longest streak in user history
- **Smart Detection**: 
  - If checked in today, streak includes today
  - If not checked in today, starts from yesterday
  - Handles gaps in check-ins correctly

### Insight Generation
Automatically generated after each check-in:

#### Mood Pattern Insights
Analyzes the past 7 days and identifies dominant mood:
- **Neutral/Calm**: "You've been maintaining a calm state this week. Keep up the balanced mindset! 😌"
- **Anxious**: "You've been feeling anxious lately. Consider trying some breathing exercises or talking to someone. 💙"
- **Low**: "It seems you've been feeling low recently. Remember, it's okay to reach out for support. 🌟"
- **Lonely**: "You've been feeling lonely this week. Consider connecting with peers or joining group activities. 🤝"

### User Experience
- **Seamless Check-ins**: One-click mood selection with visual feedback
- **Motivation**: Streak counter encourages daily engagement
- **Personalization**: Insights adapt to individual patterns
- **Privacy**: All data stored securely in Convex backend

## Technical Details

### Data Flow
1. User selects mood → Click "Save Check-in"
2. `recordDailyCheckin` mutation called
3. Check-in saved to `dailyCheckins` table
4. `generateInsightsHelper` analyzes recent patterns
5. New insight added to `userInsights` table
6. Dashboard queries update reactively
7. UI reflects new streak count and insights

### Performance
- Reactive queries update UI automatically
- Indexed queries for fast lookups
- Efficient streak calculation algorithm
- Limited insights to most recent 10

### Future Enhancements
- Weekly/monthly mood summaries
- Streak milestone celebrations
- More insight types (sleep patterns, activity trends)
- Mood trend visualizations
- Export mood history reports

## Testing the Feature

1. **Navigate to Dashboard**: http://localhost:3000/dashboard
2. **First Check-in**:
   - Select a mood (Calm, Anxious, Low, or Lonely)
   - Click "Save Check-in"
   - See success message
   - Streak counter shows 1
3. **Daily Check-ins**:
   - Check in for multiple consecutive days
   - Watch streak counter increase
4. **View Insights**:
   - After 2-3 check-ins, insights will appear
   - See personalized mood pattern analysis
   - Dismiss insights by clicking X
5. **Break Streak**:
   - Skip a day
   - Streak resets but total check-ins remain

## Files Modified
- ✅ `convex/schema.ts` - Added tables
- ✅ `convex/analytics.ts` - New file with all logic
- ✅ `components/dashboard/daily-checkin-card.tsx` - Added saving functionality
- ✅ `components/dashboard/insights-card.tsx` - New component
- ✅ `app/dashboard/page.tsx` - Integrated real data

## Status: ✅ Fully Functional
All streak tracking and insights features are now live and operational!
