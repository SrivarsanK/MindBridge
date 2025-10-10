# MindBridge - Privacy-First Mental Wellness Platform

## 🌉 Overview

MindBridge is a production-ready, privacy-first mental wellness platform designed specifically for student mental health support. The platform provides anonymous peer connections, AI-powered chatbot support, dream analysis, and real-time crisis detection while maintaining absolute data privacy and security.

## ✨ Key Features

### 1. **Authentication & User Management**
- Anonymous session support via Convex Auth
- Role-based access control (student, moderator, crisis responder)
- Encrypted user profiles with granular privacy settings
- Comprehensive audit logging for all privacy-related actions

### 2. **AI Chatbot Backend**
- OpenAI GPT-4.1-nano integration with streaming responses
- Real-time crisis detection via keyword and sentiment analysis
- Context-aware multi-turn conversations
- Encrypted message storage
- Rate limiting to prevent abuse
- Conversation export with user consent

### 3. **Dream Analysis**
- Encrypted dream metadata storage
- Emotional pattern recognition
- Recurring theme tracking
- Stress indicator analysis
- Visualization data generation (emotional weather, theme evolution)
- Privacy-compliant data export

### 4. **Anonymous Peer Networking**
- AI-powered peer matching based on:
  - Current mood
  - Loneliness level
  - Timezone compatibility
  - Shared interests
- End-to-end encrypted real-time messaging
- AI-generated context-aware ice-breakers
- Automated content moderation
- Emergency exit and reporting mechanisms

### 5. **Crisis Detection & Management**
- Multi-source crisis detection:
  - Chat conversations
  - Dream analysis
  - Peer reports
  - Manual triggers
- Graduated response system:
  - Self-help resources
  - Peer support
  - Counselor notification
  - Emergency intervention
- Professional notification system
- Follow-up tracking
- Comprehensive audit logging

### 6. **Privacy & Security**
- GDPR/CCPA compliant
- Data export functionality
- Data deletion with retention policies
- Comprehensive audit trails
- Granular user consent management
- Privacy impact assessments

## 🏗️ Architecture

### Backend Stack
- **Database**: Convex (real-time, reactive)
- **Authentication**: Convex Auth
- **AI**: OpenAI GPT-4.1-nano
- **Functions**: Convex queries, mutations, and actions

### Frontend Stack
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: Convex React hooks
- **Notifications**: Sonner

### Database Schema

#### Core Tables
- `userProfiles` - User profiles with privacy settings
- `conversations` - AI chatbot conversations
- `chatMessages` - Individual chat messages
- `dreamAnalysis` - Dream analysis records
- `peerMatches` - Peer matching records
- `peerMessages` - Peer-to-peer messages
- `crisisEvents` - Crisis detection events

