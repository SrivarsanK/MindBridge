/**
 * Local Conversation Pattern Analyzer
 * Analyzes chat history stored locally to extract user patterns and preferences
 * for AI personalization without uploading data to servers
 */

import {
  loadChatMessages,
  type ChatMessage
} from '../local-chat-storage';

export interface ConversationPattern {
  emotionalProfile: {
    dominantEmotions: string[];
    emotionalTrends: { emotion: string; frequency: number }[];
    responsePreferences: string[];
  };
  topicPreferences: {
    interests: string[];
    avoidances: string[];
    favoriteTopics: string[];
  };
  communicationStyle: {
    preferredTone: 'formal' | 'casual' | 'empathetic' | 'direct';
    responseLength: 'brief' | 'moderate' | 'detailed';
    languageComplexity: 'simple' | 'moderate' | 'advanced';
  };
  conversationPatterns: {
    averageMessageLength: number;
    commonPhrases: string[];
    timeOfDayPattern: { hour: number; frequency: number }[];
    sessionDuration: number;
  };
  personalizedContext: string;
  lastUpdated: number;
  messageCount: number;
}

// Emotion keywords for different languages
const EMOTION_KEYWORDS = {
  anxious: ['anxious', 'worried', 'nervous', 'stressed', 'overwhelmed', 'panic', 'fear', 'scared', 'tense', '不安', '紧张', 'घबराया', 'व्याकुल'],
  sad: ['sad', 'depressed', 'down', 'unhappy', 'lonely', 'hopeless', 'crying', 'tears', 'grief', '悲しい', '沮丧', 'उदास', 'दुखी'],
  happy: ['happy', 'joyful', 'excited', 'great', 'wonderful', 'amazing', 'fantastic', 'thrilled', 'delighted', '幸せ', '开心', 'खुश', 'प्रसन्न'],
  angry: ['angry', 'frustrated', 'mad', 'irritated', 'annoyed', 'furious', 'rage', 'upset', 'irate', '怒り', '愤怒', 'गुस्सा', 'क्रोधित'],
  calm: ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil', 'composed', 'chill', 'quiet', 'soothed', '穏やか', '平静', 'शांत', 'शांत'],
  confused: ['confused', 'lost', 'unsure', 'puzzled', 'bewildered', 'uncertain', 'doubtful', 'perplexed', '迷う', '困惑', 'भ्रमित', 'उलझन'],
  hopeful: ['hopeful', 'optimistic', 'positive', 'encouraged', 'motivated', 'inspired', 'confident', '期待', '希望', 'आशावादी', 'आशापूर्ण'],
  grateful: ['grateful', 'thankful', 'appreciative', 'blessed', 'fortunate', 'gratitude', 'thanks', 'ありがとう', '感激', 'आभारी', 'कृतज्ञ']
};

// Topic categories
const TOPIC_CATEGORIES = {
  stress: ['stress', 'pressure', 'tension', 'overwhelmed', 'burnout', 'workload', 'deadline', 'ストレス', '压力', 'तनाव', 'दबाव'],
  sleep: ['sleep', 'insomnia', 'tired', 'exhausted', 'rest', 'bedtime', 'wake up', '眠り', '睡眠', 'नींद', 'सोना'],
  relationships: ['relationship', 'friend', 'family', 'partner', 'love', 'breakup', 'conflict', 'human relations', '人間関係', '关系', 'संबंध', 'रिश्ता'],
  self_esteem: ['confidence', 'self-esteem', 'worth', 'value', 'insecure', 'doubt', 'self-doubt', '自信', '自尊', 'आत्मविश्वास', 'स्वाभिमान'],
  mental_health: ['depression', 'anxiety', 'therapy', 'counseling', 'mental health', 'wellness', 'mindfulness', '精神衛生', '心理健康', 'मानसिक स्वास्थ्य', 'मनोविज्ञान'],
  career: ['job', 'career', 'work', 'promotion', 'colleague', 'boss', 'interview', '仕事', '职业', 'करियर', 'व्यवसाय'],
  academics: ['study', 'exam', 'grades', 'school', 'college', 'assignment', 'learning', '勉強', '学习', 'अध्ययन', 'पढ़ाई'],
  future: ['future', 'goals', 'plans', 'dreams', 'aspirations', 'direction', 'purpose', '未来', '未来', 'भविष्य', 'आगामी']
};

