import { useState } from "react";
import { ChatbotPanel } from "./ChatbotPanel";
import { PeerMatchingPanel } from "./PeerMatchingPanel";
import { DreamAnalysisPanel } from "./DreamAnalysisPanel";
import { CrisisPanel } from "./CrisisPanel";
import { PrivacyPanel } from "./PrivacyPanel";

type Tab = "chat" | "peer" | "dream" | "crisis" | "privacy";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("chat");

  const tabs = [
    { id: "chat" as Tab, label: "AI Chat", icon: "💬" },
    { id: "peer" as Tab, label: "Peer Support", icon: "🤝" },
    { id: "dream" as Tab, label: "Dream Analysis", icon: "🌙" },
    { id: "crisis" as Tab, label: "Crisis Support", icon: "🆘" },
    { id: "privacy" as Tab, label: "Privacy", icon: "🔒" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        {activeTab === "chat" && <ChatbotPanel />}
        {activeTab === "peer" && <PeerMatchingPanel />}
        {activeTab === "dream" && <DreamAnalysisPanel />}
        {activeTab === "crisis" && <CrisisPanel />}
        {activeTab === "privacy" && <PrivacyPanel />}
      </div>
    </div>
  );
}
