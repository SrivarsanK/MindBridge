# Translation Testing Guide

## 🎯 Overview
This guide provides comprehensive instructions for testing the multilingual translation system across all 6 supported languages in the MindBridge application.

## 📋 Supported Languages

| Language Code | Language Name | Script Type | Status |
|--------------|---------------|-------------|--------|
| `en-IN` | English (India) | Latin | ✅ Complete |
| `hi-IN` | Hindi (हिन्दी) | Devanagari | ✅ Complete |
| `bn-IN` | Bengali (বাংলা) | Bengali | ✅ Complete |
| `ta-IN` | Tamil (தமிழ்) | Tamil | ✅ Complete |
| `te-IN` | Telugu (తెలుగు) | Telugu | ✅ Complete |
| `mr-IN` | Marathi (मराठी) | Devanagari | ✅ Complete |

**Total Translation Keys per Language**: 279 keys

---

## 🚀 Quick Start Testing

### 1. Start Development Server
```powershell
# Make sure you're in the project directory
cd C:\Users\Arunavo\Desktop\Hackelite\MindBridge

# Start the dev server
npm run dev
```

The server should start on `http://localhost:3004` (or next available port).

### 2. Access Language Switcher
The language switcher is available in the **Navigation Sidebar** on all pages:
- Look for the language dropdown in the left sidebar
- Currently displays current language (e.g., "English")
- Click to open language selection menu

---

## 🧪 Testing Checklist

### **Page 1: Peer Search (`/peer-search`)**

#### English Testing
- [ ] Page title: "Find a Peer"
- [ ] Subtitle: "Connect anonymously with peers who understand"
- [ ] Online counter: "X online" displays correctly
- [ ] Back button: "← Back to Dashboard"
- [ ] Community status card visible
- [ ] Privacy notice card visible
- [ ] Mood selection section:
  - [ ] Title: "How are you feeling?"
  - [ ] All 6 mood options visible (Calm, Anxious, Low, Lonely, Neutral, Stressed)
- [ ] Connection need slider:
  - [ ] Label: "Need for connection"
  - [ ] Left label: "Just browsing"
  - [ ] Right label: "Need to talk now"
- [ ] Interests section:
  - [ ] Title: "Your Interests"
  - [ ] Search placeholder: "Search interests..."
  - [ ] Show/Hide filters button works
  - [ ] Interest tags display (Academic, Social, etc.)
- [ ] Search button: "Find a Peer Connection" / "Searching for peers..."
- [ ] Active matches section:
  - [ ] "Anonymous Peer" label
  - [ ] "% match" badge
  - [ ] "X messages" count
- [ ] Matching tips sidebar (3 tips visible)

#### Switch to Hindi (हिन्दी)
- [ ] Change language to Hindi using switcher
- [ ] Verify page reloads/updates
- [ ] Check all above sections in Hindi script
- [ ] Key translations to verify:
  - [ ] "साथी खोजें" (Find a Peer)
  - [ ] "गुमनाम साथी" (Anonymous Peer)
  - [ ] "खोज" button (Search)
  - [ ] "दिखाएं/छुपाएं" (Show/Hide)

#### Switch to Bengali (বাংলা)
- [ ] Change language to Bengali
- [ ] Verify Bengali script renders correctly
- [ ] Key translations to verify:
  - [ ] "সঙ্গী খুঁজুন" (Find a Peer)
  - [ ] "বেনামী সঙ্গী" (Anonymous Peer)
  - [ ] "অনুসন্ধান" (Search)

#### Switch to Tamil (தமிழ்)
- [ ] Change language to Tamil
- [ ] Verify Tamil script renders correctly
- [ ] Key translations to verify:
  - [ ] "சகர்களைக் கண்டறியவும்" (Find a Peer)
  - [ ] "அநாமதேய சக" (Anonymous Peer)
  - [ ] "தேடல்" (Search)

#### Switch to Telugu (తెలుగు)
- [ ] Change language to Telugu
- [ ] Verify Telugu script renders correctly
- [ ] Key translations to verify:
  - [ ] "తోటివారిని కనుగొనండి" (Find a Peer)
  - [ ] "అజ్ఞాత తోటి" (Anonymous Peer)
  - [ ] "శోధన" (Search)

#### Switch to Marathi (मराठी)
- [ ] Change language to Marathi
- [ ] Verify Marathi script renders correctly
- [ ] Key translations to verify:
  - [ ] "सहकारी शोधा" (Find a Peer)
  - [ ] "निनावी सहकारी" (Anonymous Peer)
  - [ ] "शोध" (Search)

