/**
 * React hooks for local storage
 * Provides easy access to IndexedDB storage with React state management
 */

import { useState, useEffect, useCallback } from 'react'
import {
  aiStorage,
  sleepStorage,
  moodStorage,
  preferencesStorage,
  initDB,
  type AIConversation,
  type AIMessage,
  type SleepEntry,
  type MoodEntry,
  type UserPreferences,
} from './local-storage'

/**
 * Hook to manage AI conversations
 */
export const useAIConversations = () => {
  const [conversations, setConversations] = useState<AIConversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true)
      await initDB()
      const data = await aiStorage.getAllConversations()
      setConversations(data)
      setError(null)
    } catch (err) {
      setError(err as Error)
      console.error('Failed to load AI conversations:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  const saveConversation = useCallback(async (conversation: AIConversation) => {
    try {
      await aiStorage.saveConversation(conversation)
      await loadConversations()
    } catch (err) {
      console.error('Failed to save conversation:', err)
      throw err
    }
  }, [loadConversations])

  const addMessage = useCallback(async (conversationId: string, message: AIMessage) => {
    try {
      await aiStorage.addMessage(conversationId, message)
      await loadConversations()
    } catch (err) {
      console.error('Failed to add message:', err)
      throw err
    }
  }, [loadConversations])

  const deleteConversation = useCallback(async (id: string) => {
    try {
      await aiStorage.deleteConversation(id)
      await loadConversations()
    } catch (err) {
      console.error('Failed to delete conversation:', err)
      throw err
    }
  }, [loadConversations])

  const clearAll = useCallback(async () => {
    try {
      await aiStorage.clearAllConversations()
      await loadConversations()
    } catch (err) {
      console.error('Failed to clear conversations:', err)
      throw err
    }
  }, [loadConversations])

  return {
    conversations,
    loading,
    error,
    saveConversation,
    addMessage,
    deleteConversation,
    clearAll,
    refresh: loadConversations,
  }
}

/**
 * Hook to manage single AI conversation
 */
export const useAIConversation = (conversationId: string) => {
  const [conversation, setConversation] = useState<AIConversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadConversation = useCallback(async () => {
    try {
      setLoading(true)
      await initDB()
      const data = await aiStorage.getConversation(conversationId)
      setConversation(data || null)
      setError(null)
    } catch (err) {
      setError(err as Error)
      console.error('Failed to load conversation:', err)
    } finally {
      setLoading(false)
    }
  }, [conversationId])

  useEffect(() => {
    loadConversation()
  }, [loadConversation])

  const addMessage = useCallback(async (message: AIMessage) => {
    try {
      await aiStorage.addMessage(conversationId, message)
      await loadConversation()
    } catch (err) {
      console.error('Failed to add message:', err)
      throw err
    }
  }, [conversationId, loadConversation])

  return {
    conversation,
    loading,
    error,
    addMessage,
    refresh: loadConversation,
  }
}

/**
 * Hook to manage sleep tracking
 */
export const useSleepTracking = (days: number = 30) => {
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadSleepEntries = useCallback(async () => {
    try {
      setLoading(true)
      await initDB()
      const data = await sleepStorage.getRecentSleep(days)
      setSleepEntries(data)
      setError(null)
    } catch (err) {
      setError(err as Error)
      console.error('Failed to load sleep entries:', err)
    } finally {
      setLoading(false)
    }
  }, [days])

  useEffect(() => {
    loadSleepEntries()
  }, [loadSleepEntries])

  const saveSleepEntry = useCallback(async (entry: SleepEntry) => {
    try {
      await sleepStorage.saveSleepEntry(entry)
      await loadSleepEntries()
    } catch (err) {
      console.error('Failed to save sleep entry:', err)
      throw err
    }
  }, [loadSleepEntries])

  const deleteSleepEntry = useCallback(async (id: string) => {
    try {
      await sleepStorage.deleteSleepEntry(id)
      await loadSleepEntries()
    } catch (err) {
      console.error('Failed to delete sleep entry:', err)
      throw err
    }
  }, [loadSleepEntries])

  const getStats = useCallback(async (statsDays: number = 30) => {
    try {
      return await sleepStorage.getSleepStats(statsDays)
    } catch (err) {
      console.error('Failed to get sleep stats:', err)
      throw err
    }
  }, [])

  return {
    sleepEntries,
    loading,
    error,
    saveSleepEntry,
    deleteSleepEntry,
    getStats,
    refresh: loadSleepEntries,
  }
}

/**
 * Hook to manage mood history
 */
export const useMoodHistory = (days: number = 7) => {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadMoodEntries = useCallback(async () => {
    try {
      setLoading(true)
      await initDB()
      const data = await moodStorage.getRecentMoods(days)
      setMoodEntries(data)
      setError(null)
    } catch (err) {
      setError(err as Error)
      console.error('Failed to load mood entries:', err)
    } finally {
      setLoading(false)
    }
  }, [days])

  useEffect(() => {
    loadMoodEntries()
  }, [loadMoodEntries])

  const saveMoodEntry = useCallback(async (entry: MoodEntry) => {
    try {
      await moodStorage.saveMoodEntry(entry)
      await loadMoodEntries()
    } catch (err) {
      console.error('Failed to save mood entry:', err)
      throw err
    }
  }, [loadMoodEntries])

  const deleteMoodEntry = useCallback(async (id: string) => {
    try {
      await moodStorage.deleteMoodEntry(id)
      await loadMoodEntries()
    } catch (err) {
      console.error('Failed to delete mood entry:', err)
      throw err
    }
  }, [loadMoodEntries])

  return {
    moodEntries,
    loading,
    error,
    saveMoodEntry,
    deleteMoodEntry,
    refresh: loadMoodEntries,
  }
}

/**
 * Hook to manage user preferences
 */
export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadPreferences = useCallback(async () => {
    try {
      setLoading(true)
      await initDB()
      const data = await preferencesStorage.getPreferences()
      setPreferences(data || null)
      setError(null)
    } catch (err) {
      setError(err as Error)
      console.error('Failed to load preferences:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPreferences()
  }, [loadPreferences])

  const savePreferences = useCallback(async (prefs: UserPreferences) => {
    try {
      await preferencesStorage.savePreferences(prefs)
      await loadPreferences()
    } catch (err) {
      console.error('Failed to save preferences:', err)
      throw err
    }
  }, [loadPreferences])

  return {
    preferences,
    loading,
    error,
    savePreferences,
    refresh: loadPreferences,
  }
}
