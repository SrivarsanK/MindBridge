"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

export default function AICompanionCard() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([
    { role: "assistant", text: "How can I help today? One step at a time." },
  ])
  function send() {
    if (!input.trim()) return
    setMessages((m) => [
      ...m,
      { role: "user", text: input },
      { role: "assistant", text: "Noted. Consider a brief grounding exercise." },
    ])
    setInput("")
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI companion</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="grid gap-2 max-h-48 overflow-auto pr-1">
          {messages.map((m, i) => (
            <div key={i} className={`text-sm ${m.role === "assistant" ? "text-muted-foreground" : ""}`}>
              {m.text}
            </div>
          ))}
        </div>
        <div className="grid gap-2">
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a thought..." />
          <div className="flex justify-end">
            <Button onClick={send}>Send</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