---

### **Page 2: Settings (`/settings`)**

#### English Testing
- [ ] Page title: "Settings"
- [ ] Subtitle: "Manage your privacy and preferences"
- [ ] Loading state: "Loading your settings..."
- [ ] **Account Information Card**:
  - [ ] Card title: "Account Information"
  - [ ] Description: "Your account details and status"
  - [ ] Account Type label & value (Anonymous/Registered)
  - [ ] Account Status label & value
  - [ ] Role label & value
  - [ ] Timezone label & value
- [ ] **Privacy Settings Card**:
  - [ ] "Privacy Settings" title
  - [ ] "Control how your data is used" description
  - [ ] 3 toggle switches:
    - [ ] "Enable Peer Matching"
    - [ ] "Share Anonymous Analytics"
    - [ ] "Allow AI Dream Analysis"
  - [ ] Each toggle has helper text
- [ ] **Data Retention Card**:
  - [ ] "Data Retention" title
  - [ ] "Control how long we keep your data" description
  - [ ] Slider with 5 options (7, 30, 90, 180, 365 days)
  - [ ] Current selection displayed above slider
  - [ ] Info note about encryption
- [ ] **Data Management Card**:
  - [ ] "Data Management" title
  - [ ] Two buttons: "Export My Data", "Delete All My Data"
  - [ ] Confirmation dialog for delete
- [ ] **Action Buttons**:
  - [ ] "Save Changes" button
  - [ ] "Reset to Defaults" button
  - [ ] "Back to Dashboard" button
- [ ] **Privacy Notice Footer**:
  - [ ] Notice text about privacy-first approach

#### Hindi Testing (हिन्दी)
- [ ] Switch to Hindi
- [ ] Verify all section titles in Hindi
- [ ] Key Account Information translations:
  - [ ] "खाता जानकारी" (Account Information)
  - [ ] "खाता प्रकार" (Account Type)
  - [ ] "गुमनाम" (Anonymous)
  - [ ] "पंजीकृत" (Registered)
  - [ ] "भूमिका" (Role)
  - [ ] "समयक्षेत्र" (Timezone)
- [ ] Privacy Settings translations visible
- [ ] Data Retention slider labels in Hindi
- [ ] All buttons translated

#### Bengali Testing (বাংলা)
- [ ] Switch to Bengali
- [ ] Account Information translations:
  - [ ] "অ্যাকাউন্ট তথ্য" (Account Information)
  - [ ] "অ্যাকাউন্ট প্রকার" (Account Type)
  - [ ] "বেনামী" (Anonymous)
  - [ ] "নিবন্ধিত" (Registered)
- [ ] All sections render in Bengali script
- [ ] No missing translations (no English fallbacks)

#### Tamil Testing (தமிழ்)
- [ ] Switch to Tamil
- [ ] Account Information translations:
  - [ ] "கணக்கு தகவல்" (Account Information)
  - [ ] "கணக்கு வகை" (Account Type)
  - [ ] "அநாமதேயம்" (Anonymous)
  - [ ] "பதிவு செய்யப்பட்டது" (Registered)
- [ ] Tamil script renders correctly across all sections

#### Telugu Testing (తెలుగు)
- [ ] Switch to Telugu
- [ ] Account Information translations:
  - [ ] "ఖాతా సమాచారం" (Account Information)
  - [ ] "ఖాతా రకం" (Account Type)
  - [ ] "అజ్ఞాతం" (Anonymous)
  - [ ] "నమోదు చేయబడింది" (Registered)
- [ ] All Telugu characters display correctly

#### Marathi Testing (मराठी)
- [ ] Switch to Marathi
- [ ] Account Information translations:
  - [ ] "खाते माहिती" (Account Information)
  - [ ] "खाते प्रकार" (Account Type)
  - [ ] "निनावी" (Anonymous)
  - [ ] "नोंदणीकृत" (Registered)
- [ ] Marathi script renders correctly

---

### **Page 3: Dashboard (`/dashboard`)**

