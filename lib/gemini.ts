import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Generate a unique, descriptive name for a peer chat based on the conversation content
 * @param messages Array of decrypted messages from the chat
 * @param iceBreaker The initial ice breaker message
 * @param description Optional description of what the user is looking for
 * @returns A short, descriptive chat name
 */
export async function generateChatName(
  messages: Array<{ plaintext: string; isMine: boolean }>,
  iceBreaker: string,
  description?: string
): Promise<string> {
  try {
    // Prepare conversation context
    const recentMessages = messages.slice(-10); // Last 10 messages for context
    const conversationText = recentMessages
      .map(msg => `${msg.isMine ? 'User' : 'Peer'}: ${msg.plaintext}`)
      .join('\n');

    const context = `
Initial ice breaker: "${iceBreaker}"
${description ? `User's goal: "${description}"` : ''}
Recent conversation:
${conversationText}
    `.trim();

    const prompt = `Based on this peer support chat conversation, generate a very short (2-4 words), descriptive, and empathetic name for this chat that captures the essence of the conversation. The name should be appropriate for a recovery/support context and help the user remember what this chat was about.

Examples of good names:
- "Craving Support Session"
- "Anxiety Coping Strategies"
- "Relapse Prevention Talk"
- "Emotional Processing"
- "Motivation Boost Chat"

Context:
${context}

Generate only the chat name, nothing else:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const chatName = response.text().trim();

    // Clean up the response (remove quotes if present)
    const cleanName = chatName.replace(/^["']|["']$/g, '');

    // Fallback if generation fails or returns empty
    if (!cleanName || cleanName.length < 3) {
      return "Recovery Support Chat";
    }

    // Limit length to prevent overly long names
    return cleanName.length > 30 ? cleanName.substring(0, 27) + "..." : cleanName;

  } catch (error) {
    console.error('Failed to generate chat name with Gemini:', error);
    return "Recovery Support Chat";
  }
}

/**
 * Generate a chat name for a new match based on initial context
 * @param iceBreaker The initial ice breaker message
 * @param description Optional description of what the user is looking for
 * @param mood User's current mood
 * @returns A short, descriptive chat name
 */
export async function generateInitialChatName(
  iceBreaker: string,
  description?: string,
  mood?: string
): Promise<string> {
  try {
    const context = `
Ice breaker: "${iceBreaker}"
${description ? `Looking for: "${description}"` : ''}
${mood ? `Current mood: "${mood}"` : ''}
    `.trim();

    const prompt = `Based on this initial peer support chat context, generate a very short (2-4 words), descriptive, and empathetic name for this chat that captures what kind of support the user is seeking.

Examples:
- "Craving Management"
- "Anxiety Support"
- "Motivation Building"
- "Relapse Prevention"
- "Emotional Support"

Context:
${context}

Generate only the chat name, nothing else:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const chatName = response.text().trim();

    const cleanName = chatName.replace(/^["']|["']$/g, '');

    if (!cleanName || cleanName.length < 3) {
      return "Peer Support Chat";
    }

    return cleanName.length > 30 ? cleanName.substring(0, 27) + "..." : cleanName;

  } catch (error) {
    console.error('Failed to generate initial chat name with Gemini:', error);
    return "Peer Support Chat";
  }
}