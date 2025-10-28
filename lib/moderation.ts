/**
 * Content Moderation System
 * 
 * Provides real-time content filtering for:
 * - Slurs and hate speech
 * - Profanity and inappropriate language
 * - Personal Identifiable Information (PII)
 * - National security risks and harmful content
 * - Professional tone enforcement
 */

export interface ModerationResult {
  allowed: boolean
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical'
  violations: ModerationViolation[]
  sanitizedText?: string
  requiresReview: boolean
  confidence: number
}

export interface ModerationViolation {
  type: 'slur' | 'profanity' | 'pii' | 'threat' | 'security_risk' | 'tone' | 'spam'
  matched: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  position: number
  suggestion?: string
}

// Comprehensive slur/hate speech patterns (redacted patterns for production)
const SLUR_PATTERNS = [
  // Racial slurs
  /\b(n[i1]gg[aeu]r?|n[i1]gg[aeu]|n[e3]gr[o0]|ch[i1]nk|sp[i1]c|wet[bh]ack|k[i1]ke|g[o0][o0]k)\b/gi,
  
  // Homophobic slurs
  /\b(f[a4]gg?[o0]t|f[a4]g|dy[k]e|tr[a4]nny|sh[e3]m[a4]le)\b/gi,
  
  // Religious/ethnic slurs
  /\b([j]ew[s]?\s*down|raghead|towelhead|paki|gypsy|camel\s*jockey)\b/gi,
  
  // Misogynistic slurs
  /\b(c[u]nt|wh[o0]re|sl[u]t|b[i1]tch|h[o0])\b/gi,
  
  // Ableist slurs
  /\b(ret[a4]rd|cr[i1]pple|sp[a4]z|m[o0]ng[o0]l[o0]id)\b/gi,
]

// Profanity patterns (milder inappropriate language)
const PROFANITY_PATTERNS = [
  /\b(f[u]ck|sh[i1]t|[a4]ss|d[a4]mn|hell|p[i1]ss|cr[a4]p)\b/gi,
  /\b(b[a4]st[a4]rd|[a4]rse|[a4]sshole|d[i1]ck|c[o0]ck|tw[a4]t)\b/gi,
]

// PII detection patterns
const PII_PATTERNS = [
  // Email addresses
  { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, type: 'email' },
  
  // Phone numbers (various formats)
  { pattern: /\b(\+?1[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}\b/g, type: 'phone' },
  { pattern: /\b\d{5}[-]?\d{5}\b/g, type: 'phone' }, // Indian format
  
  // Social Security Numbers
  { pattern: /\b\d{3}[-]?\d{2}[-]?\d{4}\b/g, type: 'ssn' },
  
  // Credit card numbers
  { pattern: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, type: 'credit_card' },
  
  // IP addresses
  { pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, type: 'ip_address' },
  
  // Physical addresses (basic detection)
  { pattern: /\b\d+\s+[\w\s]+(?:street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd)\b/gi, type: 'address' },
]

// National security and harmful content patterns
const SECURITY_RISK_PATTERNS = [
  // Violence and threats
  /\b(kill|murder|bomb|attack|shoot|stab|terrorist|suicide\s*bomb|mass\s*shooting)\b/gi,
  
  // Self-harm indicators
  /\b(hang\s*myself|end\s*it\s*all|commit\s*suicide|want\s*to\s*die|kill\s*myself)\b/gi,
  
  // Illegal activities
  /\b(drug\s*deal|buy\s*weed|sell\s*cocaine|hack|exploit|ddos|ransomware)\b/gi,
  
  // Child exploitation
  /\b(child\s*porn|cp|underage|minor\s*(?:nude|sex))\b/gi,
  
  // Radicalization indicators
  /\b(jihad|isis|al[-\s]?qaeda|radicalize|holy\s*war)\b/gi,
]

// Unprofessional tone patterns
const TONE_PATTERNS = [
  // Aggressive language
  /\b(shut\s*up|idiot|stupid|dumb|moron|loser|pathetic)\b/gi,
  
  // Dismissive language
  /\b(whatever|don't\s*care|ignore\s*you|not\s*my\s*problem)\b/gi,
  
  // Excessive caps (yelling)
  /\b[A-Z]{5,}\b/g,
]

/**
 * Main content moderation function
 */
export function moderateContent(text: string): ModerationResult {
  const violations: ModerationViolation[] = []
  let sanitizedText = text
  
  // Check for slurs (highest severity)
  for (const pattern of SLUR_PATTERNS) {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      violations.push({
        type: 'slur',
        matched: match[0],
        severity: 'critical',
        position: match.index || 0,
        suggestion: 'Please use respectful language',
      })
      // Censor the slur
      sanitizedText = sanitizedText.replace(pattern, (matched) => '*'.repeat(matched.length))
    }
  }
  
  // Check for security risks
  for (const pattern of SECURITY_RISK_PATTERNS) {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      violations.push({
        type: 'security_risk',
        matched: match[0],
        severity: 'critical',
        position: match.index || 0,
      })
    }
  }
  
  // Check for PII
  for (const { pattern, type } of PII_PATTERNS) {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      violations.push({
        type: 'pii',
        matched: match[0],
        severity: 'high',
        position: match.index || 0,
        suggestion: `${type} detected - please don't share personal information`,
      })
      // Redact PII
      sanitizedText = sanitizedText.replace(pattern, '[REDACTED]')
    }
  }
  
  // Check for profanity
  for (const pattern of PROFANITY_PATTERNS) {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      violations.push({
        type: 'profanity',
        matched: match[0],
        severity: 'medium',
        position: match.index || 0,
      })
      // Censor profanity
      sanitizedText = sanitizedText.replace(pattern, (matched) => matched[0] + '*'.repeat(matched.length - 1))
    }
  }
  
  // Check for unprofessional tone
  for (const pattern of TONE_PATTERNS) {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      violations.push({
        type: 'tone',
        matched: match[0],
        severity: 'low',
        position: match.index || 0,
        suggestion: 'Consider a more supportive tone',
      })
    }
  }
  
  // Determine overall severity
  const maxSeverity = violations.length > 0
    ? violations.reduce((max, v) => {
        const severities = { none: 0, low: 1, medium: 2, high: 3, critical: 4 }
        return severities[v.severity] > severities[max as keyof typeof severities] ? v.severity : max
      }, 'none' as ModerationResult['severity'])
    : 'none'
  
  // Determine if content is allowed
  const criticalViolations = violations.filter(v => v.severity === 'critical')
  const highViolations = violations.filter(v => v.severity === 'high')
  
  const allowed = criticalViolations.length === 0 && highViolations.length < 3
  const requiresReview = criticalViolations.length > 0 || highViolations.length > 0
  
  // Calculate confidence score
  const confidence = violations.length === 0 ? 1.0 : Math.max(0.5, 1.0 - violations.length * 0.1)
  
  return {
    allowed,
    severity: maxSeverity,
    violations,
    sanitizedText: allowed ? sanitizedText : undefined,
    requiresReview,
    confidence,
  }
}