#### Basic Navigation Testing
- [ ] Switch between all 6 languages on dashboard
- [ ] Verify sidebar navigation links translate:
  - [ ] Dashboard / डैशबोर्ड / ড্যাশবোর্ড / டாஷ்போர்டு / డాష్‌బోర్డ్ / डॅशबोर्ड
  - [ ] Find Peers / साथी खोजें / সঙ্গী খুঁজুন / சகர்களைக் கண்டறியவும் / తోటివారిని కనుగొనండి / सहकारी शोधा
  - [ ] Settings / सेटिंग्स / সেটিংস / அமைப்புகள் / సెట్టింగ్‌లు / सेटिंग्ज
- [ ] Verify dashboard cards translate correctly:
  - [ ] AI Companion
  - [ ] Dream Analysis
  - [ ] Daily Check-in
  - [ ] Quick Relief
  - [ ] Personal Insights

---

## 🔍 Detailed Test Scenarios

### Scenario 1: Language Persistence
**Test**: Does the selected language persist across page navigation?

1. Start on Dashboard in English
2. Switch to Hindi
3. Navigate to Peer Search
4. **Expected**: Page loads in Hindi
5. Navigate to Settings
6. **Expected**: Page loads in Hindi
7. Refresh page
8. **Expected**: Hindi language is retained

**Result**: ✅ Pass / ❌ Fail

---

### Scenario 2: Text Overflow Handling
**Test**: Do longer translations fit within UI components?

Some languages (especially Hindi, Bengali, Tamil) may have longer words than English.

**Check**:
- [ ] Card titles don't overflow
- [ ] Button text fits within buttons
- [ ] Modal headers don't wrap awkwardly
- [ ] Tooltips display correctly
- [ ] Sidebar navigation items don't overflow

**Problematic Areas to Watch**:
- Settings page: "Your account details and status" (long subtitle)
- Peer Search: "Find a Peer Connection" button
- Account Information card labels

---

### Scenario 3: Special Character Rendering
**Test**: Do special characters and diacritics render correctly?

**For Devanagari (Hindi, Marathi)**:
- [ ] Matras (vowel marks) display correctly: े, ी, ु, ू, ो, ौ
- [ ] Conjuncts render properly: क्त, ट्ट, स्त
- [ ] Halant (्) works correctly

**For Bengali**:
- [ ] Bengali characters: ক, খ, গ, ঘ, ঙ
- [ ] Vowel marks: া, ি, ী, ু, ূ
- [ ] Conjuncts display correctly

**For Tamil**:
- [ ] Tamil characters: க, ங, ச, ஞ, ட
- [ ] Vowel marks: ா, ி, ீ, ு, ூ
- [ ] Combined characters render properly

**For Telugu**:
- [ ] Telugu characters: క, ఖ, గ, ఘ, ఙ
- [ ] Vowel marks: ా, ి, ీ, ు, ూ
- [ ] Conjuncts display correctly

---

### Scenario 4: Dynamic Content Translation
**Test**: Does dynamic content translate correctly?

**Dynamic Elements to Test**:
1. **Online User Count** (Peer Search):
   - Format: "X online" → "X ऑनलाइन" (Hindi)
   - Check if number + translation displays correctly

2. **Match Percentage** (Active Matches):
   - Format: "85% match" → "85% मेल" (Hindi)
   - Verify percentage symbol and translation

3. **Message Count**:
   - Format: "5 messages" → "5 संदेश" (Hindi)
   - Check plural forms if applicable

4. **Account Status** (Settings):
   - Conditional: "Anonymous" OR "Registered"
   - Verify both conditions translate correctly

---

### Scenario 5: Mobile Responsiveness
**Test**: Do translations work correctly on mobile screens?

**Test on Chrome DevTools Mobile Emulation**:
1. Open DevTools (F12)
2. Click device toolbar (Ctrl+Shift+M)
3. Select "iPhone 12 Pro" or similar

**Check**:
- [ ] Language switcher accessible on mobile
- [ ] Navigation sidebar collapses/expands correctly
- [ ] Long translations don't break mobile layout
- [ ] Buttons remain tappable
- [ ] Cards stack properly on small screens

---

## 🐛 Common Issues & Troubleshooting

### Issue 1: Translation Not Showing (English Fallback)
**Symptom**: UI shows English text even after switching language

**Possible Causes**:
1. Translation key missing from language dictionary
2. Component not using `t()` function
3. Hardcoded string not replaced

**Debug Steps**:
```powershell
# Check browser console for warnings
# Look for: "Missing translation for key: {key_name}"

# Verify translation key exists in locale-provider.tsx
# Search for the English text to find the key name
```

**Solution**: Add missing key to all language dictionaries

