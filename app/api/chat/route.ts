import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const CRISIS_KEYWORDS = [
  "suicide", "suicidal", "kill myself", "end my life", "want to die",
  "self-harm", "hurt myself", "cutting", "overdose", "hopeless",
];

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

    const { messages } = await req.json();
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

    if (!apiKey) {
      return NextResponse.json(
        { message: "⚠️ Gemini API key is not configured." },
        { status: 200 }
      );
    }

    const systemPrompt = isCrisis
      ? "You are a compassionate mental health support assistant. The user may be in crisis. Provide empathetic support and strongly encourage them to reach out to professional help immediately. Available crisis resources in India: Tele-MANAS 14416, KIRAN 1800-599-0019. Be gentle, supportive, and emphasize that help is available. Never provide medical advice. Keep responses concise."
      : "You are a compassionate mental health support assistant for students. Provide empathetic, supportive, and encouraging responses. Be warm and understanding, validate feelings, and offer practical coping strategies when appropriate. Never provide medical advice or diagnosis. If serious concerns arise, gently suggest professional help. Keep responses concise and conversational with a friendly, supportive tone.";

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
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
    const assistantMessage = response.text();

    return NextResponse.json({
      message: assistantMessage,
      isCrisis,
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    
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