#### Supporting Tables
- `auditLogs` - Comprehensive audit trail
- `rateLimits` - Rate limiting enforcement
- `systemMetrics` - Performance monitoring
- `dataExportRequests` - GDPR/CCPA export requests
- `dataDeletionRequests` - GDPR/CCPA deletion requests
- `moderationQueue` - Content moderation queue

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Convex account

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd mindbridge
```

2. Install dependencies
```bash
npm install
```

3. Set up Convex
```bash
npx convex dev
```

4. Start the development server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔐 Security Features

### Encryption
- All sensitive data is encrypted at rest
- End-to-end encryption for peer messages
- Encrypted conversation storage
- Secure credential management

### Access Control
- Role-based access control (RBAC)
- Function-level authorization
- Resource-level permissions
- Audit logging for all access

### Privacy Compliance
- GDPR Article 17 (Right to erasure)
- GDPR Article 20 (Data portability)
- CCPA compliance
- Privacy by design principles

### Rate Limiting
- Per-user rate limits
- Per-endpoint rate limits
- Sliding window algorithm
- Automatic blocking for abuse

## 📊 Monitoring & Metrics

### System Metrics
- Response times
- Error rates
- Active connections
- Crisis response times
- User satisfaction scores

### Audit Logging
- All data access events
- Privacy settings changes
- Crisis events
- Moderation actions
- Data export/deletion requests

## 🔧 Configuration

### Environment Variables
```env
CONVEX_DEPLOYMENT=<your-deployment>
VITE_CONVEX_URL=<your-convex-url>
CONVEX_OPENAI_API_KEY=<bundled-or-your-key>
CONVEX_OPENAI_BASE_URL=<bundled-or-your-url>
```

### Privacy Settings
Users can configure:
- Peer matching opt-in/out
- Dream analysis opt-in/out
- Emotional pattern sharing
- Data retention period (30-365 days)

## 🧪 Testing

### Unit Tests
```bash
npm run test:unit
```

### Integration Tests
```bash
npm run test:integration
```

### Load Testing
```bash
npm run test:load
```

## 📈 Performance

### Targets
- Sub-100ms response times for queries
- Sub-500ms response times for mutations
- Support for 10K+ concurrent users
- 99.9% uptime SLA

### Optimization Strategies
- Indexed database queries
- Efficient pagination
- Caching strategies
- Connection pooling
- Horizontal scaling

## 🚨 Crisis Response Protocol

### Detection Levels
1. **Low**: Self-help resources provided
2. **Medium**: Peer support recommended
3. **High**: Counselor notification sent
4. **Critical**: Emergency intervention triggered

### Response Times
- Critical events: Immediate notification
- High events: < 5 minutes
- Medium events: < 30 minutes
- Low events: < 2 hours

## 📱 API Documentation

### Public Endpoints

#### Authentication
- `auth.loggedInUser` - Get current user

#### User Management
- `users.createOrUpdateProfile` - Create/update profile
- `users.getCurrentProfile` - Get current profile
- `users.updatePrivacySettings` - Update privacy settings

#### Chatbot
- `chatbot.createConversation` - Start new conversation
- `chatbot.getUserConversations` - List conversations
- `chatbot.getConversationMessages` - Get messages
- `chatbot.sendMessage` - Send message

#### Peer Matching
- `peerMatching.requestPeerMatch` - Request match
- `peerMatching.getActiveMatches` - Get active matches
- `peerMatching.sendPeerMessage` - Send peer message
- `peerMatching.getPeerMessages` - Get peer messages
- `peerMatching.endPeerMatch` - End match
- `peerMatching.reportPeerMatch` - Report match

#### Dream Analysis
- `dreamAnalysis.createDreamAnalysis` - Create analysis
- `dreamAnalysis.getUserDreamAnalyses` - Get analyses
- `dreamAnalysis.getEmotionalPatterns` - Get patterns

#### Crisis Management
- `crisis.getUserCrisisHistory` - Get crisis history
- `crisis.triggerManualCrisis` - Manual crisis trigger

#### Privacy
- `privacy.requestDataExport` - Request data export
- `privacy.requestDataDeletion` - Request data deletion
- `privacy.getAuditLogs` - Get audit logs

## 🛠️ Development

### Code Structure
```
/convex
  /schema.ts          - Database schema
  /auth.ts            - Authentication config
  /users.ts           - User management
  /chatbot.ts         - AI chatbot logic
  /peerMatching.ts    - Peer matching logic
  /dreamAnalysis.ts   - Dream analysis logic
  /crisis.ts          - Crisis detection
  /privacy.ts         - Privacy management
  /metrics.ts         - System metrics
  /moderation.ts      - Content moderation

/src
  /components         - React components
  /lib                - Utility functions
  App.tsx             - Main application
  main.tsx            - Entry point
```

### Best Practices
- Always validate user input
- Use TypeScript for type safety
- Implement proper error handling
- Log all security-relevant events
- Follow privacy by design principles
- Test thoroughly before deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

### Emergency Resources
- **National Suicide Prevention Lifeline**: 988
- **Crisis Text Line**: Text HELLO to 741741
- **International**: https://www.iasp.info/resources/Crisis_Centres/

### Technical Support
- Email: support@mindbridge.app
- Documentation: https://docs.mindbridge.app
- Community: https://community.mindbridge.app

## 🙏 Acknowledgments

- OpenAI for GPT-4.1-nano API
- Convex for real-time database
- All contributors and supporters

---

**Built with ❤️ for student mental health**
