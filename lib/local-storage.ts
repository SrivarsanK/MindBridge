/**
 * Local Storage Manager for MindBridge
 * Handles all client-side data storage using IndexedDB
 * No data is sent to servers - everything stays on device
 */

// Database configuration
const DB_NAME = 'MindBridgeDB'
const DB_VERSION = 1

// Store names
const STORES = {
  AI_CONVERSATIONS: 'ai_conversations',
  SLEEP_TRACKING: 'sleep_tracking',
  MOOD_HISTORY: 'mood_history',
  USER_PREFERENCES: 'user_preferences',
} as const

// Types
export interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  mood?: string
}

export interface AIConversation {
  id: string
  messages: AIMessage[]
  startedAt: number
  lastUpdated: number
  mood?: string
  summary?: string
}

export interface SleepEntry {
  id: string
  date: string // YYYY-MM-DD
  bedtime: string // HH:MM
  wakeTime: string // HH:MM
  duration: number // hours
  quality: 1 | 2 | 3 | 4 | 5 // 1-5 rating
  notes?: string
  mood?: string
  createdAt: number
}

export interface MoodEntry {
  id: string
  mood: string
  timestamp: number
  notes?: string
  activities?: string[]
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  notifications: boolean
  lastSync?: number
}

/**
 * Initialize IndexedDB database
 */
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Create AI Conversations store
      if (!db.objectStoreNames.contains(STORES.AI_CONVERSATIONS)) {
        const aiStore = db.createObjectStore(STORES.AI_CONVERSATIONS, { keyPath: 'id' })
        aiStore.createIndex('lastUpdated', 'lastUpdated', { unique: false })
        aiStore.createIndex('mood', 'mood', { unique: false })
      }

      // Create Sleep Tracking store
      if (!db.objectStoreNames.contains(STORES.SLEEP_TRACKING)) {
        const sleepStore = db.createObjectStore(STORES.SLEEP_TRACKING, { keyPath: 'id' })
        sleepStore.createIndex('date', 'date', { unique: true })
        sleepStore.createIndex('createdAt', 'createdAt', { unique: false })
      }

      // Create Mood History store
      if (!db.objectStoreNames.contains(STORES.MOOD_HISTORY)) {
        const moodStore = db.createObjectStore(STORES.MOOD_HISTORY, { keyPath: 'id' })
        moodStore.createIndex('timestamp', 'timestamp', { unique: false })
        moodStore.createIndex('mood', 'mood', { unique: false })
      }

      // Create User Preferences store
      if (!db.objectStoreNames.contains(STORES.USER_PREFERENCES)) {
        db.createObjectStore(STORES.USER_PREFERENCES, { keyPath: 'id' })
      }
    }
  })
}

/**
 * Generic function to add/update data
 */
const addOrUpdate = async <T>(storeName: string, data: T): Promise<void> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.put(data)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

/**
 * Generic function to get data by ID
 */
const getById = async <T>(storeName: string, id: string): Promise<T | undefined> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.get(id)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Generic function to get all data from store
 */
const getAll = async <T>(storeName: string): Promise<T[]> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Generic function to delete data
 */
const deleteById = async (storeName: string, id: string): Promise<void> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.delete(id)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

/**
 * Get data by index
 */
const getByIndex = async <T>(
  storeName: string,
  indexName: string,
  value: string | number
): Promise<T[]> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)
    const index = store.index(indexName)
    const request = index.getAll(value)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// ============================================================================
// AI Companion Functions
// ============================================================================