/**
 * Analyze conversation patterns from local chat history
 */
export function analyzeConversationPatterns(): ConversationPattern {
  const messages = loadChatMessages();

  if (messages.length < 3) {
    // Not enough data for meaningful analysis
    return getDefaultPattern(messages.length);
  }

  // Analyze emotions
  const emotionalProfile = analyzeEmotions(messages);

  // Analyze topics
  const topicPreferences = analyzeTopics(messages);

  // Analyze communication style
  const communicationStyle = analyzeCommunicationStyle(messages);

  // Analyze conversation patterns
  const conversationPatterns = analyzeConversationPatternsInternal(messages);

  // Generate personalized context
  const personalizedContext = generatePersonalizedContext(
    emotionalProfile,
    topicPreferences,
    communicationStyle,
    conversationPatterns
  );

  return {
    emotionalProfile,
    topicPreferences,
    communicationStyle,
    conversationPatterns,
    personalizedContext,
    lastUpdated: Date.now(),
    messageCount: messages.length
  };
}

/**
 * Analyze emotional patterns in conversations
 */
function analyzeEmotions(messages: ChatMessage[]) {
  const emotionCounts: Record<string, number> = {};
  const userMessages = messages.filter(m => m.role === 'user');

  // Count emotion keywords
  userMessages.forEach(message => {
    const content = message.content.toLowerCase();
    Object.entries(EMOTION_KEYWORDS).forEach(([emotion, keywords]) => {
      keywords.forEach(keyword => {
        if (content.includes(keyword.toLowerCase())) {
          emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
        }
      });
    });
  });

  // Convert to trends
  const emotionalTrends = Object.entries(emotionCounts)
    .map(([emotion, frequency]) => ({ emotion, frequency }))
    .sort((a, b) => b.frequency - a.frequency);

  // Get dominant emotions (top 3)
  const dominantEmotions = emotionalTrends.slice(0, 3).map(t => t.emotion);

  // Determine response preferences based on emotions
  const responsePreferences = [];
  if (dominantEmotions.includes('anxious')) responsePreferences.push('calming', 'reassuring');
  if (dominantEmotions.includes('sad')) responsePreferences.push('empathetic', 'hopeful');
  if (dominantEmotions.includes('angry')) responsePreferences.push('understanding', 'solution-focused');
  if (dominantEmotions.includes('confused')) responsePreferences.push('clear', 'step-by-step');

  return {
    dominantEmotions,
    emotionalTrends,
    responsePreferences: [...new Set(responsePreferences)] // Remove duplicates
  };
}

/**
 * Analyze topic preferences
 */
function analyzeTopics(messages: ChatMessage[]) {
  const topicCounts: Record<string, number> = {};
  const userMessages = messages.filter(m => m.role === 'user');

  // Count topic keywords
  userMessages.forEach(message => {
    const content = message.content.toLowerCase();
    Object.entries(TOPIC_CATEGORIES).forEach(([topic, keywords]) => {
      keywords.forEach(keyword => {
        if (content.includes(keyword.toLowerCase())) {
          topicCounts[topic] = (topicCounts[topic] || 0) + 1;
        }
      });
    });
  });

  // Get favorite topics (mentioned most)
  const favoriteTopics = Object.entries(topicCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([topic]) => topic);

  // Identify avoidances (topics mentioned with negative sentiment)
  const avoidances: string[] = [];
  // This is a simple heuristic - could be enhanced with sentiment analysis
  userMessages.forEach(message => {
    const content = message.content.toLowerCase();
    if (content.includes('hate') || content.includes('avoid') || content.includes('scared of')) {
      Object.keys(TOPIC_CATEGORIES).forEach(topic => {
        if (TOPIC_CATEGORIES[topic as keyof typeof TOPIC_CATEGORIES].some(keyword =>
          content.includes(keyword.toLowerCase())
        )) {
          avoidances.push(topic);
        }
      });
    }
  });

  return {
    interests: favoriteTopics,
    avoidances: [...new Set(avoidances)],
    favoriteTopics
  };
}

