"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, User, Send, Sparkles, AlertTriangle } from "lucide-react";
import { MarkdownMessage } from "@/components/markdown-message";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function AICompanionCard() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI companion. How can I support you today?"
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
          messages: [...messages, userMessage]
        })
      });

      const data = await response.json();
      
      // Check if there's an error message
      if (data.error || !data.message) {
        throw new Error(data.error || "No response from server");
      }
      
      if (data.isCrisis) {
        setShowCrisisAlert(true);
      }

      setMessages(prev => [
        ...prev,
        { role: "assistant", content: data.message }
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I'm having trouble responding right now. Please try again."
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
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI Companion
        </CardTitle>
        <CardDescription>
          Chat with your personalized mental wellness companion
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        {showCrisisAlert && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
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
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-5 w-5 text-purple-600" />
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
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Bot className="h-5 w-5 text-purple-600" />
              </div>
              <div className="rounded-lg px-4 py-2 bg-muted">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
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
            placeholder="Type your message... (Press Enter to send)"
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