export const aiStorage = {
  /**
   * Save a new conversation or update existing
   */
  saveConversation: async (conversation: AIConversation): Promise<void> => {
    await addOrUpdate(STORES.AI_CONVERSATIONS, conversation)
  },

  /**
   * Get conversation by ID
   */
  getConversation: async (id: string): Promise<AIConversation | undefined> => {
    return getById<AIConversation>(STORES.AI_CONVERSATIONS, id)
  },

  /**
   * Get all conversations
   */
  getAllConversations: async (): Promise<AIConversation[]> => {
    const conversations = await getAll<AIConversation>(STORES.AI_CONVERSATIONS)
    return conversations.sort((a, b) => b.lastUpdated - a.lastUpdated)
  },

  /**
   * Add message to conversation
   */
  addMessage: async (conversationId: string, message: AIMessage): Promise<void> => {
    const conversation = await getById<AIConversation>(STORES.AI_CONVERSATIONS, conversationId)
    
    if (conversation) {
      conversation.messages.push(message)
      conversation.lastUpdated = Date.now()
      await addOrUpdate(STORES.AI_CONVERSATIONS, conversation)
    } else {
      // Create new conversation
      const newConversation: AIConversation = {
        id: conversationId,
        messages: [message],
        startedAt: Date.now(),
        lastUpdated: Date.now(),
        mood: message.mood,
      }
      await addOrUpdate(STORES.AI_CONVERSATIONS, newConversation)
    }
  },

  /**
   * Delete conversation
   */
  deleteConversation: async (id: string): Promise<void> => {
    await deleteById(STORES.AI_CONVERSATIONS, id)
  },

  /**
   * Clear all conversations (for privacy)
   */
  clearAllConversations: async (): Promise<void> => {
    const db = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.AI_CONVERSATIONS], 'readwrite')
      const store = transaction.objectStore(STORES.AI_CONVERSATIONS)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  },

  /**
   * Get recent conversations (last 7 days)
   */
  getRecentConversations: async (days: number = 7): Promise<AIConversation[]> => {
    const allConversations = await getAll<AIConversation>(STORES.AI_CONVERSATIONS)
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000)
    
    return allConversations
      .filter(c => c.lastUpdated > cutoffTime)
      .sort((a, b) => b.lastUpdated - a.lastUpdated)
  },
}

// ============================================================================
// Sleep Tracking Functions
// ============================================================================

export const sleepStorage = {
  /**
   * Save sleep entry
   */
  saveSleepEntry: async (entry: SleepEntry): Promise<void> => {
    await addOrUpdate(STORES.SLEEP_TRACKING, entry)
  },

  /**
   * Get sleep entry by date
   */
  getSleepByDate: async (date: string): Promise<SleepEntry | undefined> => {
    const entries = await getByIndex<SleepEntry>(STORES.SLEEP_TRACKING, 'date', date)
    return entries[0]
  },

  /**
   * Get all sleep entries
   */
  getAllSleepEntries: async (): Promise<SleepEntry[]> => {
    const entries = await getAll<SleepEntry>(STORES.SLEEP_TRACKING)
    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  },

  /**
   * Get sleep entries for date range
   */
  getSleepRange: async (startDate: string, endDate: string): Promise<SleepEntry[]> => {
    const allEntries = await getAll<SleepEntry>(STORES.SLEEP_TRACKING)
    
    return allEntries
      .filter(entry => entry.date >= startDate && entry.date <= endDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  },

  /**
   * Get recent sleep entries (last N days)
   */
  getRecentSleep: async (days: number = 7): Promise<SleepEntry[]> => {
    const allEntries = await getAll<SleepEntry>(STORES.SLEEP_TRACKING)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    const cutoffStr = cutoffDate.toISOString().split('T')[0]
    
    return allEntries
      .filter(entry => entry.date >= cutoffStr)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  },

  /**
   * Delete sleep entry
   */
  deleteSleepEntry: async (id: string): Promise<void> => {
    await deleteById(STORES.SLEEP_TRACKING, id)
  },

  /**
   * Get sleep statistics
   */
  getSleepStats: async (days: number = 30): Promise<{
    averageDuration: number
    averageQuality: number
    totalEntries: number
    bestNight: SleepEntry | null
    worstNight: SleepEntry | null
  }> => {
    const entries = await sleepStorage.getRecentSleep(days)
    
    if (entries.length === 0) {
      return {
        averageDuration: 0,
        averageQuality: 0,
        totalEntries: 0,
        bestNight: null,
        worstNight: null,
      }
    }

    const totalDuration = entries.reduce((sum, e) => sum + e.duration, 0)
    const totalQuality = entries.reduce((sum, e) => sum + e.quality, 0)
    
    const sorted = [...entries].sort((a, b) => b.quality - a.quality)

    return {
      averageDuration: totalDuration / entries.length,
      averageQuality: totalQuality / entries.length,
      totalEntries: entries.length,
      bestNight: sorted[0] || null,
      worstNight: sorted[sorted.length - 1] || null,
    }
  },
}

// ============================================================================
// Mood History Functions
// ============================================================================

export const moodStorage = {
  /**
   * Save mood entry
   */
  saveMoodEntry: async (entry: MoodEntry): Promise<void> => {
    await addOrUpdate(STORES.MOOD_HISTORY, entry)
  },

  /**
   * Get all mood entries
   */
  getAllMoodEntries: async (): Promise<MoodEntry[]> => {
    const entries = await getAll<MoodEntry>(STORES.MOOD_HISTORY)
    return entries.sort((a, b) => b.timestamp - a.timestamp)
  },

  /**
   * Get recent mood entries
   */
  getRecentMoods: async (days: number = 7): Promise<MoodEntry[]> => {
    const allEntries = await getAll<MoodEntry>(STORES.MOOD_HISTORY)
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000)
    
    return allEntries
      .filter(entry => entry.timestamp > cutoffTime)
      .sort((a, b) => b.timestamp - a.timestamp)
  },

  /**
   * Delete mood entry
   */
  deleteMoodEntry: async (id: string): Promise<void> => {
    await deleteById(STORES.MOOD_HISTORY, id)
  },
}