/**
 * Analyze communication style preferences
 */
function analyzeCommunicationStyle(messages: ChatMessage[]) {
  const userMessages = messages.filter(m => m.role === 'user');

  // Analyze message length
  const messageLengths = userMessages.map(m => m.content.length);
  const averageMessageLength = messageLengths.reduce((a, b) => a + b, 0) / messageLengths.length;

  let responseLength: 'brief' | 'moderate' | 'detailed' = 'moderate';
  if (averageMessageLength < 50) responseLength = 'brief';
  else if (averageMessageLength > 200) responseLength = 'detailed';

  // Analyze language complexity (simple heuristic based on word length and structure)
  let languageComplexity: 'simple' | 'moderate' | 'advanced' = 'moderate';
  const complexWords = ['however', 'therefore', 'consequently', 'moreover', 'furthermore', 'nevertheless'];
  const complexWordCount = userMessages.filter(m =>
    complexWords.some(word => m.content.toLowerCase().includes(word))
  ).length;

  if (complexWordCount > userMessages.length * 0.3) languageComplexity = 'advanced';
  else if (complexWordCount < userMessages.length * 0.1) languageComplexity = 'simple';

  // Analyze tone preference (based on question marks, exclamation points, etc.)
  let preferredTone: 'formal' | 'casual' | 'empathetic' | 'direct' = 'empathetic';

  const questionCount = userMessages.filter(m => m.content.includes('?')).length;
  const exclamationCount = userMessages.filter(m => m.content.includes('!')).length;
  const casualIndicators = ['hey', 'hi', 'thanks', 'okay', 'alright', 'yeah'];

  const casualUsage = userMessages.filter(m =>
    casualIndicators.some(indicator => m.content.toLowerCase().includes(indicator))
  ).length;

  if (casualUsage > userMessages.length * 0.4) preferredTone = 'casual';
  else if (questionCount > userMessages.length * 0.3) preferredTone = 'empathetic';
  else if (exclamationCount > userMessages.length * 0.2) preferredTone = 'direct';

  return {
    preferredTone,
    responseLength,
    languageComplexity
  };
}

/**
 * Analyze conversation patterns
 */
function analyzeConversationPatternsInternal(messages: ChatMessage[]) {
  const userMessages = messages.filter(m => m.role === 'user');

  // Average message length
  const messageLengths = userMessages.map(m => m.content.length);
  const averageMessageLength = messageLengths.reduce((a, b) => a + b, 0) / messageLengths.length;

  // Common phrases (simple extraction of repeated 2-3 word phrases)
  const commonPhrases: string[] = [];
  const phraseMap: Record<string, number> = {};

  userMessages.forEach(message => {
    const words = message.content.toLowerCase().split(/\s+/);
    for (let i = 0; i < words.length - 1; i++) {
      const phrase = words.slice(i, i + 2).join(' ');
      phraseMap[phrase] = (phraseMap[phrase] || 0) + 1;
    }
  });

  commonPhrases.push(...Object.entries(phraseMap)
    .filter(([, count]) => count > 1)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([phrase]) => phrase));

  // Time of day patterns
  const timeOfDayPattern: { hour: number; frequency: number }[] = [];
  const hourCounts: Record<number, number> = {};

  userMessages.forEach(message => {
    if (message.timestamp) {
      const hour = new Date(message.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }
  });

  Object.entries(hourCounts).forEach(([hour, frequency]) => {
    timeOfDayPattern.push({ hour: parseInt(hour), frequency });
  });

  timeOfDayPattern.sort((a, b) => b.frequency - a.frequency);

  // Session duration (rough estimate based on message timestamps)
  let sessionDuration = 0;
  if (messages.length > 1 && messages[0].timestamp && messages[messages.length - 1].timestamp) {
    sessionDuration = (messages[messages.length - 1].timestamp - messages[0].timestamp) / (1000 * 60); // minutes
  }

  return {
    averageMessageLength: Math.round(averageMessageLength),
    commonPhrases,
    timeOfDayPattern,
    sessionDuration: Math.round(sessionDuration)
  };
}

