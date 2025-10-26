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

    // Fetch user personalization context if available
    let personalizedContext = "";
    if (userId) {
      try {
        // Dynamically import to avoid loading on every request
        const { ConvexHttpClient } = await import('convex/browser');
        const { api } = await import('@/convex/_generated/api');
        const { getToken } = await auth();
        
        const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;
        if (convexUrl) {
          const convex = new ConvexHttpClient(convexUrl);
          
          // Set auth token for Convex client
          const token = await getToken({ template: "convex" });
          if (token) {
            convex.setAuth(token);
          }

          try {
            const userPattern = await convex.query(api.userPatterns.getUserPatterns, {});
            
            if (userPattern && userPattern.personalizationEnabled) {
              // Create personalized context from available pattern data
              const contextParts = [];
              if (userPattern.emotionalProfile?.dominantEmotions?.length > 0) {
                contextParts.push(`Emotional profile: ${userPattern.emotionalProfile.dominantEmotions.join(', ')}`);
              }
              if (userPattern.communicationStyle?.tone) {
                contextParts.push(`Communication style: ${userPattern.communicationStyle.tone} tone`);
              }
              if (userPattern.topicPreferences?.interests?.length > 0) {
                contextParts.push(`Interests: ${userPattern.topicPreferences.interests.slice(0, 3).join(', ')}`);
              }
              personalizedContext = contextParts.length > 0 ? `\n\nUser Context: ${contextParts.join('. ')}` : '';
              console.log("Using personalized context for user");
            }
          } catch (patternError) {
            // Personalization not available yet, continue without it
            console.log("Personalization not available:", patternError);
          }
        }
      } catch (convexError) {
        console.log("Could not fetch user patterns:", convexError);
      }
    }

    const lastUserMessage = messages
      .filter((m: any) => m.role === "user")
      .slice(-1)[0]?.content || "";

    const isCrisis = detectCrisis(lastUserMessage);

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
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
      : `Please respond in ${languageName}. Use natural ${languageName} language throughout your response.`;

    const systemPrompt = isCrisis
      ? `You are a compassionate mental health support assistant. The user may be in crisis or discussing death/suicide. Provide empathetic support and strongly encourage them to reach out to professional help immediately. Available crisis resources in India: Tele-MANAS 14416, KIRAN 1800-599-0019. Be gentle, supportive, and emphasize that help is available. You MUST respond to questions about death, suicide, and self-harm with compassion and support - never refuse to engage. Validate their feelings while providing hope and resources. Never provide medical advice. Keep responses concise. ${languageInstruction}${personalizedContext}`
      : `You are a compassionate mental health support assistant for students. Provide empathetic, supportive, and encouraging responses. Be warm and understanding, validate feelings, and offer practical coping strategies when appropriate. You can and MUST discuss all topics including death, grief, loss, LGBTQ+ identity, relationship issues, gender identity, sexual orientation, mental health struggles, and emotional challenges in a non-judgmental, supportive way. Never refuse to engage with these topics. Never provide medical advice or diagnosis. If serious concerns arise, gently suggest professional help. Keep responses concise and conversational with a friendly, supportive tone. ${languageInstruction}${personalizedContext}`;

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
    
    // Add language context to the first message if not English
    let finalMessage = lastUserMessage;
    if (locale !== "en-IN" && validHistory.length === 0) {
      finalMessage = `[Language: ${languageName}]\n${lastUserMessage}`;
      console.log("Adding language context for first message:", languageName);
    }

    const chat = model.startChat({
      history: validHistory,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800, // Increased from 300 to allow longer responses
        topP: 0.95,
        topK: 40,
        candidateCount: 1,
      },
    });

    console.log("Sending message to Gemini...");
    console.log("Locale:", locale, "Language:", languageName);
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout after 30 seconds")), 30000);
    });
    
    const resultPromise = chat.sendMessage(finalMessage);
    const result = await Promise.race([resultPromise, timeoutPromise]) as any;
    
    const response = result.response;
    console.log("Gemini response received");
    
    // Check finish reason
    const finishReason = response.candidates?.[0]?.finishReason;
    console.log("Finish reason:", finishReason);
    
    // Check if content was blocked by safety filters
    const promptFeedback = response.promptFeedback;
    if (promptFeedback?.blockReason) {
      console.log("Content blocked:", promptFeedback.blockReason);
      console.log("Block reason details:", JSON.stringify(promptFeedback, null, 2));
      
      // For non-English, try to respond in their language
      let fallbackMessage: string;
      if (locale !== "en-IN") {
        // Try to provide a basic message that AI might be having trouble with the language
        fallbackMessage = "I'm having difficulty responding in your preferred language at the moment. Please try rephrasing your message or consider using English for better assistance.";
      } else {
        // Provide a compassionate fallback response for blocked content
        fallbackMessage = isCrisis
          ? "I understand you're going through a very difficult time. While I want to support you, I encourage you to reach out to professional crisis support immediately. In India, you can contact: Tele-MANAS at 14416 (24/7), KIRAN Helpline at 1800-599-0019, or Vandrevala Foundation at 1860-2662-345. You don't have to face this alone - help is available."
          : "I'm here to support you through difficult topics. If you're struggling with thoughts about death, self-harm, or crisis, please know that professional help is available. You can reach out to Tele-MANAS at 14416 (24/7) or KIRAN Helpline at 1800-599-0019. Would you like to talk about what's troubling you?";
      }
      
      return NextResponse.json({
        message: fallbackMessage,
        isCrisis: locale === "en-IN" ? isCrisis : false,
      });
    }
    
    // Extract text with better error handling
    let assistantMessage: string;
    try {
      // Check finish reason before attempting text extraction
      if (finishReason && finishReason !== "STOP") {
        console.log(`Non-STOP finish reason detected: ${finishReason}`);
        
        // Handle RECITATION (model refuses due to potential copyright/training data match)
        if (finishReason === "RECITATION") {
          throw new Error("Model refused to respond due to content policy (RECITATION)");
        }
        
        // Handle SAFETY (model blocked for safety reasons beyond prompt feedback)
        if (finishReason === "SAFETY") {
          console.log("Response blocked by safety filter (SAFETY finish reason)");
          let safetyFallback: string;
          if (locale !== "en-IN") {
            safetyFallback = "I apologize, but I cannot generate a response for this topic. Please try rephrasing your question or use English for better assistance.";
          } else {
            safetyFallback = "I'm here to support you, but I need to ensure our conversation remains safe and helpful. Could you rephrase your question or tell me more about what's troubling you?";
          }
          
          return NextResponse.json({
            message: safetyFallback,
            isCrisis: false,
          });
        }
      }
      
      assistantMessage = response.text();
      if (!assistantMessage || assistantMessage.trim().length === 0) {
        throw new Error("Empty response from model");
      }
      console.log("Response text extracted successfully, length:", assistantMessage.length);
    } catch (textError) {
      console.error("Error extracting text from response:", textError);
      // Try alternative methods to get the response
      const candidates = response.candidates;
      if (candidates && candidates.length > 0) {
        const firstCandidate = candidates[0];
        if (firstCandidate.content && firstCandidate.content.parts) {
          assistantMessage = firstCandidate.content.parts
            .map((part: any) => part.text || "")
            .join("");
        } else {
          throw new Error("No valid response content found");
        }
      } else {
        throw new Error("No response candidates available");
      }
    }

    return NextResponse.json({
      message: assistantMessage,
      isCrisis,
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    
    // Handle timeout
    if (error?.message?.includes("timeout")) {
      return NextResponse.json({
        message: "⚠️ The request took too long to process. Please try again with a shorter message or in a moment.",
        isCrisis: false,
      });
    }
    
    // Check if content was blocked by safety filters
    if (error?.message?.includes("SAFETY") || error?.message?.includes("blocked")) {
      const fallbackMessage = "I'm here to support you. If you're struggling with difficult thoughts or emotions, please know that help is available. You can reach out to Tele-MANAS at 14416 (24/7) or KIRAN Helpline at 1800-599-0019. Would you like to talk about what's on your mind?";
      
      return NextResponse.json({
        message: fallbackMessage,
        isCrisis: true,
      });
    }
    
    // Handle response text extraction errors
    if (error?.message?.includes("Empty response") || error?.message?.includes("No valid response")) {
      return NextResponse.json({
        message: "⚠️ I'm having trouble formulating a response right now. Could you please rephrase your question or try again?",
        isCrisis: false,
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
    
    // Handle network errors
    if (error?.message?.includes("fetch") || error?.message?.includes("network")) {
      return NextResponse.json(
        { message: "⚠️ Network error. Please check your internet connection and try again." },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: `⚠️ I'm having trouble responding right now. Please try again in a moment. (${error?.message || "Unknown error"})` },
      { status: 200 }
    );
  }
}
