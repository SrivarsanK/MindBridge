# Migration Checklist: Server Storage → Local Storage

## 🎯 Goal
Migrate **Sleep Tracking** and **AI Companion** data from Convex (server) to IndexedDB (client)

## ✅ Phase 1: Setup (COMPLETED)

- [x] Create `lib/local-storage.ts` - Core IndexedDB layer
- [x] Create `lib/use-local-storage.ts` - React hooks
- [x] Create example components
- [x] Create documentation
- [x] Verify all files compile without errors

## 📋 Phase 2: Integration (TODO)

### Step 1: Initialize Database

**File:** `app/layout.tsx`

```tsx
import { useEffect } from 'react'
import { initDB } from '@/lib/local-storage'

export default function RootLayout({ children }) {
  useEffect(() => {
    // Initialize IndexedDB when app loads
    initDB()
      .then(() => console.log('✅ Local storage initialized'))
      .catch(err => console.error('❌ Failed to initialize storage:', err))
  }, [])

  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
```

### Step 2: Update AI Companion Component

**Find:** Component that handles AI chat (likely in `app/ai-companion` or similar)

**Replace Convex calls with local storage:**

```tsx
// BEFORE (using Convex)
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'

const sendMessage = useMutation(api.messages.send)
await sendMessage({ content: userInput })

// AFTER (using IndexedDB)
import { useAIConversation } from '@/lib/use-local-storage'

const { addMessage } = useAIConversation('session-id')
await addMessage({
  id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  role: 'user',
  content: userInput,
  timestamp: Date.now()
})
```

**Files to update:**
- [ ] Find AI companion chat component
- [ ] Replace `useMutation(api.messages.send)` with `useAIConversation`
- [ ] Replace `useQuery(api.messages.list)` with conversation.messages
- [ ] Test: Send message, verify it saves locally
- [ ] Test: Refresh page, verify messages persist

### Step 3: Update Sleep Tracker Component

**Find:** Component that handles sleep logging (likely in `app/sleep-tracker` or dashboard)

**Replace Convex calls with local storage:**

```tsx
// BEFORE (using Convex)
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'

const createSleep = useMutation(api.sleep.create)
await createSleep({ date, bedtime, wakeTime, quality })

// AFTER (using IndexedDB)
import { useSleepTracking } from '@/lib/use-local-storage'

const { saveSleepEntry } = useSleepTracking(30)
await saveSleepEntry({
  id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  date,
  bedtime,
  wakeTime,
  duration: calculateDuration(bedtime, wakeTime),
  quality,
  createdAt: Date.now()
})
```

**Files to update:**
- [ ] Find sleep tracker component
- [ ] Replace `useMutation(api.sleep.create)` with `useSleepTracking`
- [ ] Replace `useQuery(api.sleep.list)` with sleepEntries
- [ ] Update sleep stats to use `getStats()`
- [ ] Test: Add sleep entry, verify it saves locally
- [ ] Test: View statistics, verify calculations work

### Step 4: Add Privacy Controls in Settings

**File:** `app/settings/page.tsx` (or wherever settings are)

```tsx
import { exportAllData, clearAllLocalData, getStorageInfo } from '@/lib/local-storage'
import { useState } from 'react'

export default function SettingsPage() {
  const [storageInfo, setStorageInfo] = useState(null)

  const handleExportData = async () => {
    const jsonData = await exportAllData()
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `mindbridge-data-${new Date().toISOString()}.json`
    a.click()
  }

  const handleClearData = async () => {
    if (confirm('Delete all local data? This cannot be undone.')) {
      await clearAllLocalData()
      alert('All data deleted successfully')
    }
  }

  const handleCheckStorage = async () => {
    const info = await getStorageInfo()
    setStorageInfo(info)
  }

  return (
    <div>
      <h2>Data Privacy</h2>
      <p>All data is stored locally on your device</p>
      
      <Button onClick={handleCheckStorage}>
        Check Storage Usage
      </Button>
      
      {storageInfo && (
        <div>
          <p>Conversations: {storageInfo.conversationsCount}</p>
          <p>Sleep Entries: {storageInfo.sleepEntriesCount}</p>
          <p>Size: {storageInfo.estimatedSize}</p>
        </div>
      )}
      
      <Button onClick={handleExportData}>
        📥 Download My Data
      </Button>
      
      <Button onClick={handleClearData} variant="destructive">
        🗑️ Delete All Local Data
      </Button>
    </div>
  )
}
```

