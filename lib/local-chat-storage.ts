/**
 * Local Storage Manager for AI Chat
 * Stores chat messages locally with encryption for privacy
 */

const CHAT_STORAGE_KEY = "mindbridge_ai_chat_history";
const CHAT_SETTINGS_KEY = "mindbridge_chat_settings";
const PERSONALIZATION_STORAGE_KEY = "mindbridge_personalization_data";
const CONVERSATION_STATS_KEY = "mindbridge_conversation_stats";
const MAX_MESSAGES = 100; // Limit stored messages to prevent storage overflow

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  locale?: string;
}

export interface ChatSettings {
  showCrisisAlert: boolean;
  lastInteraction: number;
  messageCount: number;
}

export interface PersonalizationData {
  patterns: any; // ConversationPattern from lstm-analyzer
  lastAnalyzed: number;
  analysisCount: number;
}

export interface ConversationStats {
  totalConversations: number;
  totalMessages: number;
  averageSessionLength: number;
  mostActiveHour: number;
  favoriteTopics: string[];
  emotionalTrends: { emotion: string; count: number }[];
  lastUpdated: number;
}

/**
 * Simple encryption/decryption using base64 (can be enhanced with crypto API)
 */
function encryptData(data: string): string {
  try {
    return btoa(encodeURIComponent(data));
  } catch (error) {
    console.error("Encryption error:", error);
    return data;
  }
}

function decryptData(data: string): string {
  try {
    return decodeURIComponent(atob(data));
  } catch (error) {
    console.error("Decryption error:", error);
    return data;
  }
}

/**
 * Save chat messages to localStorage
 */
export function saveChatMessages(messages: ChatMessage[]): void {
  try {
    // Keep only the most recent messages
    const recentMessages = messages.slice(-MAX_MESSAGES);
    const data = JSON.stringify(recentMessages);
    const encrypted = encryptData(data);
    localStorage.setItem(CHAT_STORAGE_KEY, encrypted);
    
    // Update settings
    const settings: ChatSettings = {
      showCrisisAlert: false,
      lastInteraction: Date.now(),
      messageCount: recentMessages.length,
    };
    localStorage.setItem(CHAT_SETTINGS_KEY, JSON.stringify(settings));
    
    console.log(`💾 Saved ${recentMessages.length} messages locally`);
  } catch (error) {
    console.error("Failed to save chat messages:", error);
  }
}

/**
 * Load chat messages from localStorage
 */
export function loadChatMessages(): ChatMessage[] {
  try {
    const encrypted = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!encrypted) {
      console.log("📭 No chat history found");
      return [];
    }
    
    const decrypted = decryptData(encrypted);
    const messages = JSON.parse(decrypted) as ChatMessage[];
    
    console.log(`📥 Loaded ${messages.length} messages from local storage`);
    return messages;
  } catch (error) {
    console.error("Failed to load chat messages:", error);
    return [];
  }
}

/**
 * Clear all chat history
 */
export function clearChatHistory(): void {
  try {
    localStorage.removeItem(CHAT_STORAGE_KEY);
    localStorage.removeItem(CHAT_SETTINGS_KEY);
    console.log("🗑️ Chat history cleared");
  } catch (error) {
    console.error("Failed to clear chat history:", error);
  }
}

/**
 * Get chat settings
 */
export function getChatSettings(): ChatSettings {
  try {
    const data = localStorage.getItem(CHAT_SETTINGS_KEY);
    if (!data) {
      return {
        showCrisisAlert: false,
        lastInteraction: 0,
        messageCount: 0,
      };
    }
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to load chat settings:", error);
    return {
      showCrisisAlert: false,
      lastInteraction: 0,
      messageCount: 0,
    };
  }
}

/**
 * Update chat settings
 */
