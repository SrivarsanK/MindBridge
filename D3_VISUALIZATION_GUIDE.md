# D3.js Dream Visualization Guide

## 🎨 Overview

Successfully integrated **D3.js v7.9.0** for stunning, interactive dream analysis visualizations. The system now features three professional-grade D3 components with smooth animations, interactive tooltips, and responsive design.

---

## 📦 Installation

```bash
pnpm add d3 @types/d3
```

**Packages Added:**
- `d3` v7.9.0 (49 sub-packages)
- `@types/d3` v7.4.3 (TypeScript definitions)

---

## 🎯 Components

### 1. **D3DreamTimeline** - Horizontal Swimlane Chart

**File:** `components/dashboard/d3-dream-timeline.tsx` (225 lines)

**Purpose:** Visualize dream stages (deep, REM, light, awake, lucid) over time as a horizontal timeline.

**Features:**
- ✅ Time-based X-axis (d3.scaleTime)
- ✅ Stage-based Y-axis (d3.scaleBand)
- ✅ Linear gradients for each stage
- ✅ Intensity circles (size = intensity value)
- ✅ Interactive hover tooltips
- ✅ Smooth transitions (200ms)
- ✅ Rotated X-axis labels (-45°)

**Data Interface:**
```typescript
export interface D3DreamSegment {
  stage: "deep" | "rem" | "light" | "awake" | "lucid"
  startTime: Date
  endTime: Date
  emotion?: string
  intensity?: number  // 0-1
}
```

**Usage:**
```tsx
import { D3DreamTimeline, type D3DreamSegment } from "./d3-dream-timeline"

const segments: D3DreamSegment[] = [
  {
    stage: "light",
    startTime: new Date("2025-01-15T22:00:00"),
    endTime: new Date("2025-01-15T22:15:00"),
    intensity: 0.3
  },
  {
    stage: "rem",
    startTime: new Date("2025-01-15T22:15:00"),
    endTime: new Date("2025-01-15T22:35:00"),
    emotion: "fear",
    intensity: 0.8
  },
  // ... more segments
]

<D3DreamTimeline segments={segments} width={600} height={300} />
```

**Color Scheme:**
- Deep: `#3b82f6` (Blue)
- REM: `#a855f7` (Purple)
- Light: `#60a5fa` (Light Blue)
- Awake: `#f59e0b` (Amber)
- Lucid: `#ec4899` (Pink)

---

### 2. **D3EmotionalRadialChart** - Circular Radar Chart

**File:** `components/dashboard/d3-emotional-radial.tsx` (260 lines)

**Purpose:** Display emotional intensity distribution as a circular radar chart.

**Features:**
- ✅ Radial wedge layout (d3.arc)
- ✅ Angle distribution (0 to 2π)
- ✅ Radius = intensity (0 to 1)
- ✅ Concentric grid circles (25%, 50%, 75%, 100%)
- ✅ Center circle with average percentage
- ✅ Perimeter labels
- ✅ Hover effects (brightness, stroke)
- ✅ Click pulse animation
- ✅ Staggered entrance animation (800ms + 100ms delays)

**Data Interface:**
```typescript
export interface EmotionData {
  emotion: string
  value: number  // 0-1 intensity
  color?: string
}
```

**Usage:**
```tsx
import { D3EmotionalRadialChart, type EmotionData } from "./d3-emotional-radial"

const emotions: EmotionData[] = [
  { emotion: "Happy", value: 0.75 },
  { emotion: "Calm", value: 0.6 },
  { emotion: "Fear", value: 0.3 },
  { emotion: "Excited", value: 0.8 },
  // ... up to 8-12 emotions
]

<D3EmotionalRadialChart emotions={emotions} width={400} height={400} />
```

**Emotion Colors (12 emotions):**
- Happy: `#10b981` (Green)
- Joy: `#fbbf24` (Yellow)
- Peace: `#06b6d4` (Cyan)
- Calm: `#3b82f6` (Blue)
- Love: `#ec4899` (Pink)
- Excited: `#f59e0b` (Orange)
- Fear: `#ef4444` (Red)
- Anxiety: `#dc2626` (Dark Red)
- Sad: `#6366f1` (Indigo)
- Angry: `#b91c1c` (Crimson)
- Stress: `#ea580c` (Orange-Red)
- Worry: `#f97316` (Orange)

