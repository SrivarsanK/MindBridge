/**
 * Google Gemini-Based Pattern Analyzer for User Personalization
 *
 * This module provides AI-powered analysis of user conversation patterns
 * using Google Gemini to enable personalized AI responses. It analyzes
 * emotional states, topics, communication styles, and temporal patterns.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import Sentiment from 'sentiment';
import nlp from 'compromise';
import { removeStopwords, eng } from 'stopword';

const sentiment = new Sentiment();

// Simple tokenizer function (replacement for natural.WordTokenizer)
function tokenize(text: string): string[] {
  return text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0);
}

// Simple TF-IDF implementation
class SimpleTfIdf {
  private documents: string[][] = [];
  private termFrequency: Map<string, number> = new Map();
  private documentFrequency: Map<string, number> = new Map();

  addDocument(tokens: string[]): void {
    this.documents.push(tokens);
    const uniqueTerms = new Set(tokens);

    uniqueTerms.forEach(term => {
      this.documentFrequency.set(term, (this.documentFrequency.get(term) || 0) + 1);
    });
  }

  getTopTerms(docIndex: number, limit: number = 5): Array<{ term: string; tfidf: number }> {
    const doc = this.documents[docIndex];
    if (!doc) return [];

    const termCounts = new Map<string, number>();
    doc.forEach(term => {
      termCounts.set(term, (termCounts.get(term) || 0) + 1);
    });

    const results: Array<{ term: string; tfidf: number }> = [];

    termCounts.forEach((count, term) => {
      const tf = count / doc.length;
      const idf = Math.log(this.documents.length / (this.documentFrequency.get(term) || 1));
      const tfidf = tf * idf;
      results.push({ term, tfidf });
    });

    return results
      .sort((a, b) => b.tfidf - a.tfidf)
      .slice(0, limit);
  }
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Emotion keywords mapping (fallback)
const EMOTION_KEYWORDS = {
  anxious: ['anxious', 'worried', 'nervous', 'stressed', 'tense', 'uneasy', 'fearful'],
  sad: ['sad', 'depressed', 'down', 'unhappy', 'miserable', 'gloomy', 'melancholy'],
  angry: ['angry', 'furious', 'annoyed', 'irritated', 'frustrated', 'mad'],
  happy: ['happy', 'joyful', 'excited', 'pleased', 'delighted', 'cheerful'],
  hopeful: ['hopeful', 'optimistic', 'positive', 'encouraged', 'confident'],
  lonely: ['lonely', 'isolated', 'alone', 'disconnected', 'abandoned'],
  confused: ['confused', 'uncertain', 'lost', 'unclear', 'puzzled'],
  calm: ['calm', 'peaceful', 'relaxed', 'serene', 'tranquil'],
};

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface EmotionalProfile {
  dominantEmotions: string[];
  emotionalTrends: Array<{
    emotion: string;
    frequency: number;
    recentOccurrences: number[];
  }>;
  responsePreferences: string[];
}

export interface TopicPreferences {
  interests: string[];
  avoidances: string[];
  favoriteTopics: Array<{
    topic: string;
    engagementScore: number;
  }>;
}

export interface CommunicationStyle {
  tone: string;
  verbosity: string;
  preferredResponseLength: string;
  communicationPatterns: string[];
  supportNeeds: string[];
}

export interface ConversationPatterns {
  averageMessageLength: number;
  commonPhrases: string[];
  timeOfDayPattern: Array<{ hour: number; frequency: number }>;
  sessionDuration: number;
  conversationFrequency: number;
}

export interface UserPattern {
  emotionalProfile: EmotionalProfile;
  topicPreferences: TopicPreferences;
  communicationStyle: CommunicationStyle;
  conversationPatterns: ConversationPatterns;
  personalizedContext: string;
}

export class LSTMPatternAnalyzer {
  constructor() {
    // No initialization needed for Gemini
  }

  /**
   * Analyze user conversation patterns using Google Gemini
   */
  async analyzePatterns(conversations: ConversationMessage[]): Promise<{
    emotionalProfile: EmotionalProfile;
    topicPreferences: TopicPreferences;
    communicationStyle: CommunicationStyle;
    personalizationEnabled: boolean;
  }> {
    try {
      // Prepare conversation history for Gemini
      const conversationText = conversations
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n\n');

      // Create comprehensive analysis prompt
      const analysisPrompt = `
You are an expert psychologist analyzing conversation patterns for personalized mental health support.

Analyze the following conversation history and provide a detailed psychological profile:

CONVERSATION HISTORY:
${conversationText}

Please provide a comprehensive analysis in the following JSON format:
{
  "emotionalProfile": {
    "dominantEmotions": ["emotion1", "emotion2", "emotion3"],
    "emotionalTrends": [
      {"emotion": "emotion_name", "frequency": 0.0, "recentOccurrences": [timestamp1, timestamp2]}
    ],
    "responsePreferences": ["preference1", "preference2"]
  },
  "topicPreferences": {
    "interests": ["topic1", "topic2", "topic3"],
    "avoidances": ["topic_to_avoid1", "topic_to_avoid2"],
    "favoriteTopics": [
      {"topic": "topic_name", "engagementScore": 0.0}
    ]
  },
  "communicationStyle": {
    "tone": "formal/casual/supportive/direct",
    "verbosity": "concise/detailed/verbose",
    "preferredResponseLength": "short/medium/long",
    "communicationPatterns": ["pattern1", "pattern2"],
    "supportNeeds": ["need1", "need2"]
  },
  "personalizationEnabled": true
}

Focus on:
- Emotional patterns and triggers
- Topics of interest and avoidance
- Communication preferences
- Support needs and coping mechanisms
- Recovery-related patterns

Be specific and evidence-based in your analysis.`;

      const result = await model.generateContent(analysisPrompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from Gemini');
      }

      const analysis = JSON.parse(jsonMatch[0]);

      return {
        emotionalProfile: analysis.emotionalProfile,
        topicPreferences: analysis.topicPreferences,
        communicationStyle: analysis.communicationStyle,
        personalizationEnabled: analysis.personalizationEnabled
      };

    } catch (error) {
      console.error('Gemini analysis failed:', error);
      // Fallback to basic analysis
      return this.fallbackAnalysis(conversations);
    }
  }

  /**
   * Fallback analysis using traditional NLP when Gemini fails
   */
  private fallbackAnalysis(conversations: ConversationMessage[]): {
    emotionalProfile: EmotionalProfile;
    topicPreferences: TopicPreferences;
    communicationStyle: CommunicationStyle;
    personalizationEnabled: boolean;
  } {
    // Extract emotions using sentiment analysis
    const allText = conversations.map(c => c.content).join(' ');
    const sentimentResult = sentiment.analyze(allText);

    // Extract topics using TF-IDF
    const tfidf = new SimpleTfIdf();
    conversations.forEach(conv => {
      const tokens = tokenize(conv.content);
      const cleanTokens = removeStopwords(tokens, eng);
      tfidf.addDocument(cleanTokens);
    });

    // Get dominant emotions
    const emotionCounts: Record<string, number> = {};
    conversations.forEach(conv => {
      const text = conv.content.toLowerCase();
      Object.entries(EMOTION_KEYWORDS).forEach(([emotion, keywords]) => {
        keywords.forEach(keyword => {
          if (text.includes(keyword)) {
            emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
          }
        });
      });
    });

    const dominantEmotions = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([emotion]) => emotion);

    // Extract topics
    const topics: string[] = [];
    conversations.forEach((conv, index) => {
      const topTerms = tfidf.getTopTerms(index, 5);
      topTerms.forEach(item => {
        if (item.term.length > 3 && !topics.includes(item.term)) {
          topics.push(item.term);
        }
      });
    });

    return {
      emotionalProfile: {
        dominantEmotions,
        emotionalTrends: dominantEmotions.map(emotion => ({
          emotion,
          frequency: emotionCounts[emotion] / conversations.length,
          recentOccurrences: conversations
            .filter(c => c.content.toLowerCase().includes(emotion))
            .slice(-3)
            .map(c => c.timestamp)
        })),
        responsePreferences: ['supportive', 'empathetic', 'practical']
      },
      topicPreferences: {
        interests: topics.slice(0, 5),
        avoidances: [],
        favoriteTopics: topics.slice(0, 3).map(topic => ({
          topic,
          engagementScore: 0.5
        }))
      },
      communicationStyle: {
        tone: 'supportive',
        verbosity: 'balanced',
        preferredResponseLength: 'medium',
        communicationPatterns: ['direct', 'honest'],
        supportNeeds: ['emotional_support', 'practical_advice']
      },
      personalizationEnabled: true
    };
  }

  /**
   * Generate personalized response suggestions using Gemini
   */
  async generatePersonalizedResponse(
    userMessage: string,
    conversationHistory: ConversationMessage[],
    userProfile: {
      emotionalProfile: EmotionalProfile;
      communicationStyle: CommunicationStyle;
    }
  ): Promise<string> {
    try {
      const historyText = conversationHistory
        .slice(-5) // Last 5 messages for context
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');

      const personalizationPrompt = `
You are a personalized mental health support AI. Use the user's profile to provide tailored, empathetic responses.

USER PROFILE:
- Dominant emotions: ${userProfile.emotionalProfile.dominantEmotions.join(', ')}
- Communication style: ${userProfile.communicationStyle.tone}, ${userProfile.communicationStyle.verbosity}
- Support needs: ${userProfile.communicationStyle.supportNeeds.join(', ')}

RECENT CONVERSATION:
${historyText}

CURRENT USER MESSAGE: "${userMessage}"

Provide a personalized, supportive response that:
1. Acknowledges their current emotional state
2. Uses their preferred communication style
3. Addresses their specific support needs
4. Offers practical, evidence-based suggestions
5. Maintains appropriate boundaries as an AI support system

Keep the response conversational, empathetic, and focused on recovery support.`;

      const result = await model.generateContent(personalizationPrompt);
      const response = await result.response;
      return response.text().trim();

    } catch (error) {
      console.error('Personalized response generation failed:', error);
      return "I'm here to support you. How are you feeling right now, and what would be most helpful for you?";
    }
  }

  /**
   * Cleanup (no-op for Gemini)
   */
  async dispose() {
    // No cleanup needed for Gemini
  }
}

// Singleton instance
let analyzerInstance: LSTMPatternAnalyzer | null = null;

export function getLSTMAnalyzer(): LSTMPatternAnalyzer {
  if (!analyzerInstance) {
    analyzerInstance = new LSTMPatternAnalyzer();
  }
  return analyzerInstance;
}
