# AI Chatbot LSTM Personalization System

## Overview
This document describes the implementation of LSTM-based fine-tuning for the MindBridge AI chatbot, enabling personalized responses based on users' conversation history and patterns.

## Architecture

### 1. Data Flow
```
User Message → Conversation History → LSTM Feature Extraction → Personalization Context → Gemini API → Personalized Response
```

### 2. Components

#### A. Conversation History Tracking
- Store user conversation patterns in Convex
- Track emotional states, topics, preferences
- Maintain temporal context

#### B. LSTM Feature Extraction
- Analyze conversation patterns
- Extract user preferences and emotional states
- Generate personalization vectors

#### C. Context Enhancement
- Inject personalized context into prompts
- Maintain user profile understanding
- Adapt response style and tone

## Implementation Files

### Backend (API Routes)
- `app/api/chat/route.ts` - Enhanced with LSTM context
- `app/api/user-patterns/route.ts` - Pattern analysis endpoint
- `app/api/personalization/route.ts` - Personalization management

### Models
- `lib/ml/lstm-analyzer.ts` - LSTM-based pattern recognition
- `lib/ml/user-profiler.ts` - User profile builder
- `lib/ml/context-generator.ts` - Context enhancement

### Convex Functions
- `convex/conversations.ts` - Enhanced with pattern storage
- `convex/userPatterns.ts` - User pattern management

### Frontend
- Enhanced AI companion with personalization indicators

## Database Schema Extensions

### `userConversationPatterns` Table
```typescript
{
  userId: v.id("users"),
  emotionalProfile: {
    dominantEmotions: string[],
    emotionalTrends: {emotion: string, frequency: number}[],
    responsePreferences: string[]
  },
  topicPreferences: {
    interests: string[],
    avoidances: string[],
    favoriteTopics: string[]
  },
  communicationStyle: {
    preferredTone: "formal" | "casual" | "empathetic" | "direct",
    responseLength: "brief" | "moderate" | "detailed",
    languageComplexity: "simple" | "moderate" | "advanced"
  },
  conversationPatterns: {
    averageMessageLength: number,
    commonPhrases: string[],
    timeOfDayPattern: {hour: number, frequency: number}[],
    sessionDuration: number
  },
  personalizedContext: string, // LSTM-generated summary
  lastUpdated: number,
  version: number
}
```

### `conversationEmbeddings` Table
```typescript
{
  userId: v.id("users"),
  conversationId: v.id("conversations"),
  embeddingVector: number[], // LSTM feature vector
  timestamp: number,
  emotionalState: string,
  topics: string[]
}
```

## LSTM Model Architecture

### Model 1: Emotional Pattern Recognition
```
Input Layer (Message Embeddings) → 
LSTM Layer (128 units) → 
Dropout (0.3) → 
LSTM Layer (64 units) → 
Dense Layer (32 units) → 
Output Layer (Emotional State Vector)
```

**Purpose**: Identify user's emotional patterns and predict emotional states

### Model 2: Topic Preference Learning
```
Input Layer (Conversation History) → 
Bidirectional LSTM (256 units) → 
Attention Layer → 
Dense Layer (128 units) → 
Output Layer (Topic Preference Vector)
```

**Purpose**: Learn what topics user engages with most and prefers to discuss

### Model 3: Response Style Predictor
```
Input Layer (User Messages) → 
LSTM Layer (64 units) → 
Dense Layer (32 units) → 
Output Layer (Style Preferences)
```

**Purpose**: Predict preferred response style (brief/detailed, formal/casual, etc.)

## Features

### 1. Emotion-Aware Responses
- Tracks user's emotional journey across conversations
- Adapts tone based on current and past emotional states
- Recognizes emotional triggers and patterns

### 2. Topic Memory
- Remembers previous discussions
- References past conversations naturally
- Avoids repetitive advice

### 3. Personalized Communication Style
- Adapts formality based on user preference
- Adjusts response length
- Matches linguistic complexity

### 4. Temporal Context
- Considers time since last conversation
- Recognizes patterns in user activity
- Adjusts greeting and context accordingly

### 5. Crisis Pattern Recognition
- Identifies early warning signs from patterns
- Proactive support for at-risk users
- Enhanced crisis detection

## Usage Example

### Before Personalization
**User**: "I'm feeling anxious again"
**AI**: "I understand you're feeling anxious. Anxiety is a common emotion..."

### After LSTM Personalization
**User**: "I'm feeling anxious again"
**AI**: "I noticed you've been feeling anxious more frequently this week, especially in the evenings. Last time, you mentioned the breathing exercises helped. Would you like to try those again, or explore what might be triggering these feelings?"

## Privacy & Security

### Data Protection
- All conversation data encrypted at rest
- LSTM features stored separately from raw messages
- User control over pattern learning (opt-in/opt-out)

### Anonymization
- Pattern data anonymized for model training
- No raw messages used in aggregate analysis
- User can delete pattern data anytime

### Consent
- Explicit consent for personalization features
- Clear explanation of data usage
- Easy opt-out mechanism

## Performance Metrics

### Model Metrics
- **Emotional Accuracy**: Target 85%+
- **Topic Relevance**: Target 90%+
- **User Satisfaction**: Target 80%+ positive feedback

### System Metrics
- **Response Time**: <3s with personalization
- **Memory Usage**: <50MB per user session
- **Update Frequency**: Every 10 conversations

## Rollout Plan

### Phase 1: Foundation (Week 1-2)
- [x] Schema updates
- [ ] Basic pattern storage
- [ ] User profile builder

### Phase 2: LSTM Integration (Week 3-4)
- [ ] Implement LSTM models
- [ ] Feature extraction pipeline
- [ ] Testing and validation

### Phase 3: Personalization Engine (Week 5-6)
- [ ] Context generation
- [ ] API integration
- [ ] Frontend updates

### Phase 4: Testing & Refinement (Week 7-8)
- [ ] Beta testing with select users
- [ ] Model fine-tuning
- [ ] Performance optimization

### Phase 5: Production Release (Week 9)
- [ ] Full rollout
- [ ] Monitoring and metrics
- [ ] Continuous improvement

## Technical Requirements

### Dependencies
```json
{
  "@tensorflow/tfjs": "^4.20.0",
  "@tensorflow/tfjs-node": "^4.20.0",
  "natural": "^7.0.7",
  "sentiment": "^5.0.2",
  "compromise": "^14.13.0"
}
```

### Environment Variables
```
ENABLE_LSTM_PERSONALIZATION=true
LSTM_MODEL_PATH=/models/lstm
PATTERN_UPDATE_THRESHOLD=10
MIN_CONVERSATIONS_FOR_PERSONALIZATION=5
```

## Monitoring & Maintenance

### Metrics to Track
- Personalization accuracy
- User engagement improvement
- Response relevance scores
- System performance impact

### Alerts
- Model performance degradation
- High error rates in pattern extraction
- Privacy concern flags

---

**Status**: Implementation In Progress
**Last Updated**: October 14, 2025
**Next Review**: Weekly during development
