/**
 * LSTM-Based Pattern Analyzer for User Personalization
 * 
 * This module provides LSTM-based analysis of user conversation patterns
 * to enable personalized AI responses. It analyzes emotional states, topics,
 * communication styles, and temporal patterns.
 */

import * as tf from '@tensorflow/tfjs-node';
import natural from 'natural';
import Sentiment from 'sentiment';
import nlp from 'compromise';
import { removeStopwords, eng } from 'stopword';

const sentiment = new Sentiment();
const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;

// Emotion keywords mapping
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
  preferredTone: 'formal' | 'casual' | 'empathetic' | 'direct' | 'supportive';
  responseLength: 'brief' | 'moderate' | 'detailed';
  languageComplexity: 'simple' | 'moderate' | 'advanced';
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
  private emotionModel: tf.LayersModel | null = null;
  private topicModel: tf.LayersModel | null = null;
  private styleModel: tf.LayersModel | null = null;
  private vocabSize: number = 10000;
  private embeddingDim: number = 128;
  private maxSequenceLength: number = 100;

  constructor() {
    this.initializeModels();
  }

  /**
   * Initialize LSTM models for pattern recognition
   */
  private async initializeModels() {
    try {
      // Model 1: Emotional Pattern Recognition
      this.emotionModel = tf.sequential({
        layers: [
          tf.layers.embedding({
            inputDim: this.vocabSize,
            outputDim: this.embeddingDim,
            inputLength: this.maxSequenceLength,
          }),
          tf.layers.lstm({
            units: 128,
            returnSequences: true,
            dropout: 0.3,
          }),
          tf.layers.lstm({
            units: 64,
            returnSequences: false,
          }),
          tf.layers.dense({
            units: 32,
            activation: 'relu',
          }),
          tf.layers.dropout({ rate: 0.3 }),
          tf.layers.dense({
            units: Object.keys(EMOTION_KEYWORDS).length,
            activation: 'softmax',
          }),
        ],
      });

      this.emotionModel.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy'],
      });

      // Model 2: Topic Preference Learning (Bidirectional LSTM)
      this.topicModel = tf.sequential({
        layers: [
          tf.layers.embedding({
            inputDim: this.vocabSize,
            outputDim: this.embeddingDim,
            inputLength: this.maxSequenceLength,
          }),
          tf.layers.bidirectional({
            layer: tf.layers.lstm({
              units: 128,
              returnSequences: true,
            }),
          }),
          tf.layers.globalAveragePooling1d(),
          tf.layers.dense({
            units: 64,
            activation: 'relu',
          }),
          tf.layers.dense({
            units: 32,
            activation: 'sigmoid',
          }),
        ],
      });

      this.topicModel.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'binaryCrossentropy',
        metrics: ['accuracy'],
      });

      // Model 3: Response Style Predictor
      this.styleModel = tf.sequential({
        layers: [
          tf.layers.embedding({
            inputDim: this.vocabSize,
            outputDim: 64,
            inputLength: this.maxSequenceLength,
          }),
          tf.layers.lstm({
            units: 64,
            returnSequences: false,
          }),
          tf.layers.dense({
            units: 32,
            activation: 'relu',
          }),
          tf.layers.dense({
            units: 3, // [tone, length, complexity]
            activation: 'softmax',
          }),
        ],
      });

      this.styleModel.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy'],
      });

      console.log('LSTM models initialized successfully');
    } catch (error) {
      console.error('Error initializing LSTM models:', error);
    }
  }

  /**
   * Analyze user conversation history and extract patterns
   */
  async analyzeConversations(
    conversations: ConversationMessage[][],
    userId: string
  ): Promise<UserPattern> {
    const userMessages = this.extractUserMessages(conversations);
    
    // Parallel analysis of different aspects
    const [
      emotionalProfile,
      topicPreferences,
      communicationStyle,
      conversationPatterns,
    ] = await Promise.all([
      this.analyzeEmotionalProfile(userMessages),
      this.analyzeTopicPreferences(userMessages),
      this.analyzeCommunicationStyle(userMessages),
      this.analyzeConversationPatterns(conversations),
    ]);

    // Generate personalized context summary
    const personalizedContext = this.generatePersonalizedContext({
      emotionalProfile,
      topicPreferences,
      communicationStyle,
      conversationPatterns,
    });

    return {
      emotionalProfile,
      topicPreferences,
      communicationStyle,
      conversationPatterns,
      personalizedContext,
    };
  }

  /**
   * Extract user messages from conversations
   */
  private extractUserMessages(conversations: ConversationMessage[][]): string[] {
    return conversations
      .flat()
      .filter((msg) => msg.role === 'user')
      .map((msg) => msg.content);
  }

  /**
   * Analyze emotional profile using NLP and pattern recognition
   */
  private async analyzeEmotionalProfile(messages: string[]): Promise<EmotionalProfile> {
    const emotionCounts: Record<string, number[]> = {};
    
    messages.forEach((message, index) => {
      const lowerMessage = message.toLowerCase();
      const sentimentResult = sentiment.analyze(message);
      
      // Detect emotions based on keywords
      Object.entries(EMOTION_KEYWORDS).forEach(([emotion, keywords]) => {
        const hasEmotion = keywords.some((keyword) => lowerMessage.includes(keyword));
        if (hasEmotion) {
          if (!emotionCounts[emotion]) {
            emotionCounts[emotion] = [];
          }
          emotionCounts[emotion].push(Date.now() - (messages.length - index) * 86400000);
        }
      });

      // Use sentiment score to detect general mood
      if (sentimentResult.score < -2) {
        emotionCounts['sad'] = emotionCounts['sad'] || [];
        emotionCounts['sad'].push(Date.now() - (messages.length - index) * 86400000);
      } else if (sentimentResult.score > 2) {
        emotionCounts['happy'] = emotionCounts['happy'] || [];
        emotionCounts['happy'].push(Date.now() - (messages.length - index) * 86400000);
      }
    });

    // Calculate dominant emotions
    const emotionalTrends = Object.entries(emotionCounts)
      .map(([emotion, occurrences]) => ({
        emotion,
        frequency: occurrences.length / messages.length,
        recentOccurrences: occurrences.slice(-5),
      }))
      .sort((a, b) => b.frequency - a.frequency);

    const dominantEmotions = emotionalTrends
      .slice(0, 3)
      .map((trend) => trend.emotion);

    // Determine response preferences based on emotions
    const responsePreferences = this.determineResponsePreferences(dominantEmotions);

    return {
      dominantEmotions,
      emotionalTrends,
      responsePreferences,
    };
  }

  /**
   * Analyze topic preferences using TF-IDF and NLP
   */
  private async analyzeTopicPreferences(messages: string[]): Promise<TopicPreferences> {
    const tfidf = new TfIdf();
    messages.forEach((message) => tfidf.addDocument(message));

    // Extract key topics using TF-IDF
    const topicScores: Record<string, number> = {};
    
    messages.forEach((message, docIndex) => {
      const doc = nlp(message);
      const topics = doc.topics().out('array');
      
      topics.forEach((topic: string) => {
        const cleanTopic = topic.toLowerCase();
        tfidf.tfidfs(cleanTopic, docIndex, (i, measure) => {
          topicScores[cleanTopic] = (topicScores[cleanTopic] || 0) + measure;
        });
      });
    });

    const sortedTopics = Object.entries(topicScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    const favoriteTopics = sortedTopics.map(([topic, score]) => ({
      topic,
      engagementScore: Math.min(score / 10, 1), // Normalize to 0-1
    }));

    const interests = sortedTopics.slice(0, 5).map(([topic]) => topic);
    const avoidances: string[] = []; // Would need negative feedback data

    return {
      interests,
      avoidances,
      favoriteTopics,
    };
  }

  /**
   * Analyze communication style preferences
   */
  private async analyzeCommunicationStyle(messages: string[]): Promise<CommunicationStyle> {
    // Analyze message lengths
    const avgLength = messages.reduce((sum, msg) => sum + msg.length, 0) / messages.length;
    
    const responseLength: 'brief' | 'moderate' | 'detailed' =
      avgLength < 50 ? 'brief' : avgLength < 150 ? 'moderate' : 'detailed';

    // Analyze formality
    let formalityScore = 0;
    const formalWords = ['please', 'thank', 'kindly', 'appreciate', 'sincerely'];
    const casualWords = ['hey', 'yeah', 'gonna', 'wanna', 'gotta', 'like'];
    
    messages.forEach((message) => {
      const lower = message.toLowerCase();
      formalWords.forEach((word) => {
        if (lower.includes(word)) formalityScore += 1;
      });
      casualWords.forEach((word) => {
        if (lower.includes(word)) formalityScore -= 1;
      });
    });

    const preferredTone = this.determineTone(formalityScore, messages.length);

    // Analyze language complexity
    const avgWordsPerSentence = messages.reduce((sum, msg) => {
      const sentences = msg.split(/[.!?]+/).filter(Boolean);
      const words = msg.split(/\s+/).filter(Boolean);
      return sum + (words.length / Math.max(sentences.length, 1));
    }, 0) / messages.length;

    const languageComplexity: 'simple' | 'moderate' | 'advanced' =
      avgWordsPerSentence < 10 ? 'simple' : avgWordsPerSentence < 20 ? 'moderate' : 'advanced';

    return {
      preferredTone,
      responseLength,
      languageComplexity,
    };
  }

  /**
   * Analyze conversation patterns (timing, frequency, etc.)
   */
  private async analyzeConversationPatterns(
    conversations: ConversationMessage[][]
  ): Promise<ConversationPatterns> {
    const allMessages = conversations.flat();
    const userMessages = allMessages.filter((msg) => msg.role === 'user');

    // Average message length
    const averageMessageLength = userMessages.reduce((sum, msg) => sum + msg.content.length, 0) / userMessages.length;

    // Extract common phrases (2-3 word n-grams)
    const phrases: Record<string, number> = {};
    userMessages.forEach((msg) => {
      const words = tokenizer.tokenize(msg.content.toLowerCase()) || [];
      const filtered = removeStopwords(words, eng);
      
      for (let i = 0; i < filtered.length - 1; i++) {
        const bigram = `${filtered[i]} ${filtered[i + 1]}`;
        phrases[bigram] = (phrases[bigram] || 0) + 1;
      }
    });

    const commonPhrases = Object.entries(phrases)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([phrase]) => phrase);

    // Time of day pattern
    const hourCounts: Record<number, number> = {};
    allMessages.forEach((msg) => {
      const hour = new Date(msg.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const timeOfDayPattern = Object.entries(hourCounts)
      .map(([hour, frequency]) => ({
        hour: parseInt(hour),
        frequency: frequency / allMessages.length,
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);

    // Session duration (average time between first and last message in a conversation)
    const sessionDurations = conversations.map((conv) => {
      if (conv.length < 2) return 0;
      const first = conv[0].timestamp;
      const last = conv[conv.length - 1].timestamp;
      return (last - first) / 1000; // Convert to seconds
    });

    const sessionDuration = sessionDurations.reduce((sum, dur) => sum + dur, 0) / sessionDurations.length;

    // Conversation frequency (estimate based on timestamps)
    const conversationFrequency = conversations.length; // Simplified

    return {
      averageMessageLength,
      commonPhrases,
      timeOfDayPattern,
      sessionDuration,
      conversationFrequency,
    };
  }

  /**
   * Generate personalized context summary for AI prompt injection
   */
  private generatePersonalizedContext(pattern: Omit<UserPattern, 'personalizedContext'>): string {
    const { emotionalProfile, topicPreferences, communicationStyle, conversationPatterns } = pattern;

    const contextParts = [];

    // Emotional context
    if (emotionalProfile.dominantEmotions.length > 0) {
      contextParts.push(
        `User's emotional state: Often experiences ${emotionalProfile.dominantEmotions.slice(0, 2).join(' and ')} emotions.`
      );
      contextParts.push(
        `Preferred support style: ${emotionalProfile.responsePreferences.join(', ')}.`
      );
    }

    // Topic context
    if (topicPreferences.interests.length > 0) {
      contextParts.push(
        `Topics of interest: ${topicPreferences.interests.slice(0, 3).join(', ')}.`
      );
    }

    // Communication style context
    contextParts.push(
      `Communication preference: ${communicationStyle.preferredTone} tone, ${communicationStyle.responseLength} responses, ${communicationStyle.languageComplexity} language.`
    );

    // Pattern context
    if (conversationPatterns.commonPhrases.length > 0) {
      contextParts.push(
        `User often mentions: ${conversationPatterns.commonPhrases.slice(0, 2).join(', ')}.`
      );
    }

    // Activity pattern
    const topHours = conversationPatterns.timeOfDayPattern.slice(0, 2);
    if (topHours.length > 0) {
      const hourDescription = topHours
        .map((h) => {
          if (h.hour < 12) return 'morning';
          if (h.hour < 17) return 'afternoon';
          if (h.hour < 21) return 'evening';
          return 'night';
        })
        .join(' and ');
      contextParts.push(`Most active during ${hourDescription}.`);
    }

    return contextParts.join(' ');
  }

  /**
   * Determine response preferences based on dominant emotions
   */
  private determineResponsePreferences(emotions: string[]): string[] {
    const preferences: string[] = [];

    if (emotions.includes('anxious') || emotions.includes('stressed')) {
      preferences.push('calming', 'reassuring', 'grounding techniques');
    }
    if (emotions.includes('sad') || emotions.includes('lonely')) {
      preferences.push('empathetic', 'validating', 'companionship-focused');
    }
    if (emotions.includes('confused') || emotions.includes('uncertain')) {
      preferences.push('clarifying', 'structured', 'step-by-step guidance');
    }
    if (emotions.includes('hopeful') || emotions.includes('happy')) {
      preferences.push('encouraging', 'positive reinforcement', 'growth-oriented');
    }

    return preferences.length > 0 ? preferences : ['supportive', 'empathetic'];
  }

  /**
   * Determine preferred tone based on formality score
   */
  private determineTone(
    formalityScore: number,
    messageCount: number
  ): 'formal' | 'casual' | 'empathetic' | 'direct' | 'supportive' {
    const normalizedScore = formalityScore / messageCount;

    if (normalizedScore > 0.5) return 'formal';
    if (normalizedScore < -0.5) return 'casual';
    
    // Default to supportive/empathetic for mental wellness context
    return 'supportive';
  }

  /**
   * Create embedding vector for a conversation
   */
  async createEmbedding(messages: ConversationMessage[]): Promise<number[]> {
    const userMessages = messages
      .filter((msg) => msg.role === 'user')
      .map((msg) => msg.content)
      .join(' ');

    // Simple embedding using word frequencies (can be enhanced with word2vec)
    const words = tokenizer.tokenize(userMessages.toLowerCase()) || [];
    const filtered = removeStopwords(words, eng);
    
    const wordFreq: Record<string, number> = {};
    filtered.forEach((word) => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    // Create a fixed-size embedding vector (128 dimensions)
    const embedding = new Array(128).fill(0);
    const sortedWords = Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 64);

    sortedWords.forEach(([word, freq], index) => {
      embedding[index * 2] = word.charCodeAt(0) / 255; // Simple encoding
      embedding[index * 2 + 1] = Math.min(freq / 10, 1); // Normalized frequency
    });

    return embedding;
  }

  /**
   * Cleanup models when done
   */
  async dispose() {
    if (this.emotionModel) await this.emotionModel.dispose();
    if (this.topicModel) await this.topicModel.dispose();
    if (this.styleModel) await this.styleModel.dispose();
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
