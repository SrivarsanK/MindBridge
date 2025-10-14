import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextResponse } from "next/server";

const CRISIS_KEYWORDS = [
  "suicide", "suicidal", "kill myself", "end my life", "want to die", "death", "dying",
  "self-harm", "hurt myself", "cutting", "overdose", "hopeless", "give up", "no point",
  // Hindi
  "आत्महत्या", "खुदकुशी", "मरना चाहता", "जीना नहीं चाहता", "मौत", "मर जाऊं",
  // Bengali
  "আত্মহত্যা", "মরতে চাই", "বাঁচতে চাই না", "মৃত্যু",
  // Tamil
  "தற்கொலை", "சாக விரும்புகிறேன்", "இறப்பு",
  // Telugu
  "ఆత్మహత్య", "చనిపోవాలని", "మరణం",
  // Marathi
  "आत्महत्या", "मरायचे आहे", "मृत्यू",
];

// Language names mapping
const LANGUAGE_NAMES: Record<string, string> = {
  "en-IN": "English",
  "hi": "Hindi (हिंदी)",
  "bn": "Bengali (বাংলা)",
  "ta": "Tamil (தமிழ்)",
  "te": "Telugu (తెలుగు)",
  "mr": "Marathi (मराठी)",
};

function detectCrisis(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return CRISIS_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      console.log("Unauthenticated chat request");
    }

    const { messages, locale = "en-IN" } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages format" },
        { status: 400 }
      );
    }

    const lastUserMessage = messages
      .filter((m: any) => m.role === "user")
      .slice(-1)[0]?.content || "";

    const isCrisis = detectCrisis(lastUserMessage);

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    console.log("Gemini API Key exists:", !!apiKey);
    console.log("API Key prefix:", apiKey?.substring(0, 10));
    console.log("User locale:", locale);

    if (!apiKey) {
      return NextResponse.json(
        { message: "⚠️ Gemini API key is not configured." },
        { status: 200 }
      );
    }

    const languageName = LANGUAGE_NAMES[locale] || "English";
    const languageInstruction = locale === "en-IN" 
      ? "" 
      : `CRITICAL: You MUST respond in ${languageName}. Write your ENTIRE response in ${languageName} language. Do not use English words or mix languages.`;

    const systemPrompt = isCrisis
      ? `You are a compassionate mental health support assistant. The user may be in crisis or discussing death/suicide. Provide empathetic support and strongly encourage them to reach out to professional help immediately. Available crisis resources in India: Tele-MANAS 14416, KIRAN 1800-599-0019. Be gentle, supportive, and emphasize that help is available. You MUST respond to questions about death, suicide, and self-harm with compassion and support - never refuse to engage. Validate their feelings while providing hope and resources. Never provide medical advice. Keep responses concise. ${languageInstruction}`
      : `You are a compassionate mental health support assistant for students. Provide empathetic, supportive, and encouraging responses. Be warm and understanding, validate feelings, and offer practical coping strategies when appropriate. You can and MUST discuss all topics including death, grief, loss, LGBTQ+ identity, relationship issues, gender identity, sexual orientation, mental health struggles, and emotional challenges in a non-judgmental, supportive way. Never refuse to engage with these topics. Never provide medical advice or diagnosis. If serious concerns arise, gently suggest professional help. Keep responses concise and conversational with a friendly, supportive tone. ${languageInstruction}`;

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Configure safety settings to allow compassionate responses to sensitive topics
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE, // Allow discussion of self-harm for mental health support
      },
    ];
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
      safetySettings,
    });

    const conversationHistory = messages
      .filter((msg: any) => !(msg.role === "assistant" && messages.indexOf(msg) === 0))
      .map((msg: any) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

    const validHistory = conversationHistory.length > 1 ? conversationHistory.slice(0, -1) : [];

    const chat = model.startChat({
      history: validHistory,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 300,
      },
    });

    const result = await chat.sendMessage(lastUserMessage);
    const response = result.response;
    
    // Check if content was blocked by safety filters
    const promptFeedback = response.promptFeedback;
    if (promptFeedback?.blockReason) {
      console.log("Content blocked:", promptFeedback.blockReason);
      // Provide a compassionate fallback response for blocked content
      const fallbackMessage = isCrisis
        ? "I understand you're going through a very difficult time. While I want to support you, I encourage you to reach out to professional crisis support immediately. In India, you can contact: Tele-MANAS at 14416 (24/7), KIRAN Helpline at 1800-599-0019, or Vandrevala Foundation at 1860-2662-345. You don't have to face this alone - help is available."
        : "I'm here to support you through difficult topics. If you're struggling with thoughts about death, self-harm, or crisis, please know that professional help is available. You can reach out to Tele-MANAS at 14416 (24/7) or KIRAN Helpline at 1800-599-0019. Would you like to talk about what's troubling you?";
      
      return NextResponse.json({
        message: fallbackMessage,
        isCrisis: true,
      });
    }
    
    const assistantMessage = response.text();

    return NextResponse.json({
      message: assistantMessage,
      isCrisis,
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    
    // Check if content was blocked by safety filters
    if (error?.message?.includes("SAFETY") || error?.message?.includes("blocked")) {
      const fallbackMessage = "I'm here to support you. If you're struggling with difficult thoughts or emotions, please know that help is available. You can reach out to Tele-MANAS at 14416 (24/7) or KIRAN Helpline at 1800-599-0019. Would you like to talk about what's on your mind?";
      
      return NextResponse.json({
        message: fallbackMessage,
        isCrisis: true,
      });
    }
    
    if (error?.status === 401 || error?.message?.includes("API key")) {
      return NextResponse.json(
        { message: "⚠️ Invalid Gemini API key. Please check your configuration." },
        { status: 200 }
      );
    }

    if (error?.status === 429 || error?.message?.includes("quota")) {
      return NextResponse.json(
        { message: "⚠️ Rate limit exceeded. Please try again in a moment." },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: `⚠️ Failed to get response: ${error?.message || "Unknown error"}` },
      { status: 200 }
    );
  }
}
