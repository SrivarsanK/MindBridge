import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function DreamAnalysisPanel() {
  const [emotionalTags, setEmotionalTags] = useState<string[]>([]);
  const [stressIndicators, setStressIndicators] = useState<string[]>([]);
  const [recurringThemes, setRecurringThemes] = useState<string[]>([]);
  const [emotionalWeather, setEmotionalWeather] = useState("partly-cloudy");
  const [intensityScore, setIntensityScore] = useState(5);
  const [tagInput, setTagInput] = useState("");

  const analyses = useQuery(api.dreamAnalysis.getUserDreamAnalyses, { limit: 10 });
  const patterns = useQuery(api.dreamAnalysis.getEmotionalPatterns, { days: 30 });

  const createAnalysis = useMutation(api.dreamAnalysis.createDreamAnalysis);

  const handleAddTag = (type: "emotional" | "stress" | "theme") => {
    if (!tagInput.trim()) return;

    if (type === "emotional" && !emotionalTags.includes(tagInput)) {
      setEmotionalTags([...emotionalTags, tagInput]);
    } else if (type === "stress" && !stressIndicators.includes(tagInput)) {
      setStressIndicators([...stressIndicators, tagInput]);
    } else if (type === "theme" && !recurringThemes.includes(tagInput)) {
      setRecurringThemes([...recurringThemes, tagInput]);
    }
    setTagInput("");
  };

  const handleSubmit = async () => {
    if (emotionalTags.length === 0) {
      toast.error("Please add at least one emotional tag");
      return;
    }

    try {
      await createAnalysis({
        encryptedMetadata: JSON.stringify({ timestamp: Date.now() }),
        emotionalTags,
        stressIndicators,
        recurringThemes,
        emotionalWeather,
        intensityScore,
      });
      toast.success("Dream analysis recorded");
      setEmotionalTags([]);
      setStressIndicators([]);
      setRecurringThemes([]);
      setIntensityScore(5);
    } catch (error: any) {
      toast.error(error.message || "Failed to record analysis");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Dream & Emotion Analysis</h3>
        <p className="text-gray-600">
          Track your emotional patterns and recurring themes. All data is encrypted and private.
        </p>
      </div>

      {patterns && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Top Emotions (30 days)</h4>
            <div className="space-y-1">
              {Object.entries(patterns.emotionalTags)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 5)
                .map(([tag, count]) => (
                  <div key={tag} className="flex justify-between text-sm">
                    <span>{tag}</span>
                    <span className="font-semibold">{count as number}</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="font-semibold text-orange-800 mb-2">Stress Indicators</h4>
            <div className="space-y-1">
              {Object.entries(patterns.stressIndicators)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 5)
                .map(([indicator, count]) => (
                  <div key={indicator} className="flex justify-between text-sm">
                    <span>{indicator}</span>
                    <span className="font-semibold">{count as number}</span>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-2">Recurring Themes</h4>
            <div className="space-y-1">
              {Object.entries(patterns.recurringThemes)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 5)
                .map(([theme, count]) => (
                  <div key={theme} className="flex justify-between text-sm">
                    <span>{theme}</span>
                    <span className="font-semibold">{count as number}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      <div className="border-t pt-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Record New Analysis</h4>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emotional Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleAddTag("emotional"))
                }
                placeholder="e.g., anxious, peaceful, confused..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={() => handleAddTag("emotional")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {emotionalTags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    onClick={() => setEmotionalTags(emotionalTags.filter((t) => t !== tag))}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stress Indicators
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleAddTag("stress"))
                }
                placeholder="e.g., work pressure, relationship issues..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={() => handleAddTag("stress")}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {stressIndicators.map((indicator) => (
                <span
                  key={indicator}
                  className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm flex items-center gap-2"
                >
                  {indicator}
                  <button
                    onClick={() =>
                      setStressIndicators(stressIndicators.filter((i) => i !== indicator))
                    }
                    className="text-orange-500 hover:text-orange-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recurring Themes
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleAddTag("theme"))
                }
                placeholder="e.g., falling, being chased, flying..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={() => handleAddTag("theme")}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recurringThemes.map((theme) => (
                <span
                  key={theme}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-2"
                >
                  {theme}
                  <button
                    onClick={() => setRecurringThemes(recurringThemes.filter((t) => t !== theme))}
                    className="text-purple-500 hover:text-purple-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emotional Weather
            </label>
            <select
              value={emotionalWeather}
              onChange={(e) => setEmotionalWeather(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="sunny">☀️ Sunny (Positive, uplifting)</option>
              <option value="partly-cloudy">⛅ Partly Cloudy (Mixed emotions)</option>
              <option value="cloudy">☁️ Cloudy (Uncertain, confused)</option>
              <option value="rainy">🌧️ Rainy (Sad, melancholic)</option>
              <option value="stormy">⛈️ Stormy (Intense, turbulent)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Intensity Score: {intensityScore}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={intensityScore}
              onChange={(e) => setIntensityScore(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
          >
            Save Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