export function updateChatSettings(settings: Partial<ChatSettings>): void {
  try {
    const current = getChatSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(CHAT_SETTINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to update chat settings:", error);
  }
}

/**
 * Export chat history as JSON (for user download)
 */
export function exportChatHistory(): string {
  const messages = loadChatMessages();
  const exportData = {
    exportDate: new Date().toISOString(),
    messageCount: messages.length,
    messages: messages,
  };
  return JSON.stringify(exportData, null, 2);
}

/**
 * Get chat statistics
 */
export function getChatStatistics() {
  const messages = loadChatMessages();
  const settings = getChatSettings();
  
  const userMessages = messages.filter(m => m.role === "user");
  const assistantMessages = messages.filter(m => m.role === "assistant");
  
  return {
    totalMessages: messages.length,
    userMessages: userMessages.length,
    assistantMessages: assistantMessages.length,
    lastInteraction: settings.lastInteraction,
    firstMessage: messages[0]?.timestamp || 0,
    lastMessage: messages[messages.length - 1]?.timestamp || 0,
  };
}

/**
 * Check if storage quota is available
 */
export function checkStorageAvailable(): boolean {
  try {
    const test = "__storage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    console.error("LocalStorage not available:", error);
    return false;
  }
}

/**
 * Get storage usage info
 */
export function getStorageInfo(): { used: number; available: boolean } {
  const available = checkStorageAvailable();
  if (!available) {
    return { used: 0, available: false };
  }
  
  try {
    const data = localStorage.getItem(CHAT_STORAGE_KEY) || "";
    const settings = localStorage.getItem(CHAT_SETTINGS_KEY) || "";
    const totalSize = new Blob([data, settings]).size;
    
    return {
      used: totalSize,
      available: true,
    };
  } catch (error) {
    return { used: 0, available: true };
  }
}

/**
 * Save personalization data locally
 */
export function savePersonalizationData(patterns: any): void {
  try {
    const existing = loadPersonalizationData();
    const data: PersonalizationData = {
      patterns,
      lastAnalyzed: Date.now(),
      analysisCount: existing ? existing.analysisCount + 1 : 1,
    };
    const encrypted = encryptData(JSON.stringify(data));
    localStorage.setItem(PERSONALIZATION_STORAGE_KEY, encrypted);
    console.log("💾 Personalization data saved locally");
  } catch (error) {
    console.error("Failed to save personalization data:", error);
  }
}

/**
 * Load personalization data from localStorage
 */
export function loadPersonalizationData(): PersonalizationData | null {
  try {
    const encrypted = localStorage.getItem(PERSONALIZATION_STORAGE_KEY);
    if (!encrypted) {
      return null;
    }
    const decrypted = decryptData(encrypted);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error("Failed to load personalization data:", error);
    return null;
  }
}

/**
 * Update conversation statistics
 */
export function updateConversationStats(): void {
  try {
    const messages = loadChatMessages();
    const userMessages = messages.filter(m => m.role === 'user');
    const assistantMessages = messages.filter(m => m.role === 'assistant');

    // Calculate session lengths (rough estimation)
    const sessions: number[][] = [];
    let currentSession: ChatMessage[] = [];

    messages.forEach((msg, index) => {
      currentSession.push(msg);

      // Check if this is the end of a session (gap > 30 minutes or last message)
      const nextMsg = messages[index + 1];
      if (!nextMsg || (nextMsg.timestamp - msg.timestamp) > (30 * 60 * 1000)) {
        if (currentSession.length > 0) {
          sessions.push(currentSession.map(m => m.timestamp));
          currentSession = [];
        }
      }
    });

    const sessionLengths = sessions.map(session =>
      session.length > 1 ? (session[session.length - 1] - session[0]) / (1000 * 60) : 0
    );
    const averageSessionLength = sessionLengths.length > 0
      ? sessionLengths.reduce((a, b) => a + b, 0) / sessionLengths.length
      : 0;

    // Most active hour
    const hourCounts: Record<number, number> = {};
    messages.forEach(msg => {
      if (msg.timestamp) {
        const hour = new Date(msg.timestamp).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });

    const mostActiveHour = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 0;

    // Simple topic analysis (this could be enhanced with the LSTM analyzer)
    const topicKeywords = {
      stress: ['stress', 'anxious', 'worried', 'overwhelmed'],
      sleep: ['sleep', 'tired', 'insomnia'],
      relationships: ['friend', 'family', 'relationship', 'love'],
      mental_health: ['depression', 'anxiety', 'therapy', 'counseling'],
      career: ['job', 'work', 'career'],
      academics: ['study', 'exam', 'school']
    };

    const topicCounts: Record<string, number> = {};
    userMessages.forEach(msg => {
      const content = msg.content.toLowerCase();
      Object.entries(topicKeywords).forEach(([topic, keywords]) => {
        if (keywords.some(keyword => content.includes(keyword))) {
          topicCounts[topic] = (topicCounts[topic] || 0) + 1;
        }
      });
    });

    const favoriteTopics = Object.entries(topicCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([topic]) => topic);

    // Emotional trends (simplified)
    const emotionKeywords = {
      anxious: ['anxious', 'worried', 'nervous', 'stressed'],
      sad: ['sad', 'depressed', 'down', 'lonely'],
      happy: ['happy', 'excited', 'great', 'wonderful'],
      angry: ['angry', 'frustrated', 'mad'],
      calm: ['calm', 'peaceful', 'relaxed']
    };

    const emotionCounts: Record<string, number> = {};
    userMessages.forEach(msg => {
      const content = msg.content.toLowerCase();
      Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
        if (keywords.some(keyword => content.includes(keyword))) {
          emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
        }
      });
    });

    const emotionalTrends = Object.entries(emotionCounts)
      .map(([emotion, count]) => ({ emotion, count }))
      .sort((a, b) => b.count - a.count);

    const stats: ConversationStats = {
      totalConversations: sessions.length,
      totalMessages: messages.length,
      averageSessionLength: Math.round(averageSessionLength),
      mostActiveHour: parseInt(mostActiveHour.toString()),
      favoriteTopics,
      emotionalTrends,
      lastUpdated: Date.now()
    };

    localStorage.setItem(CONVERSATION_STATS_KEY, JSON.stringify(stats));
    console.log("📊 Conversation stats updated");
  } catch (error) {
    console.error("Failed to update conversation stats:", error);
  }
}

/**
 * Load conversation statistics
 */
export function loadConversationStats(): ConversationStats | null {
  try {
    const data = localStorage.getItem(CONVERSATION_STATS_KEY);
    if (!data) {
      return null;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to load conversation stats:", error);
    return null;
  }
}

/**
 * Get comprehensive conversation insights
 */
export function getConversationInsights() {
  const messages = loadChatMessages();
  const personalization = loadPersonalizationData();
  const stats = loadConversationStats();

  return {
    messageCount: messages.length,
    hasPersonalization: !!personalization,
    lastPersonalizationUpdate: personalization?.lastAnalyzed || null,
    personalizationAnalysisCount: personalization?.analysisCount || 0,
    conversationStats: stats,
    canAnalyze: messages.length >= 5,
    nextMilestone: messages.length >= 5 ? null : `${5 - messages.length} more conversations for personalization`
  };
}
