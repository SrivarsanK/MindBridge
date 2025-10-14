# Dream Timeline Quick Reference

## 🎯 What You Got

A beautiful **timeline visualization** for dream analysis inspired by Apple's sleep tracking UI (SleepChartKit).

## 🚀 Features

### Two View Modes:
1. **Timeline View** - Horizontal bar showing dream stages over time
2. **Graph View** - Line charts showing emotional trends

### Dream Stages:
- 🔵 **Deep Dream** - Restorative, calm dreams
- 🟣 **REM Dream** - Vivid, emotional dreams  
- 🔷 **Light Dream** - Transition stages
- 🟠 **Awake** - Brief awakenings
- 💜 **Lucid Dream** - Self-aware dreaming

## 📱 How to Use

1. **Enter a dream** in the text area
2. **Click "Analyze Dream"** button
3. **Toggle views** using the Timeline/Graph buttons
4. **Hover over segments** to see details

## 🧠 Smart Features

The system automatically:
- Detects emotions (fear, calm, excitement)
- Generates realistic sleep architecture
- Identifies lucid dreaming indicators
- Creates stage timeline from your description

## 🎨 Timeline Visualization

```
10:00 PM        11:00 PM        12:00 AM
   │               │               │
[Light][──Deep──][──REM──][Lucid][Awake]

Legend:
🔵 Deep Dream: 40m
🟣 REM Dream: 25m  
💜 Lucid Dream: 15m
🔷 Light Dream: 25m
🟠 Awake: 10m

Total Duration: 1h 55m
```

## 📂 Files

- `components/dashboard/dream-timeline-chart.tsx` - Timeline component
- `components/dashboard/dream-analysis-card.tsx` - Main card with toggle

## ✅ Status

**WORKING** - No errors, ready to use!

---

**Note**: SleepChartKit is iOS-only, but we built a web version for React/Next.js!
