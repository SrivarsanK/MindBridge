"use client"
import { useState, useEffect, useRef, use } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  MessageCircle,
  Send,
  Shield,
  Lock,
  ArrowLeft,
  AlertTriangle,
  Check,
  X as XIcon,
  Loader2,
} from "lucide-react"
import {
  generateKeyPair,
  exportPublicKey,
  exportPrivateKey,
  importPublicKey,
  importPrivateKey,
  deriveSharedSecret,
  encryptMessage,
  decryptMessage,
  KeyStorage,
  type SerializedKeyPair,
} from "@/lib/crypto"

interface DecryptedMessage {
  _id: string
  senderId: string
  plaintext: string
  timestamp: number
  isMine: boolean
  decryptionFailed?: boolean
  deliveryStatus?: "sent" | "delivered" | "read"
}

export default function PeerChatPage({ params }: { params: Promise<{ matchId: string }> }) {
  // Unwrap params Promise for Next.js 15
  const { matchId: matchIdString } = use(params)
  
  const router = useRouter()
  const [messageInput, setMessageInput] = useState("")
  const [isEncrypting, setIsEncrypting] = useState(false)
  const [decryptedMessages, setDecryptedMessages] = useState<DecryptedMessage[]>([])
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null)
  const [identityKeyPair, setIdentityKeyPair] = useState<SerializedKeyPair | null>(null)
  const [preKeyPair, setPreKeyPair] = useState<SerializedKeyPair | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [optimisticMessages, setOptimisticMessages] = useState<DecryptedMessage[]>([])
  const [peerOnline, setPeerOnline] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const matchId = matchIdString as Id<"peerMatches">
  const matchDetails = useQuery(api.peerMatching.getMatchDetails, { matchId })
  const messages = useQuery(api.peerMatching.getPeerMessages, { matchId, limit: 100 })
  const peerPreKeyBundle = useQuery(
    api.peerMatching.getPreKeyBundle,
    matchDetails?.peerId ? { userId: matchDetails.peerId } : "skip"
  )

  const sendMessage = useMutation(api.peerMatching.sendPeerMessage)
  const endChat = useMutation(api.peerMatching.endPeerMatch)
  const markAsDelivered = useMutation(api.peerMatching.markMessagesAsDelivered)
  const markAsSeen = useMutation(api.peerMatching.markMessagesAsSeen)
  const uploadPreKeys = useMutation(api.peerMatching.uploadPreKeys)

  // Initialize encryption keys
  useEffect(() => {
    async function initializeKeys() {
      try {
        // Try to load existing keys from storage
        let storedIdentity = await KeyStorage.getIdentityKeyPair(matchId)
        let storedPreKey = await KeyStorage.getPreKeyPair(matchId)
        let needsUpload = false

        // Generate new keys if not found
        if (!storedIdentity) {
          const identityKP = await generateKeyPair()
          storedIdentity = {
            publicKey: await exportPublicKey(identityKP.publicKey),
            privateKey: await exportPrivateKey(identityKP.privateKey),
          }
          await KeyStorage.saveIdentityKeyPair(matchId, storedIdentity)
          needsUpload = true
        }

        if (!storedPreKey) {
          const preKP = await generateKeyPair()
          storedPreKey = {
            publicKey: await exportPublicKey(preKP.publicKey),
            privateKey: await exportPrivateKey(preKP.privateKey),
          }
          await KeyStorage.savePreKeyPair(matchId, storedPreKey)
          needsUpload = true
        }

        setIdentityKeyPair(storedIdentity)
        setPreKeyPair(storedPreKey)

        // Upload public keys to server if new keys were generated
        if (needsUpload) {
          try {
            await uploadPreKeys({
              identityPublicKey: storedIdentity.publicKey,
              signedPreKeyPublic: storedPreKey.publicKey,
              preKeys: [storedPreKey.publicKey], // Single pre-key for simplicity
              preKeySignature: storedPreKey.publicKey, // Simplified signature
            })
            console.log("✅ Public keys uploaded to server")
          } catch (error) {
            console.error("Failed to upload public keys:", error)
          }
        }

        // Derive shared secret when peer's pre-key bundle is available
        if (peerPreKeyBundle && storedIdentity) {
          try {
            const myPrivateKey = await importPrivateKey(storedIdentity.privateKey)
            const peerPublicKey = await importPublicKey(peerPreKeyBundle.identityKey)
            const sharedSecret = await deriveSharedSecret(myPrivateKey, peerPublicKey)
            setEncryptionKey(sharedSecret)
          } catch (error) {
            console.error("Failed to derive shared secret:", error)
          }
        }

        setIsInitializing(false)
      } catch (error) {
        console.error("Failed to initialize encryption keys:", error)
        setIsInitializing(false)
      }
    }

    initializeKeys()
  }, [matchId, peerPreKeyBundle, uploadPreKeys])

  // Decrypt messages when encryption key is ready
  useEffect(() => {
    async function decryptMessages() {
      if (!encryptionKey || !messages) return

      const decrypted: DecryptedMessage[] = []

      for (const msg of messages) {
        try {
          const plaintext = await decryptMessage(
            encryptionKey,
            msg.encryptedContent,
            msg.iv
          )

          decrypted.push({
            _id: msg._id,
            senderId: msg.senderId,
            plaintext,
            timestamp: msg.timestamp,
            isMine: msg.isMine,
            deliveryStatus: msg.deliveryStatus,
          })
        } catch (error) {
          console.error("Failed to decrypt message:", error)
          decrypted.push({
            _id: msg._id,
            senderId: msg.senderId,
            plaintext: "[Message could not be decrypted]",
            timestamp: msg.timestamp,
            isMine: msg.isMine,
            decryptionFailed: true,
            deliveryStatus: msg.deliveryStatus,
          })
        }
      }

      setDecryptedMessages(decrypted)
      // Clear optimistic messages that have been confirmed
      setOptimisticMessages(prev => 
        prev.filter(opt => !decrypted.some(msg => msg.timestamp === opt.timestamp))
      )
    }

    decryptMessages()
  }, [messages, encryptionKey])

  // Check peer online status (simulate - in production use presence system)
  useEffect(() => {
    if (matchDetails && matchDetails.status === "active") {
      setPeerOnline(true)
    }
  }, [matchDetails])

  // Mark peer messages as delivered when received
  useEffect(() => {
    if (!decryptedMessages.length || !matchId) return

    const undeliveredMessages = decryptedMessages
      .filter(msg => !msg.isMine && msg.deliveryStatus === "sent" && !msg._id.startsWith('temp-'))
      .map(msg => msg._id as Id<"peerMessages">)

    if (undeliveredMessages.length > 0) {
      markAsDelivered({ matchId, messageIds: undeliveredMessages })
        .catch(err => console.error("Failed to mark as delivered:", err))
    }
  }, [decryptedMessages, matchId, markAsDelivered])

  // Mark peer messages as seen when viewing chat (after 1 second delay)
  useEffect(() => {
    if (!decryptedMessages.length || !matchId) return

    const timer = setTimeout(() => {
      const unseenMessages = decryptedMessages
        .filter(msg => !msg.isMine && msg.deliveryStatus !== "read" && !msg._id.startsWith('temp-'))
        .map(msg => msg._id as Id<"peerMessages">)

      if (unseenMessages.length > 0) {
        markAsSeen({ matchId, messageIds: unseenMessages })
          .catch(err => console.error("Failed to mark as seen:", err))
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [decryptedMessages, matchId, markAsSeen])

  // Auto-send queued messages when encryption becomes ready (ONE TIME ONLY)
  useEffect(() => {
    if (encryptionKey && optimisticMessages.length > 0) {
      console.log(`📤 Encryption ready! Sending ${optimisticMessages.length} queued messages...`)
      
      // Send all queued optimistic messages
      const messagesToSend = [...optimisticMessages]; // Copy to avoid stale closure
      
      messagesToSend.forEach(async (msg) => {
        try {
          const { ciphertext, iv } = await encryptMessage(encryptionKey, msg.plaintext)
          await sendMessage({
            matchId,
            encryptedContent: ciphertext,
            iv,
          })
          console.log(`✅ Queued message sent: "${msg.plaintext.substring(0, 20)}..."`)
          // Remove from optimistic messages after sending
          setOptimisticMessages(prev => prev.filter(m => m._id !== msg._id))
        } catch (error) {
          console.error("Failed to send queued message:", error)
        }
      })
    }
  }, [encryptionKey]) // Only run when encryption key becomes available

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [decryptedMessages, optimisticMessages])

  const handleSendMessage = async () => {
    if (!messageInput.trim() || isEncrypting) return

    const messageText = messageInput.trim()
    const tempTimestamp = Date.now()
    
    // Add optimistic message immediately for instant feedback
    const optimisticMsg: DecryptedMessage = {
      _id: `temp-${tempTimestamp}`,
      senderId: "me",
      plaintext: messageText,
      timestamp: tempTimestamp,
      isMine: true,
    }
    
    setMessageInput("")
    
    // Focus back on input for quick typing
    setTimeout(() => inputRef.current?.focus(), 0)

    // If encryption is not ready yet, queue the message
    if (!encryptionKey) {
      console.log("⏳ Message queued - waiting for encryption key")
      setOptimisticMessages(prev => [...prev, optimisticMsg])
      // The message will stay in optimisticMessages until encryption is ready
      return
    }

    // Encryption is ready - show optimistic message and send immediately
    setOptimisticMessages(prev => [...prev, optimisticMsg])
    setIsEncrypting(true)
    
    try {
      // Encrypt message client-side
      const { ciphertext, iv } = await encryptMessage(encryptionKey, messageText)

      // Send encrypted message
      await sendMessage({
        matchId,
        encryptedContent: ciphertext,
        iv,
      })

      console.log("✅ Message sent successfully")
      
      // Remove optimistic message after successful send
      // The real message will come from the server via the messages query
      setOptimisticMessages(prev => prev.filter(m => m._id !== optimisticMsg._id))
    } catch (error) {
      console.error("Failed to send message:", error)
      // Remove optimistic message on error
      setOptimisticMessages(prev => prev.filter(m => m._id !== optimisticMsg._id))
      alert("Failed to send message. Please try again.")
      // Restore message input
      setMessageInput(messageText)
    } finally {
      setIsEncrypting(false)
    }
  }

  const handleEndChat = async () => {
    try {
      await endChat({ matchId })
      // Clear encryption keys
      await KeyStorage.clearKeys(matchId)
      router.push("/dashboard")
    } catch (error) {
      console.error("Failed to end chat:", error)
      alert("Failed to end chat. Please try again.")
    }
  }

  if (!matchDetails) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Shield className="h-12 w-12 text-primary animate-pulse" />
        <p className="text-lg font-medium">Initializing end-to-end encryption...</p>
        <p className="text-sm text-muted-foreground">Generating secure keys</p>
      </div>
    )
  }

  // Continue to show chat even without encryption key (like WhatsApp)
  // Messages will be queued until encryption is ready
  const isEncryptionReady = !!encryptionKey

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                {matchDetails.peerDisplayName}
              </h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Lock className="h-3 w-3 text-green-500" />
                  <span>End-to-end encrypted</span>
                </div>
                {peerOnline && (
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-green-600 dark:text-green-400 font-medium">Online</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowEndConfirm(true)}
          >
            End Chat
          </Button>
        </div>

        {/* Ice Breaker */}
        {matchDetails.iceBreaker && (
          <Card className="mt-3 bg-primary/5 border-primary/20">
            <CardContent className="py-2 px-3">
              <p className="text-sm break-words">
                <span className="font-medium">Ice Breaker: </span>
                {matchDetails.iceBreaker}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Security Notice */}
        <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground bg-green-500/10 border border-green-500/20 rounded-lg p-2">
          <Shield className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-green-700 dark:text-green-400">
              {isEncryptionReady ? "Secure Connection" : "Setting up encryption..."}
            </p>
            <p>
              {isEncryptionReady
                ? "Messages are encrypted on your device and can only be read by you and your peer. Even the server cannot decrypt your messages."
                : "Establishing secure encryption. You can start typing - messages will be sent when encryption is ready."}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {(() => {
          // Combine optimistic and decrypted messages, sort by timestamp
          const allMessages = [...decryptedMessages, ...optimisticMessages]
            .sort((a, b) => a.timestamp - b.timestamp)
          
          return allMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <MessageCircle className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-lg font-medium">No messages yet</p>
              <p className="text-sm">Start the conversation with your peer!</p>
            </div>
          ) : (
            allMessages.map((msg) => {
              const isOptimistic = msg._id.startsWith('temp-')
              
              return (
                <div
                  key={msg._id}
                  className={`flex ${msg.isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      msg.isMine
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    } ${msg.decryptionFailed ? "border-2 border-red-500" : ""} ${
                      isOptimistic ? "opacity-80" : ""
                    }`}
                  >
                    {msg.decryptionFailed && (
                      <div className="flex items-center gap-1 text-xs text-red-500 mb-1">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Decryption failed</span>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.plaintext}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <p className="text-xs opacity-70">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {msg.isMine && isOptimistic && (
                        <Loader2 className="h-3 w-3 animate-spin opacity-50" />
                      )}
                      {msg.isMine && !isOptimistic && msg.deliveryStatus && (
                        <span className="flex items-center" title={
                          msg.deliveryStatus === "sent" ? "Sent" :
                          msg.deliveryStatus === "delivered" ? "Delivered" :
                          "Seen"
                        }>
                          {msg.deliveryStatus === "sent" && (
                            <Check className="h-3 w-3 opacity-50" />
                          )}
                          {msg.deliveryStatus === "delivered" && (
                            <div className="relative">
                              <Check className="h-3 w-3 opacity-70" />
                              <Check className="h-3 w-3 opacity-70 absolute -left-1" />
                            </div>
                          )}
                          {msg.deliveryStatus === "read" && (
                            <div className="relative text-blue-400">
                              <Check className="h-3 w-3" />
                              <Check className="h-3 w-3 absolute -left-1" />
                            </div>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )
        })()}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-card p-4">
        {!isEncryptionReady && (
          <div className="mb-2 flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Setting up encryption - messages will send automatically when ready</span>
          </div>
        )}
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            placeholder={isEncryptionReady ? "Type your message..." : "Type message (will send when encryption ready)..."}
            disabled={isEncrypting}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || isEncrypting}
            size="icon"
            title={isEncryptionReady ? "Send message" : "Message will be queued"}
          >
            {isEncrypting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* End Chat Confirmation */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                End Chat?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to end this chat? This action cannot be undone, and
                you won't be able to send or receive messages in this conversation anymore.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowEndConfirm(false)}
                >
                  <XIcon className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleEndChat}
                >
                  <Check className="h-4 w-4 mr-2" />
                  End Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
