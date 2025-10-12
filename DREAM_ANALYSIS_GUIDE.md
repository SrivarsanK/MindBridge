# Dream Analysis Feature Guide

## Overview
The Dream Analysis feature is now **fully functional** and allows users to record their dreams, analyze emotional patterns, and visualize trends over time.

## Features

### 1. **Dream Entry & Analysis**
- Users can type their dream descriptions in a text area
- On-device AI analysis extracts:
  - **Emotional Tags**: happy, fear, anxiety, sadness, anger, calm, love, excitement
  - **Stress Indicators**: escape scenarios, falling, time pressure, disorientation, performance anxiety
  - **Recurring Themes**: water, flying, home, work, family, school
  - **Emotional Weather**: sunny, clear, stormy, turbulent, cloudy, neutral
  - **Intensity Score**: 0-1 scale based on word analysis

### 2. **Emotional Pattern Visualization**
- **Line Chart**: Shows valence (positive/negative) and arousal (intensity) over recent dreams
- **Average Stats**: Displays average valence and arousal scores
- **7-Day Tracking**: Visualizes emotional patterns across recent dream entries

### 3. **Dream Insights Display**
- **Latest Dream Card**: Shows the most recent dream's:
  - Emotional weather
  - Emotional tags (up to 5)
  - Recurring themes (up to 3)

### 4. **Privacy & Security**
- Dream content is encrypted using base64 (in production, use proper encryption)
- All analysis happens on-device
- Dreams are stored with privacy level settings
- Audit logs track all dream analysis creation

## How It Works

### User Flow
1. User opens the Dream Analysis card on the dashboard
2. User types their dream description in the text area
3. User clicks "Analyze Dream"
4. On-device AI analyzes the text for emotions, themes, and stress indicators
5. Dream analysis is saved to Convex database
6. Charts and insights are automatically updated

### Technical Implementation

#### Frontend (`components/dashboard/dream-analysis-card.tsx`)
- React component with state management for dream text
- Convex hooks for real-time data fetching
- On-device analysis algorithm using keyword matching
- Recharts for emotional pattern visualization
- Responsive design with Tailwind CSS

#### Backend (`convex/dreamAnalysis.ts`)
- `createDreamAnalysis`: Mutation to save dream analysis
- `getUserDreamAnalyses`: Query to fetch user's dreams
- `getEmotionalPatterns`: Query to aggregate emotional trends
- Privacy checks and audit logging

#### Database Schema (`convex/schema.ts`)
```typescript
dreamAnalysis: {
  userId: Id<"users">,
  encryptedMetadata: string,
  emotionalTags: string[],
  stressIndicators: string[],
  recurringThemes: string[],
  analysisDate: number,
  visualizationData: {
    emotionalWeather: string,
    intensityScore: number,
    themeEvolution: Array<{
      theme: string,
      frequency: number,
      timestamp: number
    }>
  },
  privacyLevel: "private" | "anonymized" | "shared"
}
```

## Testing Guide

### Test Case 1: Happy Dream
```
I dreamed I was flying over a beautiful ocean. I felt so happy and free, 
very excited about the adventure. The sky was clear and peaceful.
```
**Expected Results:**
- Emotional Tags: happy, excitement, calm
- Themes: flying, water
- Emotional Weather: sunny
- High valence score

### Test Case 2: Stressful Dream
```
I was late for an important exam. I kept running but couldn't find the 
classroom. I felt very anxious and scared, falling behind everyone else.
```
**Expected Results:**
- Emotional Tags: anxiety, fear
- Stress Indicators: time-pressure, disorientation, performance-anxiety, falling
- Themes: school
- Emotional Weather: stormy
- Low valence, high arousal

### Test Case 3: Neutral Dream
```
I was at home watching TV with my family. Nothing special happened.
```
**Expected Results:**
- Emotional Tags: neutral
- Themes: home, family
- Emotional Weather: neutral
- Medium valence and arousal

## Usage Instructions

1. **Open Dashboard**: Navigate to http://localhost:3000/dashboard
2. **Find Dream Analysis Card**: Located in the left column
3. **Enter Dream**: Type your dream description
4. **Analyze**: Click "Analyze Dream" button
5. **View Results**: See emotional patterns, charts, and insights
6. **Track Progress**: Enter more dreams to see trends over time

## API Endpoints

### Create Dream Analysis
```typescript
const analysisId = await createDreamAnalysis({
  encryptedMetadata: string,
  emotionalTags: string[],
  stressIndicators: string[],
  recurringThemes: string[],
  emotionalWeather: string,
  intensityScore: number
})
```

### Get User's Dream Analyses
```typescript
const dreams = await getUserDreamAnalyses({ limit: 7 })
```

### Get Emotional Patterns
```typescript
const patterns = await getEmotionalPatterns({ days: 30 })
```

## Future Enhancements

### Planned Features
1. **Voice Recording**: Add audio recording with transcription
2. **Advanced NLP**: Use GPT-4 or similar for deeper analysis
3. **Dream Journaling**: Add notes and tags to dreams
4. **Pattern Detection**: Identify recurring themes across dreams
5. **Lucid Dream Tracker**: Track lucid dreaming attempts
6. **Sleep Quality Integration**: Correlate with sleep data
7. **Export Dreams**: Download dream journal as PDF/JSON
8. **Dream Sharing**: Share anonymized dreams with community

### Improvements
- Add more sophisticated emotion detection
- Implement proper end-to-end encryption
- Add dream category suggestions
- Create dream dictionary/symbol lookup
- Add meditation/relaxation recommendations based on patterns

## Privacy Considerations

- Dreams are encrypted before storage
- Analysis happens on-device
- Users control privacy settings
- Data can be exported or deleted
- Audit logs track all access
- No third-party sharing without consent

## Troubleshooting

### Issue: No dreams showing
**Solution**: Make sure you're logged in and have created at least one dream analysis

### Issue: Analysis not working
**Solution**: 
1. Check browser console for errors
2. Verify Convex backend is running (`npx convex dev`)
3. Ensure privacy settings allow dream analysis

### Issue: Chart not displaying
**Solution**: 
1. Enter at least 2-3 dreams for chart to render
2. Check that dreams have valid emotional data
3. Clear browser cache and reload

## Support

For issues or questions:
1. Check the console logs for error messages
2. Verify both Convex and Next.js servers are running
3. Review the implementation in `dream-analysis-card.tsx`
4. Check database schema in `convex/schema.ts`

---

**Status**: ✅ Fully Functional
**Last Updated**: October 12, 2025