**Tasks:**
- [ ] Add storage info display
- [ ] Add export data button
- [ ] Add clear data button
- [ ] Test: Export data as JSON
- [ ] Test: Clear all data

## 🧪 Phase 3: Testing

### Browser Testing
- [ ] Chrome - Initialize DB
- [ ] Chrome - Save AI conversation
- [ ] Chrome - Save sleep entry
- [ ] Chrome - Close browser, reopen, verify data persists
- [ ] Firefox - Same tests
- [ ] Safari - Same tests
- [ ] Mobile Chrome - Same tests
- [ ] Mobile Safari - Same tests

### Functionality Testing
- [ ] AI Companion works offline
- [ ] Sleep Tracker works offline
- [ ] Data persists after page refresh
- [ ] Multiple conversations can be saved
- [ ] Sleep statistics calculate correctly
- [ ] Export data downloads JSON file
- [ ] Clear data removes everything
- [ ] Storage info shows correct counts

### Edge Cases
- [ ] What happens if IndexedDB is disabled?
- [ ] What happens if storage is full?
- [ ] What happens on private/incognito mode?
- [ ] Can user have multiple browser tabs open?

## 📊 Phase 4: Monitoring

### Success Metrics
- [ ] Zero server calls for AI messages
- [ ] Zero server calls for sleep entries
- [ ] Page load time improved (no network requests)
- [ ] Works offline
- [ ] Data persists across sessions

### Error Handling
- [ ] Show user-friendly error if IndexedDB fails
- [ ] Fallback to memory storage if needed
- [ ] Log errors for debugging
- [ ] Add retry mechanism for transient failures

## 🚀 Phase 5: Optimization

### Performance
- [ ] Implement batch operations for multiple saves
- [ ] Add lazy loading for old conversations
- [ ] Add pagination for sleep entries
- [ ] Optimize database indexes

### Cleanup
- [ ] Remove unused Convex functions (api.messages.send, api.sleep.create)
- [ ] Remove server-side database tables (if fully migrated)
- [ ] Update API documentation
- [ ] Remove Convex dependencies (if no longer needed)

### Enhancement (Optional)
- [ ] Add encryption for sensitive messages
- [ ] Add data compression for large conversations
- [ ] Add automatic cleanup (delete old data)
- [ ] Add cloud sync (opt-in feature)

## 📝 Notes

### What Stays on Server (Convex)
- ✅ User authentication (Clerk)
- ✅ User profiles (basic info)
- ✅ Peer matching data
- ✅ Peer chat messages (between users)
- ✅ Analytics (aggregated, anonymous)

### What Moves to Client (IndexedDB)
- ✅ AI companion conversations
- ✅ Sleep tracking entries
- ✅ Mood history
- ✅ Personal preferences
- ✅ Dream journal entries (if applicable)

### Benefits Summary
1. **Privacy**: Sensitive data never leaves device
2. **Performance**: Instant access, no network latency
3. **Cost**: Reduced server storage costs
4. **Reliability**: Works offline
5. **Compliance**: GDPR-ready with data export

## 🎉 Completion Criteria

Migration is complete when:
- [x] Local storage code implemented
- [ ] AI Companion uses IndexedDB
- [ ] Sleep Tracker uses IndexedDB
- [ ] Settings has privacy controls
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Team trained on new system

## 🆘 Troubleshooting

### "IndexedDB not available"
```tsx
if (!window.indexedDB) {
  console.error('IndexedDB not supported')
  // Fallback to memory storage or show error
}
```

### "QuotaExceededError"
```tsx
try {
  await saveSleepEntry(entry)
} catch (err) {
  if (err.name === 'QuotaExceededError') {
    alert('Storage full. Please delete old entries.')
  }
}
```

### Data not persisting
- Check browser settings (cookies/storage not blocked)
- Check private/incognito mode (data cleared on close)
- Check browser compatibility
- Check console for errors

---

**Status:** ✅ Setup Complete | 🔄 Integration Pending | ⏳ Testing Pending
