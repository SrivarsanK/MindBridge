# Local Storage Quick Reference

## 🚀 Quick Start

### 1. Import What You Need

```tsx
// For AI Companion
import { useAIConversation } from '@/lib/use-local-storage'

// For Sleep Tracking
import { useSleepTracking } from '@/lib/use-local-storage'

// For direct storage access
import { aiStorage, sleepStorage } from '@/lib/local-storage'
```

### 2. Use in Component

```tsx
function MyComponent() {
  // AI Companion
  const { conversation, addMessage } = useAIConversation('session-1')
  
  // Sleep Tracking
  const { sleepEntries, saveSleepEntry } = useSleepTracking(30)
  
  // Use them...
}
```

## 📚 Common Operations

### AI Companion

```tsx
// Save a message
await addMessage({
  id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  role: 'user', // or 'assistant'
  content: 'Hello!',
  timestamp: Date.now()
})

// Access messages
conversation?.messages.map(msg => (
  <div key={msg.id}>{msg.content}</div>
))
```

### Sleep Tracking

```tsx
// Save sleep entry
await saveSleepEntry({
  id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  date: '2025-10-14',
  bedtime: '23:00',
  wakeTime: '07:00',
  duration: 8,
  quality: 4, // 1-5
  notes: 'Slept well',
  createdAt: Date.now()
})

// Get statistics
const stats = await getStats(30) // Last 30 days
// {
//   averageDuration: 7.5,
//   averageQuality: 4.2,
//   totalEntries: 25
// }
```

### Privacy Controls

```tsx
import { exportAllData, clearAllLocalData, getStorageInfo } from '@/lib/local-storage'

// Export user data (GDPR)
const json = await exportAllData()

// Clear all data
await clearAllLocalData()

// Check storage
const info = await getStorageInfo()
// {
//   conversationsCount: 15,
//   sleepEntriesCount: 30,
//   estimatedSize: "2.34 MB"
// }
```

## 🎯 TypeScript Types

```tsx
interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  mood?: string
}

interface SleepEntry {
  id: string
  date: string // YYYY-MM-DD
  bedtime: string // HH:MM
  wakeTime: string // HH:MM
  duration: number // hours
  quality: 1 | 2 | 3 | 4 | 5
  notes?: string
  createdAt: number
}
```

## ⚡ Performance Tips

```tsx
// ✅ Good: Batch operations
const conv = await aiStorage.getConversation(id)
conv.messages.push(...newMessages)
await aiStorage.saveConversation(conv)

// ❌ Bad: Multiple individual saves
for (const msg of newMessages) {
  await aiStorage.addMessage(id, msg)
}
```

## 🔍 Debug Helper

```tsx
// Check what's in storage
const info = await getStorageInfo()
console.log('Storage:', info)

// View all conversations
const convs = await aiStorage.getAllConversations()
console.log('Conversations:', convs)

// View all sleep entries
const sleep = await sleepStorage.getAllSleepEntries()
console.log('Sleep:', sleep)
```

## 📁 File Locations

- **Storage Logic**: `lib/local-storage.ts`
- **React Hooks**: `lib/use-local-storage.ts`
- **Examples**: `components/examples/`
- **Full Guide**: `LOCAL_STORAGE_GUIDE.md`
- **Summary**: `LOCAL_STORAGE_SUMMARY.md`
- **Migration**: `MIGRATION_CHECKLIST.md`

## ✅ Benefits

| Feature | Before (Server) | After (Local) |
|---------|----------------|---------------|
| **Privacy** | Data on server | Data on device ✅ |
| **Speed** | Network delay | Instant ✅ |
| **Offline** | ❌ Needs internet | ✅ Works offline |
| **Cost** | Server storage | Free ✅ |

## 🆘 Common Issues

**"Data not persisting"**
- Check browser settings (cookies/storage enabled)
- Check private/incognito mode (clears on close)
- Check console for errors

**"QuotaExceededError"**
- Storage full (>50MB)
- Delete old entries or clear data

**"IndexedDB not supported"**
- Very old browser
- Add feature detection

---

💡 **Remember**: All data stays on device. Zero server storage!
