import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/Button";
import { Save, CheckCircle, ToggleLeft, ToggleRight } from "lucide-react";
import settingsService from "../../services/settingsService";

interface NotificationSettingsProps {
  settingsObject: Record<string, string>;
  onSaveSuccess: () => void;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  settingsObject,
  onSaveSuccess
}) => {
  const [digest, setDigest] = useState(true);
  const [alerts, setAlerts] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setDigest(settingsObject["notify_email_digest"] !== "false");
    setAlerts(settingsObject["notify_on_new_user"] === "true");
  }, [settingsObject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setIsSaving(true);

    try {
      await settingsService.updateSettings([
        { key: "notify_email_digest", value: String(digest) },
        { key: "notify_on_new_user", value: String(alerts) }
      ]);
      setSuccess("Notification configurations saved!");
      onSaveSuccess();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to update notification settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {success && (
        <div className="p-3 text-xs font-semibold rounded bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center gap-2">
          <CheckCircle size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* Digest toggle */}
      <div className="flex items-center justify-between p-4 bg-slate-950/40 rounded-lg border border-slate-900">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-300">Weekly ESG Summary Digest</span>
          <span className="text-[10px] text-slate-500 mt-0.5">Send a consolidated sustainability report to department managers weekly</span>
        </div>
        <button
          type="button"
          onClick={() => setDigest(!digest)}
          className={`transition-colors ${digest ? "text-brand-400" : "text-slate-600"}`}
          disabled={isSaving}
        >
          {digest ? <ToggleRight size={38} /> : <ToggleLeft size={38} />}
        </button>
      </div>

      {/* Alerts toggle */}
      <div className="flex items-center justify-between p-4 bg-slate-950/40 rounded-lg border border-slate-900">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-slate-300">Compliance & Audit Alert Broadcasts</span>
          <span className="text-[10px] text-slate-500 mt-0.5">Alert administrators immediately when non-compliance is logged</span>
        </div>
        <button
          type="button"
          onClick={() => setAlerts(!alerts)}
          className={`transition-colors ${alerts ? "text-brand-400" : "text-slate-600"}`}
          disabled={isSaving}
        >
          {alerts ? <ToggleRight size={38} /> : <ToggleLeft size={38} />}
        </button>
      </div>

      <Button type="submit" className="w-fit self-end mt-2 flex items-center gap-2" isLoading={isSaving}>
        <Save size={16} />
        Save Notification Settings
      </Button>
    </form>
  );
};
export default NotificationSettings;
