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
  Smile,
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
import {
  moderateContent,
  getViolationMessage,
  requiresImmediateReview,
  type ModerationResult,
} from "@/lib/moderation"

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
  const [initializationError, setInitializationError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [moderationWarning, setModerationWarning] = useState<string | null>(null)
  const [isMessageBlocked, setIsMessageBlocked] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

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
        setInitializationError(null)
        
        // Try to load existing keys from storage
        let storedIdentity = await KeyStorage.getIdentityKeyPair(matchId)
        let storedPreKey = await KeyStorage.getPreKeyPair(matchId)
        let needsUpload = false

        // Generate new keys if not found
        if (!storedIdentity) {
          console.log("📝 Generating new identity key pair...")
          const identityKP = await generateKeyPair()
          storedIdentity = {
            publicKey: await exportPublicKey(identityKP.publicKey),
            privateKey: await exportPrivateKey(identityKP.privateKey),
          }
          await KeyStorage.saveIdentityKeyPair(matchId, storedIdentity)
          needsUpload = true
        }

        if (!storedPreKey) {
          console.log("📝 Generating new pre-key pair...")
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
            console.log("📤 Uploading public keys to server...")
            await uploadPreKeys({
              identityPublicKey: storedIdentity.publicKey,
              signedPreKeyPublic: storedPreKey.publicKey,
              preKeys: [storedPreKey.publicKey], // Single pre-key for simplicity
              preKeySignature: storedPreKey.publicKey, // Simplified signature
            })
            console.log("✅ Public keys uploaded to server")
          } catch (error) {
            console.error("❌ Failed to upload public keys:", error)
            throw new Error("Failed to upload encryption keys to server")
          }
        }

        // Derive shared secret when peer's pre-key bundle is available
        if (peerPreKeyBundle && storedIdentity) {
          try {
            console.log("🔐 Deriving shared secret with peer...")
            const myPrivateKey = await importPrivateKey(storedIdentity.privateKey)
            const peerPublicKey = await importPublicKey(peerPreKeyBundle.identityKey)
            const sharedSecret = await deriveSharedSecret(myPrivateKey, peerPublicKey)
            setEncryptionKey(sharedSecret)
            console.log("✅ Encryption established successfully")
          } catch (error) {
            console.error("❌ Failed to derive shared secret:", error)
            throw new Error("Failed to establish encryption with peer")
          }
        } else if (!peerPreKeyBundle && retryCount < 5) {
          // Retry after a delay if peer's keys aren't available yet
          console.log(`⏳ Waiting for peer's encryption keys... (attempt ${retryCount + 1}/5)`)
          setTimeout(() => setRetryCount(prev => prev + 1), 2000)
          return
        }

        setIsInitializing(false)
        setInitializationError(null)
      } catch (error) {
        console.error("❌ Failed to initialize encryption keys:", error)
        setInitializationError(error instanceof Error ? error.message : "Failed to initialize encryption")
        setIsInitializing(false)
      }
    }

    initializeKeys()
  }, [matchId, peerPreKeyBundle]) // Remove uploadPreKeys from deps as it's stable

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
  }, [encryptionKey, optimisticMessages, matchId, sendMessage]) // Include all dependencies used in the effect

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [decryptedMessages, optimisticMessages])

  const handleSendMessage = async () => {
    if (!messageInput.trim() || isEncrypting) return

    const messageText = messageInput.trim()
    
    // ========== CONTENT MODERATION ==========
    // Run moderation check BEFORE sending
    const moderationResult = moderateContent(messageText)
    
    // Clear previous warnings
    setModerationWarning(null)
    setIsMessageBlocked(false)
    
    // If message is blocked, show warning and don't send
    if (!moderationResult.allowed) {
      const warningMessage = getViolationMessage(moderationResult)
      setModerationWarning(warningMessage)
      setIsMessageBlocked(true)
      
      // Auto-clear warning after 5 seconds
      setTimeout(() => {
        setModerationWarning(null)
        setIsMessageBlocked(false)
      }, 5000)
      
      console.warn('🚫 Message blocked by moderation:', moderationResult)
      return
    }
    
    // If message has low-severity violations, show warning but allow sending
    if (moderationResult.violations.length > 0) {
      const warningMessage = getViolationMessage(moderationResult)
      setModerationWarning(warningMessage)
      
      // Auto-clear warning after 4 seconds
      setTimeout(() => setModerationWarning(null), 4000)
    }
    // ========================================
    
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
        <p className="text-sm text-muted-foreground">
          {retryCount > 0 ? `Retrying connection... (${retryCount}/5)` : "Generating secure keys"}
        </p>
        {retryCount > 3 && (
          <p className="text-xs text-yellow-600 dark:text-yellow-400">
            Taking longer than expected. Your peer might be offline.
          </p>
        )}
      </div>
    )
  }

  if (initializationError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 p-6">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <p className="text-lg font-medium text-center">Failed to Initialize Encryption</p>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          {initializationError}
        </p>
        <div className="flex gap-3">
          <Button
            onClick={() => {
              setIsInitializing(true)
              setInitializationError(null)
              setRetryCount(0)
            }}
            className="gap-2"
          >
            <Shield className="h-4 w-4" />
            Retry Connection
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  // Continue to show chat even without encryption key (like WhatsApp)
  // Messages will be queued until encryption is ready
  const isEncryptionReady = !!encryptionKey

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-transparent">
      {/* Header - Glassmorphism Style */}
      <div className="backdrop-blur-xl bg-[color-mix(in_srgb,var(--background)_70%,transparent)] border-b border-[color-mix(in_srgb,var(--border)_50%,transparent)] px-4 py-3 flex items-center justify-between shadow-[0_4px_16px_0_color-mix(in_srgb,var(--foreground)_5%,transparent)]">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard")}
            className="text-[var(--foreground)] hover:bg-[color-mix(in_srgb,var(--accent)_20%,transparent)] flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {/* Profile Avatar & Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">
                {matchDetails.peerDisplayName?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-[var(--foreground)] text-lg font-medium truncate">
                {matchDetails.peerDisplayName}
              </h1>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1.5">
                  <Lock className="h-3 w-3 text-[#00a884]" />
                  <span className="text-[var(--muted-foreground)]">Encrypted</span>
                </div>
                {peerOnline && (
                  <>
                    <span className="text-[var(--muted-foreground)]">•</span>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#00a884] animate-pulse" />
                      <span className="text-[#00a884] font-medium">Online</span>
                    </div>
                  </>
                )}
                {/* Connection Status */}
                <span className="text-[var(--muted-foreground)]">•</span>
                {isEncryptionReady ? (
                  <span className="text-[#00a884] text-xs">✓ Connected</span>
                ) : optimisticMessages.length > 0 ? (
                  <span className="text-[#ffa500] text-xs">⏳ {optimisticMessages.length} queued</span>
                ) : (
                  <span className="text-[#8696a0] text-xs">Setting up...</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowEndConfirm(true)}
          className="text-[#aebac1] hover:bg-[#2a3942] px-3"
        >
          End Chat
        </Button>
      </div>

      {/* Messages - Glassmorphism Style */}
      <div className="flex-1 overflow-y-auto backdrop-blur-sm bg-[color-mix(in_srgb,var(--background)_30%,transparent)] px-6 py-4">
        {(() => {
          // Combine optimistic and decrypted messages, sort by timestamp
          const allMessages = [...decryptedMessages, ...optimisticMessages]
            .sort((a, b) => a.timestamp - b.timestamp)

          return allMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle className="h-16 w-16 mb-4 text-[var(--muted-foreground)] opacity-50" />
              <p className="text-[var(--foreground)] text-xl font-medium mb-2">No messages yet</p>
              <p className="text-[var(--muted-foreground)] text-sm">Start the conversation with your peer!</p>
            </div>
          ) : (
            <div className="space-y-1">
              {allMessages.map((msg, index) => {
                const isOptimistic = msg._id.startsWith('temp-')
                const showTimestamp = index === 0 ||
                  (allMessages[index - 1] &&
                   new Date(msg.timestamp).toDateString() !== new Date(allMessages[index - 1].timestamp).toDateString())

                return (
                  <div key={msg._id}>
                    {showTimestamp && (
                      <div className="flex justify-center my-4">
                        <span className="backdrop-blur-sm bg-[color-mix(in_srgb,var(--muted)_60%,transparent)] text-[var(--muted-foreground)] text-xs px-3 py-1 rounded-full border border-[color-mix(in_srgb,var(--border)_30%,transparent)]">
                          {new Date(msg.timestamp).toLocaleDateString([], {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}

                    <div className={`flex mb-1 ${msg.isMine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[65%] min-w-0 ${msg.isMine ? "order-2" : "order-1"}`}>
                        <div
                          className={`relative px-4 py-2 rounded-2xl shadow-sm backdrop-blur-sm ${
                            msg.isMine
                              ? "bg-[color-mix(in_srgb,var(--primary)_80%,transparent)] text-[var(--primary-foreground)] rounded-br-md border border-[color-mix(in_srgb,var(--primary)_30%,transparent)]"
                              : "bg-[color-mix(in_srgb,var(--muted)_70%,transparent)] text-[var(--foreground)] rounded-bl-md border border-[color-mix(in_srgb,var(--border)_40%,transparent)]"
                          } ${msg.decryptionFailed ? "border-2 border-red-500" : ""} ${
                            isOptimistic ? "opacity-80" : ""
                          }`}
                        >
                          {msg.decryptionFailed && (
                            <div className="flex items-center gap-1 text-xs text-red-400 mb-1">
                              <AlertTriangle className="h-3 w-3" />
                              <span>Decryption failed</span>
                            </div>
                          )}

                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {msg.plaintext}
                          </p>

                          <div className={`flex items-center justify-end gap-1 mt-1 ${
                            msg.isMine ? "flex-row-reverse" : ""
                          }`}>
                            <span className={`text-xs ${
                              msg.isMine ? "text-[var(--muted-foreground)]" : "text-[var(--muted-foreground)]"
                            }`}>
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>

                            {msg.isMine && (
                              <div className="flex items-center ml-1">
                                {isOptimistic ? (
                                  <Loader2 className="h-3 w-3 animate-spin text-[var(--muted-foreground)]" />
                                ) : msg.deliveryStatus ? (
                                  <span className="flex items-center" title={
                                    msg.deliveryStatus === "sent" ? "Sent" :
                                    msg.deliveryStatus === "delivered" ? "Delivered" :
                                    "Read"
                                  }>
                                    {msg.deliveryStatus === "sent" && (
                                      <Check className="h-3 w-3 text-[var(--muted-foreground)]" />
                                    )}
                                    {msg.deliveryStatus === "delivered" && (
                                      <div className="relative">
                                        <Check className="h-3 w-3 text-[var(--muted-foreground)]" />
                                        <Check className="h-3 w-3 text-[var(--muted-foreground)] absolute -left-1" />
                                      </div>
                                    )}
                                    {msg.deliveryStatus === "read" && (
                                      <div className="relative text-[#00a884]">
                                        <Check className="h-3 w-3" />
                                        <Check className="h-3 w-3 absolute -left-1" />
                                      </div>
                                    )}
                                  </span>
                                ) : null}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })()}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-card p-4">
        {/* Moderation Warning Banner */}
        {moderationWarning && (
          <div className={`mb-2 flex items-start gap-2 text-xs rounded-lg p-3 ${
            isMessageBlocked
              ? 'text-red-700 dark:text-red-400 bg-red-500/10 border border-red-500/30'
              : 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30'
          }`}>
            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{moderationWarning}</span>
          </div>
        )}
        
        {!isEncryptionReady && (
          <div className="mb-2 flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-lg p-2 backdrop-blur-sm">
            <Loader2 className="h-3 w-3 animate-spin flex-shrink-0" />
            <span>Setting up encryption - messages will send automatically when ready</span>
          </div>
        )}

        {/* Message Input - Glassmorphism Style */}
        <div className="backdrop-blur-xl bg-[color-mix(in_srgb,var(--background)_70%,transparent)] border-t border-[color-mix(in_srgb,var(--border)_50%,transparent)] px-4 py-3 shadow-[0_-4px_16px_0_color-mix(in_srgb,var(--foreground)_5%,transparent)]">
        {optimisticMessages.length > 0 && (
          <div className="mb-2 flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 backdrop-blur-sm">
            <Loader2 className="h-3 w-3 animate-spin flex-shrink-0" />
            <span>
              <strong>{optimisticMessages.length}</strong> {optimisticMessages.length === 1 ? "message" : "messages"} queued - establishing secure connection...
            </span>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              placeholder={isEncryptionReady ? "Type a message..." : "Type message (will send when encryption ready)..."}
              disabled={isEncrypting}
              className="w-full backdrop-blur-sm bg-[color-mix(in_srgb,var(--input)_80%,transparent)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] border border-[color-mix(in_srgb,var(--border)_40%,transparent)] rounded-2xl px-4 py-3 pr-12 resize-none min-h-[44px] max-h-32 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-all duration-200"
              rows={1}
              style={{
                height: 'auto',
                minHeight: '44px'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 128) + 'px';
              }}
            />
            <button
              type="button"
              title="Add emoji"
              className="absolute right-3 bottom-3 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              onClick={() => {/* TODO: Add emoji picker */}}
            >
              <Smile className="h-5 w-5" />
            </button>
          </div>

          <button
            type="submit"
            disabled={!messageInput.trim() || isEncrypting}
            className={`p-3 rounded-full transition-all duration-200 backdrop-blur-sm ${
              messageInput.trim() && !isEncrypting
                ? "bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--primary-foreground)] shadow-lg"
                : "bg-[color-mix(in_srgb,var(--muted)_60%,transparent)] text-[var(--muted-foreground)] cursor-not-allowed border border-[color-mix(in_srgb,var(--border)_30%,transparent)]"
            }`}
          >
            {isEncrypting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isMessageBlocked ? (
              <XIcon className="h-5 w-5" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </form>

        {isEncryptionReady && (
          <div className="flex items-center gap-2 mt-2 text-xs text-[var(--muted-foreground)]">
            <Lock className="h-3 w-3" />
            <span>Messages are end-to-end encrypted</span>
          </div>
        )}
      </div>
      </div>

      {/* End Chat Confirmation */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-auto max-w-xs mx-auto">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                End Chat?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to end this chat? This action cannot be undone, and
                you won't be able to send or receive messages in this conversation anymore.
              </p>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 h-8 text-xs"
                  onClick={() => setShowEndConfirm(false)}
                >
                  <XIcon className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 h-8 text-xs"
                  onClick={handleEndChat}
                >
                  <Check className="h-3 w-3 mr-1" />
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
