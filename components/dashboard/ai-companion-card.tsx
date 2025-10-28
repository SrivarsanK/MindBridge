"use client";

import { useState, useEffect, useRef } from "react";
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
  getConversationInsights,
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
  const [personalizationInsights, setPersonalizationInsights] = useState<any>(null);
  const [showInsights, setShowInsights] = useState(false);

  // Ref for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

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

  // Load personalization insights
  useEffect(() => {
    const insights = getConversationInsights();
    setPersonalizationInsights(insights);
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, isTyping]);

  // Auto-scroll when user sends a message
  useEffect(() => {
    if (messagesContainerRef.current && input === "") {
      const container = messagesContainerRef.current;
      // Small delay to ensure DOM has updated
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 100);
    }
  }, [input]);

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

  const handleShowInsights = () => {
    setShowInsights(!showInsights);
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
              <CardTitle className="flex items-center gap-2">
                {t("ai_companion")}
                {personalizationInsights?.hasPersonalization && (
                  <div className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                    <Sparkles className="h-3 w-3" />
                    Personalized
                  </div>
                )}
              </CardTitle>
              <CardDescription className="text-xs mt-0.5 flex items-center gap-2">
                <span>💾 Stored locally on your device</span>
                {personalizationInsights && (
                  <span className="text-muted-foreground">
                    • {personalizationInsights.messageCount} messages
                    {personalizationInsights.canAnalyze && " • AI learning enabled"}
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-1">
            {personalizationInsights?.canAnalyze && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShowInsights}
                title="View conversation insights"
                className="h-8 w-8"
              >
                <Bot className="h-4 w-4" />
              </Button>
            )}
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
      <CardContent className="flex-1 flex flex-col">
        {showCrisisAlert && (
          <div className="bg-gradient-to-br from-red-50 to-red-50/50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3 shadow-md mb-4">
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

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 min-h-0 max-h-[400px] scroll-smooth" ref={messagesContainerRef}>
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
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2 mt-4">
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

      {showInsights && personalizationInsights && (
        <div className="border-t bg-muted/30 p-4">
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Conversation Insights
            </h4>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="font-medium text-muted-foreground">Messages</div>
                <div className="text-lg font-semibold">{personalizationInsights.messageCount}</div>
              </div>

              <div>
                <div className="font-medium text-muted-foreground">Conversations</div>
                <div className="text-lg font-semibold">
                  {personalizationInsights.conversationStats?.totalConversations || 0}
                </div>
              </div>

              <div>
                <div className="font-medium text-muted-foreground">Avg Session</div>
                <div className="text-lg font-semibold">
                  {personalizationInsights.conversationStats?.averageSessionLength || 0}min
                </div>
              </div>

              <div>
                <div className="font-medium text-muted-foreground">Most Active</div>
                <div className="text-lg font-semibold">
                  {personalizationInsights.conversationStats?.mostActiveHour
                    ? `${personalizationInsights.conversationStats.mostActiveHour}:00`
                    : 'N/A'}
                </div>
              </div>
            </div>

            {personalizationInsights.conversationStats?.favoriteTopics?.length > 0 && (
              <div>
                <div className="font-medium text-muted-foreground text-xs mb-1">Favorite Topics</div>
                <div className="flex flex-wrap gap-1">
                  {personalizationInsights.conversationStats.favoriteTopics.map((topic: string) => (
                    <span key={topic} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                      {topic.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {personalizationInsights.conversationStats?.emotionalTrends?.length > 0 && (
              <div>
                <div className="font-medium text-muted-foreground text-xs mb-1">Emotional Patterns</div>
                <div className="flex flex-wrap gap-1">
                  {personalizationInsights.conversationStats.emotionalTrends.slice(0, 3).map((trend: any) => (
                    <span key={trend.emotion} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                      {trend.emotion} ({trend.count})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {personalizationInsights.nextMilestone && (
              <div className="text-xs text-muted-foreground bg-yellow-50 border border-yellow-200 rounded p-2">
                <strong>💡 Tip:</strong> {personalizationInsights.nextMilestone} to unlock AI personalization that adapts to your conversation style and preferences.
              </div>
            )}

            {personalizationInsights.hasPersonalization && (
              <div className="text-xs text-muted-foreground bg-green-50 border border-green-200 rounded p-2">
                <strong>✅ AI Learning Active:</strong> Your conversations are being analyzed locally to provide personalized responses. All data stays on your device.
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}