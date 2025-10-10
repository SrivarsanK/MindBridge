"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { Bot, User, Send, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AICompanionCard() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([
    { role: "assistant", text: "How can I help today? One step at a time." },
  ])
  const [isTyping, setIsTyping] = useState(false)
  
  function send() {
    if (!input.trim()) return
    const userMessage = input
    setMessages((m) => [...m, { role: "user", text: userMessage }])
    setInput("")
    setIsTyping(true)
    
    // Simulate AI response
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "Noted. Consider a brief grounding exercise. I'm here whenever you need support." },
      ])
      setIsTyping(false)
    }, 1200)
  }
  
  return (
    <Card className="overflow-hidden border-primary/10 shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
      <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">AI Companion</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Always here to listen</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium text-primary">Active</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-4">
          {/* Messages */}
          <div className="space-y-4 max-h-64 overflow-auto pr-2 scrollbar-thin">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500",
                  m.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div
                  className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                    m.role === "user"
                      ? "bg-gradient-to-br from-accent to-accent/70"
                      : "bg-gradient-to-br from-primary/20 to-primary/10 border"
                  )}
                >
                  {m.role === "user" ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div
                  className={cn(
                    "flex-1 rounded-2xl px-4 py-3 text-sm",
                    m.role === "user"
                      ? "bg-gradient-to-br from-accent to-accent/80 text-white shadow-md"
                      : "bg-muted/50 border"
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3 animate-in fade-in duration-300">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 rounded-2xl px-4 py-3 bg-muted/50 border">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Input */}
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
              placeholder="Share what's on your mind..."
              className="min-h-[48px] max-h-32 resize-none rounded-2xl border-primary/20 focus-visible:border-primary/40 transition-all"
            />
            <Button
              onClick={send}
              disabled={!input.trim() || isTyping}
              size="icon"
              className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
