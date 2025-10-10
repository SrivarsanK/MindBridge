# MindBridge Deployment Guide

## 🚀 Production Deployment

### Prerequisites
- Convex production deployment
- OpenAI API key (optional, bundled key available)
- Domain name (optional)
- SSL certificate (handled by Convex)

### Step 1: Convex Production Setup

1. Create a production deployment:
```bash
npx convex deploy --prod
```

2. Set environment variables in Convex dashboard:
   - Navigate to Settings → Environment Variables
   - Add required variables:
     - `CONVEX_OPENAI_API_KEY` (if using your own)
     - `CONVEX_OPENAI_BASE_URL` (if using your own)

### Step 2: Build Frontend

```bash
npm run build
```

### Step 3: Deploy Frontend

#### Option A: Vercel
```bash
npm install -g vercel
vercel --prod
```

#### Option B: Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

#### Option C: Custom Server
```bash
# Build the app
npm run build

# Serve the dist folder
npx serve dist
```

### Step 4: Configure Domain

1. Add your domain in Convex dashboard
2. Update DNS records
3. Enable HTTPS (automatic with Convex)

### Step 5: Monitoring Setup

1. Enable Convex monitoring in dashboard
2. Set up alerts for:
   - High error rates
   - Slow response times
   - Crisis events
   - System downtime

### Step 6: Backup Strategy

1. Enable automatic backups in Convex
2. Set retention policy (recommended: 30 days)
3. Test restore procedures

## 🔒 Security Checklist

- [ ] Environment variables configured
- [ ] HTTPS enabled
- [ ] Rate limiting active
- [ ] Audit logging enabled
- [ ] Crisis notification system tested
- [ ] Data encryption verified
- [ ] Access controls configured
- [ ] Backup system operational

## 📊 Performance Optimization

### Database Indexes
All required indexes are automatically created from schema:
- User lookups by ID
- Conversation queries by user
- Message queries by conversation
- Crisis events by status and severity
- Peer matches by user and status

### Caching Strategy
- Use Convex's built-in caching
- Implement client-side caching for static data
- Cache AI responses when appropriate

### Load Balancing
- Convex handles automatic scaling
- No additional configuration needed
- Supports 10K+ concurrent users

## 🧪 Testing in Production

### Smoke Tests
```bash
# Test authentication
curl https://your-domain.com/api/auth/status

# Test health endpoint
curl https://your-domain.com/api/health
```

### Load Testing
```bash
# Install k6
brew install k6

# Run load test
k6 run loadtest.js
```

### Crisis Response Testing
1. Create test user
2. Trigger manual crisis
3. Verify notification delivery
4. Check response times

## 📈 Monitoring Dashboards

### Convex Dashboard
- Real-time function calls
- Error rates
- Response times
- Database queries

### Custom Metrics
Access via `metrics.getSystemMetrics`:
- Response times
- Error rates
- Active connections
- Crisis response times
- User satisfaction

## 🔄 Rollback Procedure

If issues occur:

1. Revert Convex deployment:
```bash
npx convex deploy --prod --rollback
```

2. Revert frontend deployment:
```bash
# Vercel
vercel rollback

# Netlify
netlify rollback
```

## 🆘 Incident Response

### Critical Issues
1. Check Convex dashboard for errors
2. Review audit logs
3. Check system metrics
4. Notify team via Slack/PagerDuty
5. Implement fix
6. Post-mortem analysis

### Crisis Event Escalation
1. Monitor crisis events dashboard
2. Verify notification delivery
3. Check responder availability
4. Escalate to on-call team if needed

## 📞 Support Contacts

- **Technical Issues**: tech@mindbridge.app
- **Crisis Response**: crisis@mindbridge.app
- **Security Issues**: security@mindbridge.app

## 🔐 Compliance

### GDPR Compliance
- Data export: Available via Privacy Panel
- Data deletion: 30-day grace period
- Consent management: Granular controls
- Audit trail: Complete logging

### CCPA Compliance
- Data access: User dashboard
- Data deletion: Self-service
- Opt-out: Privacy settings
- Disclosure: Privacy policy

## 📝 Maintenance Schedule

### Daily
- Monitor error rates
- Check crisis response times
- Review moderation queue

### Weekly
- Review system metrics
- Analyze user feedback
- Update documentation

### Monthly
- Security audit
- Performance review
- Backup verification
- Dependency updates

## 🎯 Success Metrics

### Performance
- Response time < 100ms (p95)
- Error rate < 0.1%
- Uptime > 99.9%

### User Engagement
- Daily active users
- Conversation completion rate
- Peer match success rate
- Crisis response time

### Safety
- Crisis detection accuracy
- Response time to critical events
- User satisfaction with support

---

**Last Updated**: 2024
**Version**: 1.0.0
