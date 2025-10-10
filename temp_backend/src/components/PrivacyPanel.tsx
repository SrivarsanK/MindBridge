import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { useState } from "react";

export function PrivacyPanel() {
  const profile = useQuery(api.users.getCurrentProfile);
  const auditLogs = useQuery(api.privacy.getAuditLogs, { limit: 20 });
  const exportRequests = useQuery(api.privacy.getDataExportStatus);
  const deletionRequests = useQuery(api.privacy.getDataDeletionStatus);

  const [allowPeerMatching, setAllowPeerMatching] = useState(
    profile?.privacySettings.allowPeerMatching ?? true
  );
  const [allowDreamAnalysis, setAllowDreamAnalysis] = useState(
    profile?.privacySettings.allowDreamAnalysis ?? true
  );
  const [shareEmotionalPatterns, setShareEmotionalPatterns] = useState(
    profile?.privacySettings.shareEmotionalPatterns ?? false
  );
  const [dataRetentionDays, setDataRetentionDays] = useState(
    profile?.privacySettings.dataRetentionDays ?? 90
  );

  const updatePrivacySettings = useMutation(api.users.updatePrivacySettings);
  const requestExport = useMutation(api.privacy.requestDataExport);
  const requestDeletion = useMutation(api.privacy.requestDataDeletion);

  const handleUpdateSettings = async () => {
    try {
      await updatePrivacySettings({
        privacySettings: {
          allowPeerMatching,
          allowDreamAnalysis,
          shareEmotionalPatterns,
          dataRetentionDays,
        },
      });
      toast.success("Privacy settings updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to update settings");
    }
  };

  const handleRequestExport = async () => {
    try {
      await requestExport({ requestType: "user_initiated" });
      toast.success("Data export requested. You'll be notified when ready.");
    } catch (error: any) {
      toast.error(error.message || "Failed to request export");
    }
  };

  const handleRequestDeletion = async () => {
    if (
      !confirm(
        "This will permanently delete all your data after 30 days. Are you sure?"
      )
    )
      return;

    try {
      await requestDeletion({ requestType: "user_initiated", scheduledDays: 30 });
      toast.success("Data deletion scheduled for 30 days from now");
    } catch (error: any) {
      toast.error(error.message || "Failed to request deletion");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Privacy & Data Control</h3>
        <p className="text-gray-600">
          You have complete control over your data. All information is encrypted and secure.
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-green-800 mb-3">🔒 Your Privacy Guarantees</h4>
        <ul className="space-y-2 text-gray-700 text-sm">
          <li>✓ End-to-end encryption for all sensitive data</li>
          <li>✓ Anonymous peer matching - no personal info shared</li>
          <li>✓ GDPR & CCPA compliant data handling</li>
          <li>✓ Complete audit trail of all data access</li>
          <li>✓ Right to export and delete your data anytime</li>
        </ul>
      </div>

      <div className="border-t pt-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Privacy Settings</h4>

        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={allowPeerMatching}
              onChange={(e) => setAllowPeerMatching(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <span className="text-gray-700">Allow anonymous peer matching</span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={allowDreamAnalysis}
              onChange={(e) => setAllowDreamAnalysis(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <span className="text-gray-700">Enable dream analysis features</span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={shareEmotionalPatterns}
              onChange={(e) => setShareEmotionalPatterns(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <span className="text-gray-700">
              Share anonymized emotional patterns for better matching
            </span>
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

          <button
            onClick={handleUpdateSettings}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Update Privacy Settings
          </button>
        </div>
      </div>

      <div className="border-t pt-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Data Management</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleRequestExport}
            className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left"
          >
            <h5 className="font-semibold text-blue-800 mb-2">📥 Export Your Data</h5>
            <p className="text-sm text-gray-600">
              Download all your data in a portable format
            </p>
          </button>

          <button
            onClick={handleRequestDeletion}
            className="p-4 bg-red-50 border-2 border-red-200 rounded-lg hover:bg-red-100 transition-colors text-left"
          >
            <h5 className="font-semibold text-red-800 mb-2">🗑️ Delete Your Data</h5>
            <p className="text-sm text-gray-600">
              Permanently remove all your information
            </p>
          </button>
        </div>
      </div>

      {auditLogs && auditLogs.length > 0 && (
        <div className="border-t pt-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity Log</h4>
          <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div key={log._id} className="text-sm border-b border-gray-200 pb-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-800">{log.action}</span>
                    <span className="text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-600">{log.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
