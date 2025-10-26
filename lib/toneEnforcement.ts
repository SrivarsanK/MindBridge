/**
 * Professional Tone Enforcement
 * 
 * Provides sentiment analysis and tone detection to ensure
 * messages maintain a supportive, professional tone.
 * Offers AI-based suggestions for rephrasing hostile or
 * dismissive messages.
 */

export interface ToneAnalysisResult {
  tone: 'supportive' | 'neutral' | 'dismissive' | 'hostile' | 'aggressive'
  sentiment: 'positive' | 'neutral' | 'negative'
  sentimentScore: number // -1 to 1
  isProfessional: boolean
  needsImprovement: boolean
  suggestions: string[]
  confidence: number
}

// Tone detection patterns
const SUPPORTIVE_PATTERNS = [
  /\b(thank you|appreciate|grateful|support|here for you|understand|empathize|care)\b/gi,
  /\b(that's (tough|difficult|hard)|i hear you|makes sense|valid feelings?)\b/gi,
  /\b(you('re| are) not alone|we('re| are) in this together|i'm listening)\b/gi,
]

const HOSTILE_PATTERNS = [
  /\b(shut up|idiot|stupid|dumb|loser|pathetic|worthless)\b/gi,
  /\b(hate you|wish you|hope you (die|suffer))\b/gi,
  /\b(f[*]ck (you|off)|screw you|go to hell)\b/gi,
]

const DISMISSIVE_PATTERNS = [
  /\b(whatever|don't care|not my problem|deal with it)\b/gi,
  /\b(get over it|stop (whining|complaining)|grow up)\b/gi,
  /\b((so|just) ignore (it|them)|it's not that (bad|hard))\b/gi,
]

const AGGRESSIVE_PATTERNS = [
  /[!]{2,}/g, // Multiple exclamation marks
  /[A-Z]{10,}/g, // Excessive caps
  /\byou (always|never)\b/gi, // Accusatory absolutes
]

// Sentiment keywords
const POSITIVE_KEYWORDS = [
  'happy', 'glad', 'good', 'great', 'wonderful', 'excellent', 'positive',
  'helpful', 'kind', 'better', 'improve', 'progress', 'success',
]

const NEGATIVE_KEYWORDS = [
  'sad', 'bad', 'terrible', 'awful', 'horrible', 'negative', 'worse',
  'fail', 'problem', 'difficult', 'hard', 'struggle', 'pain', 'hurt',
]

/**
 * Analyze message tone and sentiment
 */
export function analyzeTone(text: string): ToneAnalysisResult {
  const lowerText = text.toLowerCase()
  
  // Detect tone patterns
  let hostileCount = 0
  let dismissiveCount = 0
  let supportiveCount = 0
  let aggressiveCount = 0
  
  for (const pattern of HOSTILE_PATTERNS) {
    const matches = text.match(pattern)
    if (matches) hostileCount += matches.length
  }
  
  for (const pattern of DISMISSIVE_PATTERNS) {
    const matches = text.match(pattern)
    if (matches) dismissiveCount += matches.length
  }
  
  for (const pattern of SUPPORTIVE_PATTERNS) {
    const matches = text.match(pattern)
    if (matches) supportiveCount += matches.length
  }
  
  for (const pattern of AGGRESSIVE_PATTERNS) {
    const matches = text.match(pattern)
    if (matches) aggressiveCount += matches.length
  }
  
  // Calculate sentiment score
  let sentimentScore = 0
  const words = lowerText.split(/\s+/)
  
  for (const word of words) {
    if (POSITIVE_KEYWORDS.some(kw => word.includes(kw))) {
      sentimentScore += 1
    }
    if (NEGATIVE_KEYWORDS.some(kw => word.includes(kw))) {
      sentimentScore -= 1
    }
  }
  
  // Normalize sentiment score
  const normalizedSentiment = Math.max(-1, Math.min(1, sentimentScore / Math.max(words.length / 10, 1)))
  
  // Determine tone
  let tone: ToneAnalysisResult['tone'] = 'neutral'
  if (hostileCount > 0) tone = 'hostile'
  else if (dismissiveCount > 0) tone = 'dismissive'
  else if (aggressiveCount > 1) tone = 'aggressive'
  else if (supportiveCount > 0) tone = 'supportive'
  
  // Determine sentiment
  let sentiment: ToneAnalysisResult['sentiment'] = 'neutral'
  if (normalizedSentiment > 0.2) sentiment = 'positive'
  else if (normalizedSentiment < -0.2) sentiment = 'negative'
  
  // Professional check
  const isProfessional = tone === 'supportive' || tone === 'neutral'
  const needsImprovement = tone === 'hostile' || tone === 'dismissive' || tone === 'aggressive'
  
  // Generate suggestions
  const suggestions: string[] = []
  
  if (tone === 'hostile') {
    suggestions.push('Your message may come across as hostile. Consider rephrasing to be more respectful.')
    suggestions.push('Try: "I understand you\'re feeling frustrated. Let\'s find a constructive way forward."')
  }
  
  if (tone === 'dismissive') {
    suggestions.push('This sounds dismissive. Try acknowledging the other person\'s feelings first.')
    suggestions.push('Try: "I hear what you\'re saying. While I see it differently, your perspective is valid."')
  }
  
  if (tone === 'aggressive') {
    suggestions.push('Your tone seems aggressive. Take a deep breath and rephrase more calmly.')
    suggestions.push('Try: "I feel strongly about this. Here\'s why..."')
  }
  
  if (aggressiveCount > 0) {
    if (text.match(/[!]{2,}/)) {
      suggestions.push('Reduce excessive punctuation to sound less aggressive.')
    }
    if (text.match(/[A-Z]{10,}/)) {
      suggestions.push('Using all caps feels like shouting. Try normal case.')
    }
  }
  
  // Calculate confidence (based on pattern matches)
  const totalMatches = hostileCount + dismissiveCount + supportiveCount + aggressiveCount
  const confidence = Math.min(0.95, 0.5 + (totalMatches * 0.1))
  
  return {
    tone,
    sentiment,
    sentimentScore: normalizedSentiment,
    isProfessional,
    needsImprovement,
    suggestions,
    confidence,
  }
}

/**
 * Get user-friendly tone feedback
 */
export function getToneFeedback(result: ToneAnalysisResult): string {
  if (result.isProfessional) {
    return '✅ Your message has a supportive, professional tone.'
  }
  
  if (result.tone === 'hostile') {
    return '⚠️ This message may sound hostile. Please rephrase to be more respectful and supportive.'
  }
  
  if (result.tone === 'dismissive') {
    return '💬 Your message might sound dismissive. Try acknowledging the other person\'s feelings.'
  }
  
  if (result.tone === 'aggressive') {
    return '🔊 Your tone seems aggressive. Consider a calmer approach to help the conversation.'
  }
  
  return ''
}

/**
 * Suggest rephrased message with better tone
 */
export function suggestRephrase(originalText: string, toneResult: ToneAnalysisResult): string | null {
  if (toneResult.isProfessional) {
    return null // No need to rephrase
  }
  
  // Simple rephrasing heuristics
  let rephrased = originalText
  
  // Replace hostile words
  rephrased = rephrased.replace(/\bshut up\b/gi, 'please let me speak')
  rephrased = rephrased.replace(/\bidiot\b/gi, 'person')
  rephrased = rephrased.replace(/\bstupid\b/gi, 'not ideal')
  rephrased = rephrased.replace(/\bdumb\b/gi, 'not well thought out')
  
  // Replace dismissive phrases
  rephrased = rephrased.replace(/\bwhatever\b/gi, 'I understand, though I see it differently')
  rephrased = rephrased.replace(/\bdon't care\b/gi, 'have a different perspective')
  rephrased = rephrased.replace(/\bnot my problem\b/gi, 'not something I can help with right now')
  
  // Reduce excessive punctuation
  rephrased = rephrased.replace(/[!]{2,}/g, '!')
  
  // Convert all caps to sentence case (rough approximation)
  if (rephrased.match(/[A-Z]{10,}/)) {
    rephrased = rephrased.replace(/\b[A-Z]{10,}\b/g, (match) => {
      return match.charAt(0) + match.slice(1).toLowerCase()
    })
  }
  
  // Only return if significantly different
  if (rephrased !== originalText) {
    return rephrased
  }
  
  return null
}

/**
 * Real-time tone warning (less intrusive than blocking)
 */
export function shouldWarnAboutTone(result: ToneAnalysisResult): boolean {
  return result.needsImprovement && result.confidence > 0.6
}

/**
 * Check if message should be blocked due to extremely poor tone
 */
export function shouldBlockForTone(result: ToneAnalysisResult): boolean {
  // Only block for extreme hostility
  return result.tone === 'hostile' && result.confidence > 0.8
}