---

### Issue 2: Broken Characters / Question Marks
**Symptom**: Characters display as ��� or boxes

**Possible Causes**:
1. Font doesn't support the script
2. Character encoding issue
3. Browser rendering issue

**Solution**:
```css
/* Add font support in globals.css */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu&display=swap');
```

---

### Issue 3: Language Doesn't Persist
**Symptom**: Language resets to English on page refresh

**Possible Causes**:
1. LocalStorage not saving preference
2. Cookie not being set
3. State management issue

**Debug Steps**:
```javascript
// Check localStorage in browser console
localStorage.getItem('preferredLanguage')

// Should return: "hi-IN", "bn-IN", etc.
```

---

### Issue 4: Text Overflow
**Symptom**: Text cuts off or breaks layout

**Examples**:
- "आपका खाता विवरण और स्थिति" (Hindi) is longer than "Your account details and status"
- Button text wraps to multiple lines

**Solutions**:
```css
/* Add to component styles */
.overflow-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Or allow wrapping with max width */
.wrap-text {
  max-width: 300px;
  word-wrap: break-word;
}
```

---

## 📊 Test Results Template

Use this template to document your testing:

```markdown
## Translation Test Results - [Date]

**Tester**: [Your Name]
**Browser**: Chrome 120.0 / Firefox 121.0
**Device**: Desktop / Mobile (specify)

### English (en-IN)
- Peer Search: ✅ Pass
- Settings: ✅ Pass
- Dashboard: ✅ Pass
- Issues: None

### Hindi (hi-IN)
- Peer Search: ✅ Pass
- Settings: ✅ Pass
- Dashboard: ✅ Pass
- Issues: None

### Bengali (bn-IN)
- Peer Search: ⚠️ Partial - Text overflow on "Account Information" card
- Settings: ✅ Pass
- Dashboard: ✅ Pass
- Issues: Need to increase card width for Bengali script

[Continue for all languages...]

### Summary
- Total Tests: 18 (3 pages × 6 languages)
- Passed: 17
- Failed: 1 (Bengali text overflow)
- Pending: 0

### Recommendations
1. Increase card title width by 20px for Bengali
2. Add font fallback for Telugu on Windows
3. Test on Safari browser next
```

---

## 🎯 Acceptance Criteria

Translation system is considered **fully tested and ready** when:

✅ All 6 languages display correctly on all 3 pages  
✅ No English fallbacks appear (all keys translated)  
✅ Special characters render correctly in all scripts  
✅ Text fits within UI components (no overflow)  
✅ Language preference persists across sessions  
✅ Mobile responsive design works for all languages  
✅ Dynamic content translates correctly  
✅ No console errors or warnings  
✅ Browser compatibility verified (Chrome, Firefox, Edge)  
✅ Performance is acceptable (< 200ms language switch)  

---

## 📝 Additional Notes

### Terminal Logs to Monitor
When testing, watch the terminal for translation logs:
```
Current locale: hi-IN Dictionary keys: 279
Translating "find_peer_title" in hi-IN: साथी खोजें
Translating "account_information" in hi-IN: खाता जानकारी
```

This confirms:
- ✅ Language is being loaded correctly
- ✅ Dictionary has all 279 keys
- ✅ Translation function is working

### Browser Console Warnings
If you see warnings like:
```
Warning: Missing translation for "some_key" in hi-IN, falling back to en-IN
```

**Action Required**: Add the missing key to the Hindi dictionary in `locale-provider.tsx`.

---

## 🚦 Next Steps After Testing

Once all tests pass:

1. **Document Results**: Fill out test results template
2. **Report Issues**: Create GitHub issues for any bugs found
3. **Update Docs**: Update README with testing results
4. **Performance Testing**: Measure language switch performance
5. **A/B Testing**: Consider user testing with native speakers
6. **Accessibility Testing**: Test with screen readers in different languages

---

## 👥 Need Help?

If you encounter issues during testing:

1. Check the `PEER_SETTINGS_IMPLEMENTATION.md` for technical details
2. Review `locale-provider.tsx` for translation key structure
3. Check browser console for error messages
4. Verify translation keys match between pages and provider
5. Test in incognito mode to rule out cache issues

---

**Last Updated**: October 12, 2025  
**Version**: 1.0  
**Maintainer**: Development Team  
**Translation Keys**: 279 per language  
**Total Translations**: 1,674 (279 × 6 languages)