---

### 3. **D3EmotionalStreamGraph** - Flow Visualization

**File:** `components/dashboard/d3-emotional-stream.tsx` (268 lines)

**Purpose:** Show emotional trends over time as a flowing stream graph.

**Features:**
- ✅ Stack layout with wiggle offset (d3.stackOffsetWiggle)
- ✅ Smooth Bézier curves (d3.curveBasis)
- ✅ Multiple emotion layers
- ✅ Time-based X-axis ("Oct 14" format)
- ✅ Interactive legend with toggle
- ✅ Hover highlight/dim effect
- ✅ Vertical gradient fills
- ✅ Entrance animation (1000ms + 100ms stagger)

**Data Interface:**
```typescript
export interface EmotionTimePoint {
  date: Date
  emotions: Record<string, number>  // emotion name → intensity (0-1)
}
```

**Usage:**
```tsx
import { D3EmotionalStreamGraph, type EmotionTimePoint } from "./d3-emotional-stream"

const data: EmotionTimePoint[] = [
  {
    date: new Date("2025-01-10"),
    emotions: { happy: 0.7, calm: 0.5, fear: 0.2 }
  },
  {
    date: new Date("2025-01-11"),
    emotions: { happy: 0.6, calm: 0.7, fear: 0.3 }
  },
  // ... 5-7 days of data
]

<D3EmotionalStreamGraph data={data} width={600} height={300} />
```

**Legend Interactions:**
- Click emotion name to toggle visibility
- Hover stream to highlight
- Dimmed streams have 0.3 opacity

---

## 🔗 Integration

### Dream Analysis Card Integration

The D3 components are now integrated into `dream-analysis-card.tsx` with a view mode toggle:

**View Modes:**
1. **D3 Timeline** - Interactive swimlane (default)
2. **Radial** - Circular emotion radar
3. **Stream** - Flowing emotional trends
4. **Basic Timeline** - Original custom timeline
5. **Graph** - Line chart with Recharts

**Toggle Implementation:**
```tsx
const [viewMode, setViewMode] = useState<"d3timeline" | "radial" | "stream" | "timeline" | "graph">("d3timeline")

// Data transformation
const d3DreamSegments = useMemo((): D3DreamSegment[] => {
  // Transform Convex dream data → D3 segments
}, [dreamAnalyses])

const emotionRadialData = useMemo((): EmotionData[] => {
  // Aggregate emotions across recent dreams
}, [dreamAnalyses])

const emotionStreamData = useMemo((): EmotionTimePoint[] => {
  // Build time-series emotion data
}, [dreamAnalyses])
```

**Conditional Rendering:**
```tsx
{viewMode === "d3timeline" ? (
  <D3DreamTimeline segments={d3DreamSegments} width={600} height={300} />
) : viewMode === "radial" ? (
  <D3EmotionalRadialChart emotions={emotionRadialData} width={400} height={400} />
) : viewMode === "stream" ? (
  <D3EmotionalStreamGraph data={emotionStreamData} width={600} height={300} />
) : ...}
```

---

## 🎨 Technical Details

### D3 Modules Used

| Module | Purpose | Used In |
|--------|---------|---------|
| **d3-scale** | Time, linear, band scales | All 3 |
| **d3-axis** | X/Y axes with labels | Timeline, Stream |
| **d3-shape** | Arc, area, stack generators | Radial, Stream |
| **d3-selection** | DOM manipulation | All 3 |
| **d3-transition** | Smooth animations | All 3 |
| **d3-time-format** | Date formatting | Timeline, Stream |
| **d3-array** | min, max, extent, mean | Radial, Stream |
| **d3-interpolate** | Curve interpolation | Stream |

### React + D3 Integration Pattern

All components follow this pattern:

