import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function CrisisPanel() {
  const crisisHistory = useQuery(api.crisis.getUserCrisisHistory);
  const triggerCrisis = useMutation(api.crisis.triggerManualCrisis);

  const handleTriggerCrisis = async () => {
    if (!confirm("This will notify crisis responders. Are you in immediate danger?")) return;

    try {
      await triggerCrisis({ notes: "User manually triggered crisis support" });
      toast.success("Crisis support has been notified. Help is on the way.");
    } catch (error: any) {
      toast.error(error.message || "Failed to trigger crisis support");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Crisis Support</h3>
        <p className="text-gray-600 mb-4">
          If you're in crisis, we're here to help. Your safety is our top priority.
        </p>
      </div>

      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
        <h4 className="text-xl font-bold text-red-800 mb-4">🆘 Emergency Resources</h4>
        <div className="space-y-3 text-gray-700">
          <p>
            <strong>National Suicide Prevention Lifeline:</strong>{" "}
            <a href="tel:988" className="text-blue-600 hover:underline font-semibold">
              988
            </a>
          </p>
          <p>
            <strong>Crisis Text Line:</strong> Text{" "}
            <span className="font-semibold">HELLO</span> to{" "}
            <a href="sms:741741" className="text-blue-600 hover:underline font-semibold">
              741741
            </a>
          </p>
          <p>
            <strong>International Association for Suicide Prevention:</strong>{" "}
            <a
              href="https://www.iasp.info/resources/Crisis_Centres/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Find resources worldwide
            </a>
          </p>
        </div>

        <button
          onClick={handleTriggerCrisis}
          className="w-full mt-6 py-4 bg-red-600 text-white rounded-lg font-bold text-lg hover:bg-red-700 transition-colors shadow-lg"
        >
          🆘 I Need Immediate Help
        </button>
      </div>

      {crisisHistory && crisisHistory.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Your Support History</h4>
          <div className="space-y-3">
            {crisisHistory.map((event) => (
              <div
                key={event._id}
                className={`p-4 rounded-lg border-2 ${
                  event.severity === "critical"
                    ? "bg-red-50 border-red-200"
                    : event.severity === "high"
                      ? "bg-orange-50 border-orange-200"
                      : "bg-yellow-50 border-yellow-200"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-gray-800">
                    {event.severity.toUpperCase()} - {event.source}
                  </span>
                  <span className="text-sm text-gray-600">
                    {new Date(event.detectedAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  Response Level: {event.responseLevel.replace(/_/g, " ")}
                </p>
                <p className="text-sm text-gray-600">Status: {event.status}</p>
                {event.notes && <p className="text-sm text-gray-600 mt-2">Notes: {event.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-blue-800 mb-3">How Crisis Detection Works</h4>
        <ul className="space-y-2 text-gray-700 text-sm">
          <li>✓ AI monitors conversations for crisis keywords and sentiment</li>
          <li>✓ Graduated response system from self-help to emergency intervention</li>
          <li>✓ Crisis responders are notified for high-severity events</li>
          <li>✓ All crisis events are logged for follow-up care</li>
          <li>✓ Your privacy is maintained while ensuring your safety</li>
        </ul>
      </div>
    </div>
  );
}
