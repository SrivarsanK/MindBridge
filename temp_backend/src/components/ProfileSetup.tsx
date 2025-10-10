import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function ProfileSetup() {
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [displayName, setDisplayName] = useState("");
  const [allowPeerMatching, setAllowPeerMatching] = useState(true);
  const [allowDreamAnalysis, setAllowDreamAnalysis] = useState(true);
  const [shareEmotionalPatterns, setShareEmotionalPatterns] = useState(false);
  const [dataRetentionDays, setDataRetentionDays] = useState(90);

  const createProfile = useMutation(api.users.createOrUpdateProfile);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProfile({
        timezone,
        displayName: displayName || undefined,
        privacySettings: {
          allowPeerMatching,
          allowDreamAnalysis,
          shareEmotionalPatterns,
          dataRetentionDays,
        },
      });
      toast.success("Profile created successfully!");
    } catch (error) {
      toast.error("Failed to create profile");
      console.error(error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Welcome to MindBridge</h2>
      <p className="text-gray-600 mb-8">Let's set up your profile. Your privacy is our priority.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Display Name (Optional)
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="How should we address you?"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Europe/London">London</option>
            <option value="Europe/Paris">Paris</option>
            <option value="Asia/Tokyo">Tokyo</option>
            <option value="Australia/Sydney">Sydney</option>
          </select>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Privacy Settings</h3>

          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={allowPeerMatching}
                onChange={(e) => setAllowPeerMatching(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-700">Allow anonymous peer matching</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={allowDreamAnalysis}
                onChange={(e) => setAllowDreamAnalysis(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-700">Enable dream analysis features</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={shareEmotionalPatterns}
                onChange={(e) => setShareEmotionalPatterns(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-700">Share anonymized emotional patterns for better matching</span>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Retention: {dataRetentionDays} days
              </label>
              <input
                type="range"
                min="30"
                max="365"
                step="30"
                value={dataRetentionDays}
                onChange={(e) => setDataRetentionDays(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
        >
          Complete Setup
        </button>
      </form>
    </div>
  );
}