// ============================================================================
// User Preferences Functions
// ============================================================================

export const preferencesStorage = {
  /**
   * Save user preferences
   */
  savePreferences: async (prefs: UserPreferences): Promise<void> => {
    await addOrUpdate(STORES.USER_PREFERENCES, { id: 'user_prefs', ...prefs })
  },

  /**
   * Get user preferences
   */
  getPreferences: async (): Promise<UserPreferences | undefined> => {
    return getById<UserPreferences>(STORES.USER_PREFERENCES, 'user_prefs')
  },
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Clear all local data (for account deletion or privacy reset)
 */
export const clearAllLocalData = async (): Promise<void> => {
  const db = await initDB()
  const stores = [
    STORES.AI_CONVERSATIONS,
    STORES.SLEEP_TRACKING,
    STORES.MOOD_HISTORY,
    STORES.USER_PREFERENCES,
  ]

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(stores, 'readwrite')
    
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)

    stores.forEach(storeName => {
      transaction.objectStore(storeName).clear()
    })
  })
}

/**
 * Export all data as JSON (for user download)
 */
export const exportAllData = async (): Promise<string> => {
  const [aiConversations, sleepEntries, moodEntries, preferences] = await Promise.all([
    aiStorage.getAllConversations(),
    sleepStorage.getAllSleepEntries(),
    moodStorage.getAllMoodEntries(),
    preferencesStorage.getPreferences(),
  ])

  const exportData = {
    exportDate: new Date().toISOString(),
    version: DB_VERSION,
    data: {
      aiConversations,
      sleepEntries,
      moodEntries,
      preferences,
    },
  }

  return JSON.stringify(exportData, null, 2)
}

/**
 * Get storage usage info
 */
export const getStorageInfo = async (): Promise<{
  conversationsCount: number
  sleepEntriesCount: number
  moodEntriesCount: number
  estimatedSize: string
}> => {
  const [aiConversations, sleepEntries, moodEntries] = await Promise.all([
    aiStorage.getAllConversations(),
    sleepStorage.getAllSleepEntries(),
    moodStorage.getAllMoodEntries(),
  ])

  const dataStr = JSON.stringify({
    aiConversations,
    sleepEntries,
    moodEntries,
  })

  const sizeInBytes = new Blob([dataStr]).size
  const sizeInKB = sizeInBytes / 1024
  const sizeInMB = sizeInKB / 1024

  return {
    conversationsCount: aiConversations.length,
    sleepEntriesCount: sleepEntries.length,
    moodEntriesCount: moodEntries.length,
    estimatedSize: sizeInMB > 1 
      ? `${sizeInMB.toFixed(2)} MB` 
      : `${sizeInKB.toFixed(2)} KB`,
  }
}
