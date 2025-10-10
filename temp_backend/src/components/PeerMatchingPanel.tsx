import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

export function PeerMatchingPanel() {
  const [mood, setMood] = useState("");
  const [lonelinessLevel, setLonelinessLevel] = useState(5);
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState("");
  const [selectedMatch, setSelectedMatch] = useState<Id<"peerMatches"> | null>(null);
  const [messageText, setMessageText] = useState("");

  const matches = useQuery(api.peerMatching.getActiveMatches);
  const messages = useQuery(
    api.peerMatching.getPeerMessages,
    selectedMatch ? { matchId: selectedMatch } : "skip"
  );

  const requestMatch = useMutation(api.peerMatching.requestPeerMatch);
  const sendMessage = useMutation(api.peerMatching.sendPeerMessage);
  const endMatch = useMutation(api.peerMatching.endPeerMatch);

  const handleRequestMatch = async () => {
    if (!mood || interests.length === 0) {
      toast.error("Please fill in your mood and at least one interest");
      return;
    }

    try {
      await requestMatch({ mood, lonelinessLevel, interests });
      toast.success("Finding a peer match for you...");
    } catch (error: any) {
      toast.error(error.message || "Failed to request match");
    }
  };

  const handleAddInterest = () => {
    if (interestInput.trim() && !interests.includes(interestInput.trim())) {
      setInterests([...interests, interestInput.trim()]);
      setInterestInput("");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedMatch) return;

    try {
      await sendMessage({ matchId: selectedMatch, content: messageText });
      setMessageText("");
    } catch (error: any) {
      toast.error(error.message || "Failed to send message");
    }
  };

  const handleEndMatch = async () => {
    if (!selectedMatch) return;
    if (!confirm("Are you sure you want to end this peer connection?")) return;

    try {
      await endMatch({ matchId: selectedMatch });
      setSelectedMatch(null);
      toast.success("Peer connection ended");
    } catch (error: any) {
      toast.error(error.message || "Failed to end match");
    }
  };

  if (selectedMatch) {
    const match = matches?.find((m) => m._id === selectedMatch);
    return (
      <div className="flex flex-col h-[600px]">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Peer Chat</h3>
            <p className="text-sm text-gray-600">Ice breaker: {match?.iceBreaker}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedMatch(null)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Back
            </button>
            <button
              onClick={handleEndMatch}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              End Chat
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-4 mb-4 space-y-4">
          {messages?.map((msg) => (
            <div
              key={msg._id}
              className={`flex ${msg.senderId === match?.user1Id ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-4 ${
                  msg.senderId === match?.user1Id
                    ? "bg-purple-600 text-white"
                    : "bg-white text-gray-800 shadow-md"
                }`}
              >
                <p>{msg.encryptedContent}</p>
                <p className="text-xs mt-2 opacity-70">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={!messageText.trim()}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Anonymous Peer Support</h3>
        <p className="text-gray-600 mb-6">
          Connect with someone who understands. All conversations are anonymous and encrypted.
        </p>
      </div>

      {matches && matches.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Your Active Connections</h4>
          <div className="space-y-2">
            {matches.map((match) => (
              <button
                key={match._id}
                onClick={() => setSelectedMatch(match._id)}
                className="w-full p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left"
              >
                <p className="font-semibold text-gray-800">Match Score: {match.matchScore}%</p>
                <p className="text-sm text-gray-600">{match.iceBreaker}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {match.messageCount} messages • Last active:{" "}
                  {new Date(match.lastActivityAt).toLocaleString()}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border-t pt-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Find a New Peer</h4>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How are you feeling right now?
            </label>
            <input
              type="text"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder="e.g., anxious, lonely, stressed..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loneliness Level: {lonelinessLevel}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={lonelinessLevel}
              onChange={(e) => setLonelinessLevel(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interests (to find common ground)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddInterest())}
                placeholder="Add an interest..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={handleAddInterest}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-2"
                >
                  {interest}
                  <button
                    onClick={() => setInterests(interests.filter((i) => i !== interest))}
                    className="text-purple-500 hover:text-purple-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={handleRequestMatch}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
          >
            Find a Peer Match
          </button>
        </div>
      </div>
    </div>
  );
}