```typescript
"use client"
import { useEffect, useRef } from "react"
import * as d3 from "d3"

export function D3Component({ data, width, height }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!svgRef.current || !data) return
    
    const svg = d3.select(svgRef.current)
    const tooltip = d3.select(tooltipRef.current)
    
    // Clear previous render
    svg.selectAll("*").remove()
    
    // Create scales
    const xScale = d3.scaleTime()...
    const yScale = d3.scaleLinear()...
    
    // Draw visualization
    const g = svg.append("g")...
    
    // Add interactivity
    .on("mouseover", function(event, d) {
      tooltip.style("visibility", "visible")...
      d3.select(this).transition().duration(200)...
    })
    .on("mouseout", function() {
      tooltip.style("visibility", "hidden")
      d3.select(this).transition().duration(200)...
    })
    
  }, [data, width, height])
  
  return (
    <div className="relative flex justify-center">
      <svg ref={svgRef} width={width} height={height} />
      <div ref={tooltipRef} className="absolute pointer-events-none..." />
    </div>
  )
}
```

**Key Points:**
- ✅ `useEffect` manages D3 lifecycle (create on mount, update on data change)
- ✅ `useRef` for direct DOM access (SVG, tooltip)
- ✅ `selectAll("*").remove()` clears previous render
- ✅ D3 transitions for smooth animations
- ✅ Tooltip positioned absolutely, hidden by default

---

## 🎬 Animations

### Timeline Animations
- **Hover**: 200ms brightness + stroke width increase
- **Entrance**: Fade-in on mount

### Radial Animations
- **Entrance**: 800ms radial expansion + 100ms stagger per wedge
- **Hover**: Opacity to 1, stroke width to 3
- **Click**: 300ms scale pulse (1.0 → 1.1 → 1.0)

### Stream Animations
- **Entrance**: 1000ms wave effect + 100ms stagger per stream
- **Hover**: Highlight selected (stroke-width: 2), dim others (opacity: 0.3)
- **Toggle**: Smooth opacity transition when hiding/showing streams

---

## 📊 Data Transformation

### From Convex Dream Analysis to D3

**Dream Analysis Schema (Convex):**
```typescript
{
  _id: string
  userId: string
  analysisDate: number
  emotionalTags: string[]
  visualizationData: {
    intensityScore: number  // 0-1
    emotionalWeather: string
    // ...
  }
}
```

**Transform to D3DreamSegment:**
```typescript
const d3DreamSegments = useMemo((): D3DreamSegment[] => {
  const latestDream = dreamAnalyses[0]
  const dreamDate = new Date(latestDream.analysisDate)
  const baseTime = new Date(dreamDate)
  baseTime.setHours(22, 0, 0, 0) // 10 PM start
  
  const segments: D3DreamSegment[] = []
  let currentTime = new Date(baseTime)
  
  // Analyze emotional tags
  const hasLucid = latestDream.emotionalTags.some(tag => 
    tag.includes("excited") || tag.includes("control")
  )
  
  // Build progression
  addSegment("light", 15, undefined, 0.3)
  if (hasLucid) {
    addSegment("lucid", 15, "lucid awareness", 0.95)
  }
  // ... more segments
  
  return segments
}, [dreamAnalyses])
```

**Transform to EmotionData (Radial):**
```typescript
const emotionRadialData = useMemo((): EmotionData[] => {
  const emotionCounts: Record<string, number> = {}
  const emotionIntensities: Record<string, number[]> = {}
  
  // Aggregate across recent dreams
  dreamAnalyses.slice(0, 5).forEach(dream => {
    dream.emotionalTags.forEach(tag => {
      const emotion = tag.toLowerCase()
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1
      if (!emotionIntensities[emotion]) emotionIntensities[emotion] = []
      emotionIntensities[emotion].push(dream.visualizationData.intensityScore)
    })
  })
  
  // Calculate average intensity
  return Object.entries(emotionCounts)
    .map(([emotion, count]) => ({
      emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1),
      value: emotionIntensities[emotion].reduce((a, b) => a + b, 0) / emotionIntensities[emotion].length,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8) // Top 8
}, [dreamAnalyses])
```

**Transform to EmotionTimePoint (Stream):**
```typescript
const emotionStreamData = useMemo((): EmotionTimePoint[] => {
  return dreamAnalyses.slice(0, 7).reverse().map(dream => {
    const emotions: Record<string, number> = {}
    dream.emotionalTags.forEach(tag => {
      emotions[tag.toLowerCase()] = dream.visualizationData.intensityScore
    })
    return {
      date: new Date(dream.analysisDate),
      emotions
    }
  })
}, [dreamAnalyses])
```

