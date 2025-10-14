"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, User, Send, Sparkles, AlertTriangle } from "lucide-react";
import { MarkdownMessage } from "@/components/markdown-message";
import { useLocale } from "@/components/locale-provider";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function AICompanionCard() {
  const { t, locale } = useLocale();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: t("ai_greeting")
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          locale: locale // Pass current locale to API
        })
      });

      if (!response.ok) {
        // Handle HTTP errors
        let errorMsg = t("ai_error");
        if (response.status === 504 || response.status === 503) {
          errorMsg = t("ai_server_unavailable") || "AI server is temporarily unavailable. Please try again later.";
        } else if (response.status === 429) {
          errorMsg = t("ai_rate_limited") || "You are sending messages too quickly. Please wait and try again.";
        }
        throw new Error(errorMsg);
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonErr) {
        throw new Error(t("ai_invalid_response") || "Received invalid response from server.");
      }
      
      // Check if there's an error message
      if (data.error || !data.message) {
        throw new Error(data.error || t("ai_no_response") || "No response from server");
      }
      
      if (data.isCrisis) {
        setShowCrisisAlert(true);
      }

      setMessages(prev => [
        ...prev,
        { role: "assistant", content: data.message }
      ]);
    } catch (error: any) {
      console.error("Chat error:", error);
      let errorMsg = t("ai_error");
      if (error instanceof TypeError) {
        // Network error (e.g., server unreachable)
        errorMsg = t("ai_network_error") || "Network error. Please check your connection and try again.";
      } else if (error?.message) {
        errorMsg = error.message;
      }
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: errorMsg
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/20 shrink-0">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span>{t("ai_companion")}</span>
        </CardTitle>
        <CardDescription>
          {t("ai_companion_desc")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        {showCrisisAlert && (
          <div className="bg-gradient-to-br from-red-50 to-red-50/50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3 shadow-md">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-red-500 to-red-600 shadow-md shrink-0">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-red-900 mb-1">Crisis Support Available</h4>
              <p className="text-sm text-red-800 mb-2">
                If you're in crisis, please reach out to these resources:
              </p>
              <ul className="text-sm text-red-800 space-y-1">
                <li><strong>Tele-MANAS:</strong> 14416 (24/7 Mental Health Support)</li>
                <li><strong>KIRAN Helpline:</strong> 1800-599-0019</li>
                <li><strong>Vandrevala Foundation:</strong> 1860-2662-345</li>
              </ul>
              <Button
                variant="destructive"
                size="sm"
                className="mt-3"
                onClick={() => setShowCrisisAlert(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 shadow-md shadow-purple-500/20 flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <MarkdownMessage 
                  content={message.content} 
                  isUser={message.role === "user"}
                />
              </div>
              {message.role === "user" && (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/20 flex-shrink-0">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 shadow-md shadow-purple-500/20 flex-shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="rounded-lg px-4 py-2 bg-muted">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("type_message")}
            className="resize-none"
            rows={2}
            disabled={isTyping}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            size="icon"
            className="h-auto"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}