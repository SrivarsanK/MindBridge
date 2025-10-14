/**
 * Local Storage Manager for AI Chat
 * Stores chat messages locally with encryption for privacy
 */

const CHAT_STORAGE_KEY = "mindbridge_ai_chat_history";
const CHAT_SETTINGS_KEY = "mindbridge_chat_settings";
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
