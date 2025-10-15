# MindBridge Logo Guide

## Logo Files

The following logo files have been created and are available in the `public` folder:

### Main Logo Files
- **`mindbridge-logo-gradient-bg.png`** - Primary logo with full gradient background
  - Best for: All uses, light backgrounds, general use
  - Features: Full gradient background with logo design
  - Format: PNG with high quality rendering
  
- **`mindbridge-logo-gradient-bg-dark.png`** - Dark mode variant with gradient background
  - Best for: Dark backgrounds, dark themes
  - Features: Dark gradient background optimized for visibility
  - Format: PNG with high quality rendering

### Legacy Logo Files (Original versions)
- **`mindbridge-logo.svg`** - Original logo (100x100px) with circular gradient only
- **`mindbridge-logo-dark.svg`** - Original dark mode variant
- **`favicon.svg`** - Simplified favicon version (32x32px)
  - Used as the browser tab icon
  - Optimized for small sizes

## Logo Integration

The logo has been integrated into the following components:

### 1. **Main Layout Header** (`app/layout.tsx`)
- Location: Top navigation bar
- Size: 32px × 32px (h-8 w-8)
- Positioned next to the "MindBridge" text
- Includes hover effect (opacity transition)

### 2. **Navigation Sidebar** (`components/navigation-sidebar.tsx`)
- Location: Top of the sidebar
- Size: Responsive
  - Collapsed: 40px × 40px (h-10 w-10)
  - Expanded: 32px × 32px (h-8 w-8)
- Displayed with "MindBridge" branding text
- Shows/hides based on sidebar collapse state

### 3. **Login Page** (`app/login/page.tsx`)
- Location: Top center of login card
- Size: 64px × 64px (h-16 w-16)
- Centered above the welcome message

### 4. **Onboarding Step 1** (`app/onboarding/step-1/page.tsx`)
- Location: Top center of onboarding card
- Size: 64px × 64px (h-16 w-16)
- Centered above the "Welcome to MindBridge" heading

### 5. **Favicon** (`app/layout.tsx`)
- Location: Browser tab
- File: `favicon.svg`
- Automatically loaded by browsers

## Logo Design Elements

### Visual Components
1. **Profile Silhouette**: Represents the human element and mental health focus (left side of circle)
2. **Flowing Hands/Wings**: Graceful, flowing elements extending from the profile, symbolizing growth, healing, freedom, and transformation
3. **Circular Frame**: Represents completeness, protection, and unity with soft cyan/teal gradient background
4. **Stars**: Two decorative stars adding a touch of hope and inspiration (top-left and bottom-right)

### Color Palette
The logo uses a cyan/teal gradient that aligns with the app's mental wellness theme:
- **Primary**: `#7dd3fc` (Light Sky Blue)
- **Mid**: `#67e8f9` (Cyan)
- **Accent**: `#5eead4` (Teal)

### Dark Mode Colors (Enhanced Brightness)
- **Primary**: `#a5f3fc` (Brighter Cyan)
- **Mid**: `#67e8f9` (Cyan)
- **Accent**: `#7dd3fc` (Light Sky Blue)

## Usage Guidelines

### When to Use Each Version

**Gradient Background Logo (`mindbridge-logo-gradient-bg.png`)**
- Primary choice for all implementations
- PNG format for maximum compatibility
- Automatically switches to dark version based on user's color scheme preference
- Used in: Header, Sidebar, Login, Onboarding pages

**Legacy Logos (Original versions)**
- `mindbridge-logo.svg` - Only use if you specifically need the circular-only version
- `mindbridge-logo-dark.svg` - Only use if you specifically need the dark circular-only version
- These are kept for backward compatibility but not actively used

**Favicon (`favicon.svg`)**
- Automatically used by browsers
- No manual implementation needed
- Simplified version for small display sizes

### Size Recommendations

| Location | Recommended Size | Tailwind Class |
|----------|-----------------|----------------|
| Header | 32px × 32px | `h-8 w-8` |
| Sidebar (expanded) | 32px × 32px | `h-8 w-8` |
| Sidebar (collapsed) | 40px × 40px | `h-10 w-10` |
| Login/Onboarding | 64px × 64px | `h-16 w-16` |
| Large Display | 80px × 80px | `h-20 w-20` |
| Hero Section | 96px × 96px | `h-24 w-24` |

### Implementation Example

```tsx
// Recommended: PNG gradient background with automatic theme detection
<picture className="h-8 w-8">
  <source 
    srcSet="/mindbridge-logo-gradient-bg-dark.png" 
    media="(prefers-color-scheme: dark)" 
  />
  <img 
    src="/mindbridge-logo-gradient-bg.png" 
    alt="MindBridge Logo" 
    className="h-8 w-8 rounded-md"
  />
</picture>

// Legacy usage (not recommended for new implementations)
<img 
  src="/mindbridge-logo.svg" 
  alt="MindBridge Logo" 
  className="h-8 w-8"
/>
```

## Future Enhancements

Consider these potential improvements:

1. **PNG/WebP versions** - For better browser compatibility
2. **Multiple sizes** - Pre-rendered at common sizes (16px, 32px, 64px, 128px, 256px)
3. **Monochrome version** - For print or single-color applications
4. **Social media variants** - Square versions for profile pictures (512px × 512px)
5. **Open Graph image** - For social media sharing (1200px × 630px)

## Brand Consistency

Always maintain these principles when using the logo:

✅ **DO:**
- Use adequate spacing around the logo
- Maintain the aspect ratio (1:1)
- Use on contrasting backgrounds
- Keep the logo crisp and clear

❌ **DON'T:**
- Stretch or distort the logo
- Change the colors (unless creating approved variants)
- Add effects like shadows or outlines
- Place on busy or cluttered backgrounds
- Use at sizes smaller than 16px × 16px

## Questions or Issues?

If you need additional logo variants or have questions about usage, please refer to the design team or update this guide accordingly.

---

**Last Updated**: January 2025
**Version**: 1.0
