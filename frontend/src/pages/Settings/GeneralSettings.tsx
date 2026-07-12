import React, { useState, useEffect } from "react";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Mail, Globe, Save, CheckCircle } from "lucide-react";
import settingsService from "../../services/settingsService";

interface GeneralSettingsProps {
  settingsObject: Record<string, string>;
  onSaveSuccess: () => void;
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  settingsObject,
  onSaveSuccess
}) => {
  const [siteName, setSiteName] = useState("");
  const [systemEmail, setSystemEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setSiteName(settingsObject["site_name"] || "");
    setSystemEmail(settingsObject["system_email"] || "");
  }, [settingsObject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setIsSaving(true);

    try {
      await settingsService.updateSettings([
        { key: "site_name", value: siteName },
        { key: "system_email", value: systemEmail }
      ]);
      setSuccess("General settings updated successfully!");
      onSaveSuccess();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to update general settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {success && (
        <div className="p-3 text-xs font-semibold rounded bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center gap-2">
          <CheckCircle size={16} />
          <span>{success}</span>
        </div>
      )}

      <Input
        id="siteName"
        type="text"
        label="Platform Name"
        placeholder="Ecosphere ESG Portal"
        value={siteName}
        onChange={(e) => setSiteName(e.target.value)}
        icon={<Globe size={16} />}
        disabled={isSaving}
        required
      />

      <Input
        id="systemEmail"
        type="email"
        label="Admin Contact Email"
        placeholder="sustainability@ecosphere.com"
        value={systemEmail}
        onChange={(e) => setSystemEmail(e.target.value)}
        icon={<Mail size={16} />}
        disabled={isSaving}
        required
      />

      <Button type="submit" className="w-fit self-end mt-2 flex items-center gap-2" isLoading={isSaving}>
        <Save size={16} />
        Save General Settings
      </Button>
    </form>
  );
};
export default GeneralSettings;
