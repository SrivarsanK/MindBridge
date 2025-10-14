"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, User, Send, Sparkles, AlertTriangle, Trash2, Download } from "lucide-react";
import { MarkdownMessage } from "@/components/markdown-message";
import { useLocale } from "@/components/locale-provider";
import {
  saveChatMessages,
  loadChatMessages,
  clearChatHistory,
  exportChatHistory,
  type ChatMessage,
} from "@/lib/local-chat-storage";

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
  const [isLoaded, setIsLoaded] = useState(false);

  // Load messages from localStorage on mount
  useEffect(() => {
    const loadedMessages = loadChatMessages();
    if (loadedMessages.length > 0) {
      setMessages(loadedMessages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })));
      console.log("✅ Chat history restored from local storage");
    }
    setIsLoaded(true);
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (isLoaded && messages.length > 1) { // More than just greeting
      const chatMessages: ChatMessage[] = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: Date.now(),
        locale: locale,
      }));
      saveChatMessages(chatMessages);
    }
  }, [messages, isLoaded, locale]);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000); // 35 second timeout

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          locale: locale // Pass current locale to API
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

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
      
      // Check if response is too short or seems incomplete
      if (data.message && data.message.trim().length < 10) {
        console.warn("Received very short response:", data.message);
      }
      
      if (data.isCrisis) {
        setShowCrisisAlert(true);
      }

      const assistantMessage: Message = { role: "assistant", content: data.message };
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error: any) {
      console.error("Chat error:", error);
      let errorMsg = t("ai_error");
      
      if (error.name === 'AbortError') {
        // Request was aborted due to timeout
        errorMsg = t("ai_timeout") || "The request took too long. Please try again with a shorter message.";
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
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

  const handleClearChat = () => {
    if (confirm("Are you sure you want to clear all chat history? This cannot be undone.")) {
      clearChatHistory();
      setMessages([
        {
          role: "assistant",
          content: t("ai_greeting")
        }
      ]);
      console.log("🗑️ Chat history cleared");
    }
  };

  const handleExportChat = () => {
    try {
      const data = exportChatHistory();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mindbridge-chat-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log("📥 Chat history exported");
    } catch (error) {
      console.error("Failed to export chat:", error);
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/20 shrink-0">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>{t("ai_companion")}</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                💾 Stored locally on your device
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleExportChat}
              title="Export chat history"
              className="h-8 w-8"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearChat}
              title="Clear chat history"
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        {showCrisisAlert && (
          <div className="bg-gradient-to-br from-red-50 to-red-50/50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3 shadow-md">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-br from-red-500 to-red-600 shadow-md shrink-0">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-red-900 mb-1">🆘 Need Immediate Support?</h4>
              <p className="text-sm text-red-800 mb-2">
                If you're in crisis or having intense cravings, reach out NOW:
              </p>
              <ul className="text-sm text-red-800 space-y-1">
                <li><strong>SAMHSA National Helpline:</strong> 1-800-662-4357 (24/7 Free, Confidential)</li>
                <li><strong>Crisis Text Line:</strong> Text "HELLO" to 741741</li>
                <li><strong>Suicide Prevention:</strong> Call or Text 988</li>
                <li><strong>AA Hotline:</strong> Check local AA/NA meetings</li>
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