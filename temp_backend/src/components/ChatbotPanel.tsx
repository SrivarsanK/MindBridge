import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

export function ChatbotPanel() {
  const [message, setMessage] = useState("");
  const [conversationId, setConversationId] = useState<Id<"conversations"> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversations = useQuery(api.chatbot.getUserConversations);
  const messages = useQuery(
    api.chatbot.getConversationMessages,
    conversationId ? { conversationId } : "skip"
  );

  const createConversation = useMutation(api.chatbot.createConversation);
  const sendMessage = useMutation(api.chatbot.sendMessage);

  useEffect(() => {
    if (conversations && conversations.length > 0 && !conversationId) {
      setConversationId(conversations[0]._id);
    }
  }, [conversations, conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNewConversation = async () => {
    try {
      const id = await createConversation();
      setConversationId(id);
      toast.success("New conversation started");
    } catch (error) {
      toast.error("Failed to create conversation");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !conversationId) return;

    try {
      await sendMessage({ conversationId, content: message });
      setMessage("");
    } catch (error: any) {
      toast.error(error.message || "Failed to send message");
    }
  };

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-gray-800">AI Mental Wellness Chat</h3>
        <button
          onClick={handleNewConversation}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-4 mb-4 space-y-4">
        {!messages || messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <p className="text-lg mb-2">👋 Hi! I'm here to listen and support you.</p>
            <p>Share what's on your mind, and let's talk through it together.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-4 ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-800 shadow-md"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.encryptedContent}</p>
                <p className="text-xs mt-2 opacity-70">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={!message.trim() || !conversationId}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>

      <p className="text-xs text-gray-500 mt-2 text-center">
        🔒 All conversations are encrypted and private. Crisis keywords are monitored for your safety.
      </p>
    </div>
  );
}