---

## 🚀 Usage Examples

### Example 1: Single Dream Timeline

```tsx
import { D3DreamTimeline } from "@/components/dashboard/d3-dream-timeline"

function DreamDetailPage() {
  const segments = [
    { stage: "light", startTime: new Date("2025-01-15T22:00:00"), endTime: new Date("2025-01-15T22:15:00"), intensity: 0.3 },
    { stage: "deep", startTime: new Date("2025-01-15T22:15:00"), endTime: new Date("2025-01-15T22:45:00"), intensity: 0.9 },
    { stage: "rem", startTime: new Date("2025-01-15T22:45:00"), endTime: new Date("2025-01-15T23:10:00"), emotion: "joy", intensity: 0.7 },
    { stage: "lucid", startTime: new Date("2025-01-15T23:10:00"), endTime: new Date("2025-01-15T23:25:00"), emotion: "control", intensity: 0.95 },
    { stage: "rem", startTime: new Date("2025-01-15T23:25:00"), endTime: new Date("2025-01-15T23:55:00"), emotion: "peace", intensity: 0.6 },
    { stage: "light", startTime: new Date("2025-01-15T23:55:00"), endTime: new Date("2025-01-16T00:10:00"), intensity: 0.4 },
    { stage: "awake", startTime: new Date("2025-01-16T00:10:00"), endTime: new Date("2025-01-16T00:20:00"), intensity: 0.1 },
  ]
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Dream Journey</h2>
      <D3DreamTimeline segments={segments} width={800} height={350} />
    </div>
  )
}
```

### Example 2: Emotion Dashboard

```tsx
import { D3EmotionalRadialChart } from "@/components/dashboard/d3-emotional-radial"

function EmotionDashboard() {
  const emotions = [
    { emotion: "Happy", value: 0.82 },
    { emotion: "Calm", value: 0.75 },
    { emotion: "Excited", value: 0.68 },
    { emotion: "Love", value: 0.55 },
    { emotion: "Fear", value: 0.32 },
    { emotion: "Anxiety", value: 0.28 },
    { emotion: "Sad", value: 0.15 },
  ]
  
  return (
    <div className="flex justify-center p-6">
      <D3EmotionalRadialChart emotions={emotions} width={500} height={500} />
    </div>
  )
}
```

### Example 3: Weekly Emotion Trends

```tsx
import { D3EmotionalStreamGraph } from "@/components/dashboard/d3-emotional-stream"

function WeeklyTrends() {
  const data = [
    { date: new Date("2025-01-10"), emotions: { happy: 0.7, calm: 0.5, fear: 0.2, excited: 0.6 } },
    { date: new Date("2025-01-11"), emotions: { happy: 0.6, calm: 0.7, fear: 0.3, excited: 0.5 } },
    { date: new Date("2025-01-12"), emotions: { happy: 0.8, calm: 0.6, fear: 0.1, excited: 0.7 } },
    { date: new Date("2025-01-13"), emotions: { happy: 0.5, calm: 0.4, fear: 0.5, excited: 0.4 } },
    { date: new Date("2025-01-14"), emotions: { happy: 0.7, calm: 0.8, fear: 0.2, excited: 0.6 } },
    { date: new Date("2025-01-15"), emotions: { happy: 0.9, calm: 0.7, fear: 0.1, excited: 0.8 } },
    { date: new Date("2025-01-16"), emotions: { happy: 0.8, calm: 0.9, fear: 0.1, excited: 0.7 } },
  ]
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Your Week in Emotions</h2>
      <D3EmotionalStreamGraph data={data} width={800} height={400} />
    </div>
  )
}
```

---

## ⚠️ Known Issues

### ESLint Warnings

**Issue:** 6 inline style warnings across 3 D3 components

**Files:**
- `d3-dream-timeline.tsx`: Lines 212, 219
- `d3-emotional-radial.tsx`: Lines 246, 253
- `d3-emotional-stream.tsx`: Lines 255, 262

**Warning:**
```
CSS inline styles should not be used, move styles to an external CSS file
```

**Context:**
- SVG: `style={{ maxWidth: "100%" }}`
- Tooltip: `style={{ visibility: "hidden" }}`

**Impact:** ⚠️ Cosmetic only, non-blocking

