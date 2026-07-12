import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/Button";
import { Save, CheckCircle, ToggleLeft, ToggleRight } from "lucide-react";
import settingsService from "../../services/settingsService";

interface FeatureToggleProps {
  settingsObject: Record<string, string>;
  onSaveSuccess: () => void;
}

export const FeatureToggle: React.FC<FeatureToggleProps> = ({
  settingsObject,
  onSaveSuccess
}) => {
  const [allowReg, setAllowReg] = useState(false);
  const [maintenance, setMaintenance] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setAllowReg(settingsObject["allow_user_registration"] === "true");
    setMaintenance(settingsObject["maintenance_mode"] === "true");
  }, [settingsObject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setIsSaving(true);

    try {
      await settingsService.updateSettings([
        { key: "allow_user_registration", value: String(allowReg) },
        { key: "maintenance_mode", value: String(maintenance) }
      ]);
      setSuccess("Feature toggles saved successfully!");
      onSaveSuccess();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to update feature toggles");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {success && (
        <div className="p-3 text-xs font-semibold rounded bg-brand-500/10 border border-brand-500/20 text-[#1F4032] flex items-center gap-2">
          <CheckCircle size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* Reg Toggle */}
      <div className="flex items-center justify-between p-4 bg-white/40 rounded-lg border border-[#E4E6DF]">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-[#24333E]">Public User Registration</span>
          <span className="text-[10px] text-[#90998C] mt-0.5">Allow employees to register accounts on the signup page</span>
        </div>
        <button
          type="button"
          onClick={() => setAllowReg(!allowReg)}
          className={`transition-colors ${allowReg ? "text-[#1F4032]" : "text-slate-600"}`}
          disabled={isSaving}
        >
          {allowReg ? <ToggleRight size={38} /> : <ToggleLeft size={38} />}
        </button>
      </div>

      {/* Maintenance Toggle */}
      <div className="flex items-center justify-between p-4 bg-white/40 rounded-lg border border-[#E4E6DF]">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-[#24333E]">Maintenance & Update Mode</span>
          <span className="text-[10px] text-[#90998C] mt-0.5">Restrict login access only to administrators for system upgrades</span>
        </div>
        <button
          type="button"
          onClick={() => setMaintenance(!maintenance)}
          className={`transition-colors ${maintenance ? "text-red-400" : "text-slate-600"}`}
          disabled={isSaving}
        >
          {maintenance ? <ToggleRight size={38} /> : <ToggleLeft size={38} />}
        </button>
      </div>

      <Button type="submit" className="w-fit self-end mt-2 flex items-center gap-2" isLoading={isSaving}>
        <Save size={16} />
        Save Feature Toggles
      </Button>
    </form>
  );
};
export default FeatureToggle;
