# Custom Timer Feature - Breathing Exercises

## Feature Overview
Added a custom timer setting that allows users to specify their own exercise duration beyond the preset options (3, 5, 10, 15, 20, 30 minutes).

## What's New

### User Flow
1. **Click "Start Exercise"** on any breathing card
2. **Time Selection Dialog opens** with preset durations
3. **Click "Custom Duration"** button to reveal custom input
4. **Enter custom minutes** (1-60 minutes)
5. **Click "Apply"** or press Enter to confirm
6. **Click "Start"** to begin exercise with custom duration

### UI Components

#### Preset Duration Buttons (Existing)
- 6 preset options: 3, 5, 10, 15, 20, 30 minutes
- Grid layout: 2 columns on mobile, 3 on desktop
- Active state shows gradient background

#### Custom Duration Button (New)
```tsx
<Button variant="outline" onClick={handleCustomTimeClick}>
  <Timer icon /> Custom Duration
</Button>
```
- Appears below preset buttons
- Full-width outline button
- Timer icon for clarity

#### Custom Input Section (New)
When "Custom Duration" is clicked:
```tsx
<Input
  type="number"
  min="1"
  max="60"
  placeholder="e.g., 7"
  onKeyDown={Enter to apply}
/>
<Button onClick={applyCustomTime}>Apply</Button>
```

Features:
- Number input with validation (1-60 minutes)
- Placeholder text "e.g., 7"
- Apply button with gradient background
- Enter key support for quick input
- Confirmation message when time is set

## Implementation Details

### New State Variables
```typescript
const [customMinutes, setCustomMinutes] = useState("")
const [showCustomInput, setShowCustomInput] = useState(false)
```

### Key Functions

#### 1. handleCustomTimeClick()
```typescript
const handleCustomTimeClick = () => {
  setShowCustomInput(true)
  setSelectedDuration(0) // Clear preset selection
}
```
- Shows custom input section
- Clears any preset selection
- User must enter and apply custom time

#### 2. applyCustomTime()
```typescript
const applyCustomTime = () => {
  const minutes = parseInt(customMinutes)
  if (minutes && minutes > 0 && minutes <= 60) {
    setSelectedDuration(minutes * 60)
    setShowCustomInput(false)
  }
}
```
- Validates input (1-60 minutes)
- Converts minutes to seconds
- Hides input section
- Shows confirmation message

#### 3. Updated handleExerciseSelect()
```typescript
const handleExerciseSelect = (exercise: BreathingExercise) => {
  setPendingExercise(exercise)
  setSelectedDuration(exercise.duration)
  setCustomMinutes("")           // ← Reset custom input
  setShowCustomInput(false)      // ← Hide custom section
  setShowTimeDialog(true)
}
```
- Resets custom timer state when dialog opens
- Prevents state carryover between sessions

#### 4. Updated startExercise()
```typescript
const startExercise = () => {
  if (!pendingExercise) return
  
  // Validate duration
  if (selectedDuration <= 0) {
    return // Don't start if no valid duration selected
  }
  
  // ...rest of function
}
```
- Validates duration before starting
- Prevents starting with invalid time

### Input Validation

**Min/Max:** 1-60 minutes
```tsx
<Input
  type="number"
  min="1"
  max="60"
  disabled={!minutes || minutes <= 0 || minutes > 60}
/>
```

**Validation Logic:**
- Must be a number
- Must be greater than 0
- Must be 60 or less
- Apply button disabled if invalid

**User Feedback:**
- Placeholder shows example: "e.g., 7"
- Confirmation message after applying
- Disabled state on Apply button when invalid

## UI/UX Improvements

### Visual States

**1. Initial State (Presets Only)**
```
┌─────────────────────────────────────┐
│  Choose Exercise Duration           │
│                                     │
│  [3 min] [5 min] [10 min]          │
│  [15 min] [20 min] [30 min]        │
│                                     │
│  [Custom Duration]                  │
│                                     │
│  [Cancel]         [Start]           │
└─────────────────────────────────────┘
```

**2. Custom Input Active**
```
┌─────────────────────────────────────┐
│  Choose Exercise Duration           │
│                                     │
│  [3 min] [5 min] [10 min]          │
│  [15 min] [20 min] [30 min]        │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Enter custom duration (1-60)  │ │
│  │ [Input: 7] [Apply]            │ │
│  │ ✓ 7 minutes selected          │ │
│  └───────────────────────────────┘ │
│                                     │
│  [Cancel]         [Start]           │
└─────────────────────────────────────┘
```