/**
 * Get user-friendly violation message
 */
export function getViolationMessage(result: ModerationResult): string {
  if (result.allowed && result.violations.length === 0) {
    return ''
  }
  
  const criticalViolations = result.violations.filter(v => v.severity === 'critical')
  const highViolations = result.violations.filter(v => v.severity === 'high')
  
  if (criticalViolations.length > 0) {
    const violationType = criticalViolations[0].type
    
    if (violationType === 'slur') {
      return '🚫 Your message contains hate speech or offensive slurs. Please be respectful to create a safe environment for everyone.'
    }
    
    if (violationType === 'security_risk') {
      return '⚠️ Your message contains content that may pose a security risk or promote harm. This is not allowed for everyone\'s safety.'
    }
  }
  
  if (highViolations.length > 0) {
    const piiViolations = highViolations.filter(v => v.type === 'pii')
    if (piiViolations.length > 0) {
      return '🔒 Your message contains personal information (email, phone, etc.). For your safety, please don\'t share PII in anonymous chats.'
    }
  }
  
  if (result.violations.some(v => v.type === 'profanity')) {
    return 'ℹ️ Please keep language professional and supportive. This is a mental health support platform.'
  }
  
  if (result.violations.some(v => v.type === 'tone')) {
    return '💬 Reminder: Please maintain a supportive and professional tone to help others feel safe.'
  }
  
  return '⚠️ Your message doesn\'t meet our community guidelines. Please revise and try again.'
}

/**
 * Check if message requires immediate admin review
 */
export function requiresImmediateReview(result: ModerationResult): boolean {
  return result.violations.some(v => 
    v.severity === 'critical' && 
    (v.type === 'security_risk' || v.type === 'slur')
  )
}

/**
 * Generate moderation report for admin queue
 */
export function generateModerationReport(
  text: string,
  result: ModerationResult,
  userId: string,
  matchId: string
): ModerationReport {
  return {
    userId,
    matchId,
    originalText: text,
    violations: result.violations,
    severity: result.severity,
    timestamp: Date.now(),
    requiresReview: result.requiresReview,
    confidence: result.confidence,
    autoBlocked: !result.allowed,
  }
}

export interface ModerationReport {
  userId: string
  matchId: string
  originalText: string
  violations: ModerationViolation[]
  severity: ModerationResult['severity']
  timestamp: number
  requiresReview: boolean
  confidence: number
  autoBlocked: boolean
}