**Reason:** Dynamic tooltip positioning and SVG responsiveness require inline styles in D3 visualizations.

**Status:** ✅ Acceptable for D3 components

---

## 🎯 Best Practices

### 1. Data Preparation
- ✅ Always transform data in `useMemo` to avoid re-renders
- ✅ Validate data before passing to D3 (check for null/empty)
- ✅ Normalize intensity values to 0-1 range

### 2. Performance
- ✅ Limit data points (Timeline: 10-15 segments, Stream: 5-7 days)
- ✅ Use transitions sparingly (200-300ms ideal)
- ✅ Clear previous render with `selectAll("*").remove()`

### 3. Responsiveness
- ✅ Pass `width` and `height` as props
- ✅ Use responsive container with `max-width: 100%`
- ✅ Test on mobile (consider touch events)

### 4. Accessibility
- ⚠️ TODO: Add ARIA labels to SVG elements
- ⚠️ TODO: Keyboard navigation for tooltips
- ✅ High contrast colors for visibility

---

## 📈 Comparison Matrix

| Feature | D3 Timeline | D3 Radial | D3 Stream | Recharts Line |
|---------|-------------|-----------|-----------|---------------|
| **Complexity** | Medium | High | Very High | Low |
| **Interactivity** | Hover tooltip | Hover + click | Hover + toggle | Hover tooltip |
| **Animation** | 200ms | 800ms entrance | 1000ms wave | Minimal |
| **Best For** | Single dream | Emotion snapshot | Trends over time | Simple metrics |
| **Data Points** | 10-15 segments | 8-12 emotions | 5-7 days | Unlimited |
| **Lines of Code** | 225 | 260 | 268 | ~50 (with config) |
| **D3 Modules** | 4 | 5 | 7 | 0 (uses Recharts) |
| **Learning Curve** | Medium | High | Very High | Low |

---

## 🔮 Future Enhancements

### Phase 1: Polish
- [ ] Add keyboard navigation
- [ ] Improve mobile touch interactions
- [ ] Add ARIA labels for accessibility
- [ ] Create loading skeletons

### Phase 2: Features
- [ ] Export visualizations as PNG/SVG
- [ ] Add zoom/pan for timeline
- [ ] Compare mode (side-by-side dreams)
- [ ] Custom color themes

### Phase 3: Advanced
- [ ] 3D visualizations with Three.js
- [ ] Real-time animation during analysis
- [ ] Voice narration of dream journey
- [ ] VR dream theater mode

---

## 📚 Resources

### D3.js Documentation
- [D3.js Official Site](https://d3js.org/)
- [D3 Observable](https://observablehq.com/@d3)
- [D3 GitHub](https://github.com/d3/d3)

### D3 Modules
- [d3-scale](https://github.com/d3/d3-scale)
- [d3-shape](https://github.com/d3/d3-shape)
- [d3-selection](https://github.com/d3/d3-selection)
- [d3-transition](https://github.com/d3/d3-transition)

### Tutorials
- [Learn D3.js with Curran Kelleher](https://www.youtube.com/c/CurranKelleher)
- [D3 in Depth](https://www.d3indepth.com/)
- [Observable D3 Tutorials](https://observablehq.com/@d3/learn-d3)

---

## ✅ Checklist

**Installation:**
- [x] D3.js v7.9.0 installed
- [x] @types/d3 v7.4.3 installed
- [x] 49 packages added via pnpm

**Components:**
- [x] D3DreamTimeline created (225 lines)
- [x] D3EmotionalRadialChart created (260 lines)
- [x] D3EmotionalStreamGraph created (268 lines)
- [x] TypeScript interfaces exported
- [x] All components compile without errors

**Integration:**
- [x] Imported into dream-analysis-card.tsx
- [x] View mode toggle added (5 modes)
- [x] Data transformation functions created
- [x] Conditional rendering implemented
- [x] No TypeScript errors

**Testing:**
- [ ] Test with real dream data
- [ ] Test hover interactions
- [ ] Test responsive sizing
- [ ] Test dark mode compatibility
- [ ] Test on mobile devices

---

**Status:** ✅ **D3.js Integration Complete**

All three stunning D3 visualizations are ready for dream analysis! 🎨✨