/**
 * Generate personalized context string for AI prompts
 */
function generatePersonalizedContext(
  emotionalProfile: any,
  topicPreferences: any,
  communicationStyle: any,
  conversationPatterns: any
): string {
  const parts = [];

  // Emotional context
  if (emotionalProfile.dominantEmotions.length > 0) {
    parts.push(`Often experiences ${emotionalProfile.dominantEmotions.join(', ')} emotions`);
  }

  // Response preferences
  if (emotionalProfile.responsePreferences.length > 0) {
    parts.push(`Preferred support style: ${emotionalProfile.responsePreferences.join(', ')}`);
  }

  // Topic interests
  if (topicPreferences.favoriteTopics.length > 0) {
    parts.push(`Topics of interest: ${topicPreferences.favoriteTopics.join(', ')}`);
  }

  // Communication style
  parts.push(`Communication preference: ${communicationStyle.responseLength} responses, ${communicationStyle.preferredTone} tone, ${communicationStyle.languageComplexity} language`);

  // Time patterns
  if (conversationPatterns.timeOfDayPattern.length > 0) {
    const peakHour = conversationPatterns.timeOfDayPattern[0].hour;
    const timeOfDay = peakHour >= 6 && peakHour < 12 ? 'morning' :
                     peakHour >= 12 && peakHour < 17 ? 'afternoon' :
                     peakHour >= 17 && peakHour < 22 ? 'evening' : 'night';
    parts.push(`Most active during ${timeOfDay}`);
  }

  return parts.join('. ') + '.';
}

/**
 * Get default pattern for users with insufficient data
 */
function getDefaultPattern(messageCount: number): ConversationPattern {
  return {
    emotionalProfile: {
      dominantEmotions: [],
      emotionalTrends: [],
      responsePreferences: ['empathetic', 'supportive']
    },
    topicPreferences: {
      interests: [],
      avoidances: [],
      favoriteTopics: []
    },
    communicationStyle: {
      preferredTone: 'empathetic',
      responseLength: 'moderate',
      languageComplexity: 'moderate'
    },
    conversationPatterns: {
      averageMessageLength: 0,
      commonPhrases: [],
      timeOfDayPattern: [],
      sessionDuration: 0
    },
    personalizedContext: 'New user with limited conversation history. Provide warm, welcoming support and encourage sharing.',
    lastUpdated: Date.now(),
    messageCount
  };
}

/**
 * Check if user has enough conversation data for meaningful personalization
 */
export function canPersonalize(): boolean {
  const messages = loadChatMessages();
  return messages.length >= 5; // Require at least 5 messages for personalization
}

/**
 * Get personalization status
 */
export function getPersonalizationStatus() {
  const messages = loadChatMessages();
  const canPersonalizeFlag = canPersonalize();

  return {
    messageCount: messages.length,
    canPersonalize: canPersonalizeFlag,
    nextMilestone: canPersonalizeFlag ? null : `${5 - messages.length} more conversations needed`,
    lastUpdated: messages.length > 0 ? messages[messages.length - 1].timestamp : null
  };
}