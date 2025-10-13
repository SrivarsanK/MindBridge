/**
 * Example: AI Companion with Local Storage
 * This replaces server-side storage with client-side IndexedDB
 */

'use client'

import { useState, useEffect } from 'react'
import { useAIConversation } from '@/lib/use-local-storage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Loader2, Send, Trash2 } from 'lucide-react'

// Simple UUID generator (no external dependency needed)
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export default function LocalAICompanion() {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const conversationId = 'main-conversation' // or use uuidv4() for multiple conversations
  
  const { conversation, addMessage, loading, error } = useAIConversation(conversationId)

  const handleSend = async () => {
    if (!input.trim()) return

    setIsLoading(true)
    const userMessage = input
    setInput('')

    try {
      // Save user message locally
      await addMessage({
        id: generateId(),
        role: 'user',
        content: userMessage,
        timestamp: Date.now(),
      })

      // Get AI response (this would call your AI service)
      // For demo, we'll simulate a response
      const aiResponse = await simulateAIResponse(userMessage)

      // Save AI response locally
      await addMessage({
        id: generateId(),
        role: 'assistant',
        content: aiResponse,
        timestamp: Date.now(),
      })
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Failed to save message locally')
    } finally {
      setIsLoading(false)
    }
  }

  // Simulate AI response (replace with actual AI service)
  const simulateAIResponse = async (userInput: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return `I understand you said: "${userInput}". How can I help you further?`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error loading conversation: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">AI Companion (Local Storage)</h1>
        <div className="text-sm text-muted-foreground">
          💾 All data stored locally on your device
        </div>
      </div>

      {/* Messages */}
      <Card className="flex-1 overflow-y-auto p-4 mb-4 space-y-4">
        {conversation?.messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No messages yet. Start a conversation!</p>
            <p className="text-xs mt-2">All messages are stored locally on your device.</p>
          </div>
        ) : (
          conversation?.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
      </Card>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
          placeholder="Type your message..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Stats */}
      {conversation && (
        <div className="mt-4 text-xs text-muted-foreground text-center">
          {conversation.messages.length} messages stored locally
        </div>
      )}
    </div>
  )
}