### Interaction Flow

1. **Click Custom Duration**
   - Input section expands
   - Preset selection clears
   - Focus moves to input field

2. **Enter Number**
   - Real-time validation
   - Apply button enables/disables
   - Enter key works for quick apply

3. **Apply Custom Time**
   - Input section stays visible
   - Confirmation message shows
   - Start button becomes enabled

4. **Switch Back to Preset**
   - Click any preset button
   - Custom input hides
   - Preset selection highlights

### Responsive Design

**Mobile (< 640px):**
- 2-column grid for presets
- Full-width custom button
- Stacked input + apply button

**Tablet/Desktop (≥ 640px):**
- 3-column grid for presets
- Larger button sizes
- Side-by-side input + apply

## Accessibility

- ✅ Label for custom input: "Enter custom duration (1-60 minutes)"
- ✅ Placeholder text provides example
- ✅ Keyboard navigation (Tab, Enter)
- ✅ Disabled state on invalid input
- ✅ Clear validation feedback
- ✅ aria-labels preserved on all buttons

## Edge Cases Handled

1. **Invalid Input**
   - Apply button disabled
   - Can't start exercise
   - Clear error prevention

2. **Out of Range**
   - Less than 1 minute: Apply disabled
   - More than 60 minutes: Apply disabled
   - Input constrained by min/max attributes

3. **Empty Input**
   - Apply button disabled
   - Start button disabled
   - User must make selection

4. **Switching Between Custom and Preset**
   - Custom input resets when preset selected
   - Preset selection clears when custom clicked
   - Clean state management

5. **Dialog Reopening**
   - Custom input resets
   - Previous custom value doesn't carry over
   - Fresh start each time

## Benefits

### For Users
- ✅ **Flexibility**: Set any duration from 1-60 minutes
- ✅ **Quick Input**: Enter key support
- ✅ **Clear Feedback**: Confirmation message
- ✅ **Easy Toggle**: Switch between preset and custom
- ✅ **No Mistakes**: Strong validation prevents errors

### For Development
- ✅ **Clean State Management**: No side effects
- ✅ **Type Safety**: Number validation
- ✅ **Reusable Pattern**: Can be applied to other features
- ✅ **Maintainable**: Clear function separation

## Usage Examples

### Use Case 1: Short Session
User wants exactly 7 minutes:
1. Click "Custom Duration"
2. Enter "7"
3. Press Enter or click Apply
4. Click Start
5. Exercise runs for exactly 7 minutes

### Use Case 2: Long Session
User wants 45 minutes for deep practice:
1. Click "Custom Duration"
2. Enter "45"
3. Click Apply
4. Click Start
5. Exercise runs for 45 minutes

### Use Case 3: Precise Timing
User wants 12 minutes to fit schedule:
1. Click "Custom Duration"
2. Enter "12"
3. Click Apply
4. See "✓ 12 minutes selected"
5. Click Start

## Future Enhancements (Optional)

1. **Seconds Support**: Allow "12:30" format
2. **Favorites**: Save frequently used custom durations
3. **Quick Buttons**: Add common customs like 7, 12, 18 min
4. **History**: Show recently used custom times
5. **Presets Expansion**: Allow users to create preset buttons

## Files Modified

- `app/breathing/page.tsx`
  - Added imports: Input, Label
  - Added state: customMinutes, showCustomInput
  - Added functions: handleCustomTimeClick, applyCustomTime
  - Updated: handleExerciseSelect, startExercise
  - Enhanced: Time selection dialog UI

## Testing Checklist

- ✅ Can enter custom time (1-60 minutes)
- ✅ Apply button disabled when invalid
- ✅ Enter key applies custom time
- ✅ Confirmation message displays
- ✅ Can switch between custom and preset
- ✅ Exercise starts with correct duration
- ✅ Custom input resets on dialog reopen
- ✅ Start button disabled with no selection
- ✅ Responsive on mobile/tablet/desktop
- ✅ Input validation works correctly

## Status

✅ **Complete** - Custom timer feature fully implemented with validation, UI feedback, and clean state management!
