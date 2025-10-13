# Local Storage Implementation Guide

## Overview

MindBridge now stores **sleep tracking** and **AI companion data** locally on the user's device using **IndexedDB**. This approach:

- ✅ **Privacy First**: No sensitive data sent to servers
- ✅ **High Performance**: Instant access to data
- ✅ **Offline Support**: Works without internet
- ✅ **Large Storage**: Can store MBs of data (unlike cookies)
- ✅ **Structured Data**: Easy to query and manage

## Why IndexedDB?

| Storage Method | Capacity | Performance | Best For |
|---------------|----------|-------------|----------|
| **Cookies** | ~4KB | Medium | Small tokens/flags |
| **LocalStorage** | ~5-10MB | Good | Simple key-value data |
| **IndexedDB** ✅ | ~50MB+ | Excellent | Complex structured data |

**IndexedDB is the best choice because:**
1. Can store large amounts of data (conversations, sleep logs)
2. Supports complex queries and indexing
3. Asynchronous (doesn't block UI)
4. Can store objects directly (no JSON parsing needed)
5. Browser-standard and widely supported

## Architecture

### Database Structure

```
MindBridgeDB (IndexedDB)
├── ai_conversations
│   ├── id (primary key)
│   ├── messages[]
│   ├── startedAt
│   ├── lastUpdated
│   └── mood
├── sleep_tracking
│   ├── id (primary key)
│   ├── date (indexed)
│   ├── bedtime
│   ├── wakeTime
│   ├── duration
│   ├── quality (1-5)
│   └── notes
├── mood_history
│   ├── id (primary key)
│   ├── mood
│   ├── timestamp (indexed)
│   └── activities[]
└── user_preferences
    ├── theme
    ├── language
    └── notifications
```

## Usage Examples

### 1. AI Companion - Save Conversations Locally

```tsx
import { useAIConversation } from '@/lib/use-local-storage'
import { v4 as uuidv4 } from 'uuid'

function AICompanionChat() {
  const conversationId = 'current-session' // or generate with uuidv4()
  const { conversation, addMessage, loading } = useAIConversation(conversationId)

  const handleSendMessage = async (content: string) => {
    // Save user message locally
    await addMessage({
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: Date.now(),
      mood: currentMood,
    })

    // Get AI response (from on-device model or API)
    const aiResponse = await getAIResponse(content)

    // Save AI response locally
    await addMessage({
      id: uuidv4(),
      role: 'assistant',
      content: aiResponse,
      timestamp: Date.now(),
    })
  }

  return (
    <div>
      {conversation?.messages.map(msg => (
        <div key={msg.id}>
          <strong>{msg.role}:</strong> {msg.content}
        </div>
      ))}
    </div>
  )
}
```

### 2. Sleep Tracking - Save Sleep Data Locally

```tsx
import { useSleepTracking } from '@/lib/use-local-storage'
import { v4 as uuidv4 } from 'uuid'

function SleepTracker() {
  const { sleepEntries, saveSleepEntry, getStats } = useSleepTracking(30)
  const [stats, setStats] = useState(null)

  const handleSaveSleep = async () => {
    await saveSleepEntry({
      id: uuidv4(),
      date: '2025-10-14',
      bedtime: '23:00',
      wakeTime: '07:00',
      duration: 8,
      quality: 4,
      notes: 'Slept well, no interruptions',
      mood: 'calm',
      createdAt: Date.now(),
    })
  }

  const loadStats = async () => {
    const stats = await getStats(30) // Last 30 days
    setStats(stats)
  }

  return (
    <div>
      <h2>Sleep Entries</h2>
      {sleepEntries.map(entry => (
        <div key={entry.id}>
          {entry.date}: {entry.duration}h (Quality: {entry.quality}/5)
        </div>
      ))}
      
      {stats && (
        <div>
          <p>Average Duration: {stats.averageDuration.toFixed(1)}h</p>
          <p>Average Quality: {stats.averageQuality.toFixed(1)}/5</p>
        </div>
      )}
    </div>
  )
}
```

### 3. Mood History - Track Mood Locally

```tsx
import { useMoodHistory } from '@/lib/use-local-storage'
import { v4 as uuidv4 } from 'uuid'

function MoodTracker() {
  const { moodEntries, saveMoodEntry } = useMoodHistory(7)

  const handleSaveMood = async (mood: string) => {
    await saveMoodEntry({
      id: uuidv4(),
      mood,
      timestamp: Date.now(),
      notes: 'Feeling better today',
      activities: ['meditation', 'exercise'],
    })
  }

  return (
    <div>
      {moodEntries.map(entry => (
        <div key={entry.id}>
          {new Date(entry.timestamp).toLocaleDateString()}: {entry.mood}
        </div>
      ))}
    </div>
  )
}
```

## Advanced Features

### Export User Data (GDPR Compliance)

```tsx
import { exportAllData } from '@/lib/local-storage'

const handleExportData = async () => {
  const jsonData = await exportAllData()
  const blob = new Blob([jsonData], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `mindbridge-data-${new Date().toISOString()}.json`
  a.click()
}
```

### Clear All Data (Privacy Reset)

```tsx
import { clearAllLocalData } from '@/lib/local-storage'

const handleClearData = async () => {
  if (confirm('Delete all local data? This cannot be undone.')) {
    await clearAllLocalData()
    alert('All data deleted successfully')
  }
}
```

### Get Storage Usage Info

```tsx
import { getStorageInfo } from '@/lib/local-storage'

const handleCheckStorage = async () => {
  const info = await getStorageInfo()
  console.log('Storage Info:', info)
  // {
  //   conversationsCount: 15,
  //   sleepEntriesCount: 30,
  //   moodEntriesCount: 45,
  //   estimatedSize: "2.34 MB"
  // }
}
```

## Migration Strategy

### Step 1: Initialize DB on App Load

```tsx
// app/layout.tsx
import { initDB } from '@/lib/local-storage'

export default function RootLayout({ children }) {
  useEffect(() => {
    // Initialize IndexedDB when app loads
    initDB().catch(err => {
      console.error('Failed to initialize local storage:', err)
    })
  }, [])

  return <html>{children}</html>
}
```

### Step 2: Update AI Companion to Use Local Storage

Replace Convex storage calls with local storage:

```tsx
// Before (using Convex)
const saveMessage = useMutation(api.messages.send)
await saveMessage({ content, userId })

// After (using IndexedDB)
import { aiStorage } from '@/lib/local-storage'
await aiStorage.addMessage(conversationId, { content, ... })
```

### Step 3: Update Sleep Tracker to Use Local Storage

```tsx
// Before (using Convex)
const saveSleep = useMutation(api.sleep.create)
await saveSleep({ date, duration, quality })

// After (using IndexedDB)
import { sleepStorage } from '@/lib/local-storage'
await sleepStorage.saveSleepEntry({ date, duration, quality, ... })
```

## Best Practices

### 1. Error Handling

```tsx
try {
  await aiStorage.addMessage(conversationId, message)
} catch (error) {
  console.error('Failed to save message locally:', error)
  // Show user-friendly error
  toast.error('Failed to save message. Please try again.')
}
```

### 2. Loading States

```tsx
const { conversations, loading, error } = useAIConversations()

if (loading) return <Spinner />
if (error) return <ErrorMessage error={error} />
return <ConversationList conversations={conversations} />
```

### 3. Periodic Cleanup

```tsx
// Clean up old conversations (older than 90 days)
useEffect(() => {
  const cleanup = async () => {
    const conversations = await aiStorage.getAllConversations()
    const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000)
    
    for (const conv of conversations) {
      if (conv.lastUpdated < ninetyDaysAgo) {
        await aiStorage.deleteConversation(conv.id)
      }
    }
  }
  
  cleanup()
}, [])
```

### 4. Privacy Settings

```tsx
// Add to settings page
const PrivacySettings = () => {
  return (
    <div>
      <h2>Data Privacy</h2>
      <p>All data is stored locally on your device</p>
      
      <Button onClick={() => exportAllData()}>
        Download My Data
      </Button>
      
      <Button onClick={() => clearAllLocalData()} variant="destructive">
        Delete All Local Data
      </Button>
      
      <StorageInfo />
    </div>
  )
}
```

## Performance Optimization

### 1. Batch Operations

```tsx
// Instead of multiple individual saves
for (const message of messages) {
  await aiStorage.addMessage(conversationId, message) // Slow
}

// Batch save
const conversation = await aiStorage.getConversation(conversationId)
conversation.messages.push(...messages)
await aiStorage.saveConversation(conversation) // Fast
```

### 2. Lazy Loading

```tsx
// Only load recent conversations initially
const { conversations } = useAIConversations()
const recentConvs = conversations.slice(0, 10)

// Load more on demand
const loadMore = async () => {
  const older = await aiStorage.getAllConversations()
  // ... display older conversations
}
```

### 3. Indexing

Indexes are already created for common queries:
- `date` index on sleep_tracking
- `timestamp` index on mood_history
- `lastUpdated` index on ai_conversations

## Browser Compatibility

IndexedDB is supported in all modern browsers:
- ✅ Chrome/Edge 24+
- ✅ Firefox 16+
- ✅ Safari 10+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Security Notes

1. **Data is NOT encrypted by default** - IndexedDB stores data in plain text
2. **Same-origin policy** - Data is isolated per domain
3. **User can clear** - Browser settings can delete IndexedDB data
4. **No server sync** - Data stays on device (feature, not bug!)

### Optional: Add Encryption

For sensitive data, you can add encryption:

```tsx
import CryptoJS from 'crypto-js'

const encrypt = (data: string, key: string) => {
  return CryptoJS.AES.encrypt(data, key).toString()
}

const decrypt = (encryptedData: string, key: string) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, key)
  return bytes.toString(CryptoJS.enc.Utf8)
}

// Use user's password or device-specific key
const userKey = getUserEncryptionKey()

// Encrypt before storing
const encryptedContent = encrypt(message.content, userKey)
await aiStorage.addMessage(conversationId, {
  ...message,
  content: encryptedContent
})

// Decrypt when reading
const decryptedContent = decrypt(message.content, userKey)
```

## Testing

```tsx
// Test sleep storage
describe('Sleep Tracking', () => {
  it('should save and retrieve sleep entry', async () => {
    const entry = {
      id: 'test-1',
      date: '2025-10-14',
      duration: 8,
      quality: 4,
    }
    
    await sleepStorage.saveSleepEntry(entry)
    const retrieved = await sleepStorage.getSleepByDate('2025-10-14')
    
    expect(retrieved).toEqual(entry)
  })
})
```

## Summary

✅ **Implemented**: Complete local storage system using IndexedDB  
✅ **Features**: AI conversations, sleep tracking, mood history, preferences  
✅ **React Hooks**: Easy-to-use hooks for all storage operations  
✅ **Privacy**: All data stays on device  
✅ **Performance**: Fast, efficient, offline-capable  
✅ **Scalable**: Can store MBs of data  

**Next Steps:**
1. Update AI Companion component to use `useAIConversation` hook
2. Update Sleep Tracker to use `useSleepTracking` hook
3. Add export/clear data buttons in settings
4. Test thoroughly in different browsers
5. Add encryption for extra security (optional)
