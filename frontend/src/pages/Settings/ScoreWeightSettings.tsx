import React, { useState, useEffect } from "react";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Save, CheckCircle, ShieldAlert } from "lucide-react";
import settingsService from "../../services/settingsService";

interface ScoreWeightSettingsProps {
  settingsObject: Record<string, string>;
  onSaveSuccess: () => void;
}

export const ScoreWeightSettings: React.FC<ScoreWeightSettingsProps> = ({
  settingsObject,
  onSaveSuccess
}) => {
  const [envWeight, setEnvWeight] = useState("0.4");
  const [socWeight, setSocWeight] = useState("0.3");
  const [govWeight, setGovWeight] = useState("0.3");
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setEnvWeight(settingsObject["esg_score_weight_environmental"] || "0.4");
    setSocWeight(settingsObject["esg_score_weight_social"] || "0.3");
    setGovWeight(settingsObject["esg_score_weight_governance"] || "0.3");
  }, [settingsObject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    setIsSaving(true);

    const envNum = parseFloat(envWeight);
    const socNum = parseFloat(socWeight);
    const govNum = parseFloat(govWeight);

    if (isNaN(envNum) || isNaN(socNum) || isNaN(govNum)) {
      setError("All weights must be valid numbers");
      setIsSaving(false);
      return;
    }

    if (envNum < 0 || envNum > 1 || socNum < 0 || socNum > 1 || govNum < 0 || govNum > 1) {
      setError("All individual weights must be between 0.00 and 1.00");
      setIsSaving(false);
      return;
    }

    // Floating point summation correction
    const sum = parseFloat((envNum + socNum + govNum).toFixed(4));
    if (sum !== 1.0) {
      setError(`Weights must sum to exactly 1.00. Current sum is: ${sum.toFixed(2)}`);
      setIsSaving(false);
      return;
    }

    try {
      await settingsService.updateSettings([
        { key: "esg_score_weight_environmental", value: envWeight },
        { key: "esg_score_weight_social", value: socWeight },
        { key: "esg_score_weight_governance", value: govWeight }
      ]);
      setSuccess("ESG engine weights updated successfully!");
      onSaveSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save score weights");
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

      {error && (
        <div className="p-3 text-xs font-semibold rounded bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-2">
          <ShieldAlert size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Input
          id="envWeight"
          type="number"
          step="0.01"
          min="0"
          max="1"
          label="Environmental (E)"
          placeholder="0.4"
          value={envWeight}
          onChange={(e) => setEnvWeight(e.target.value)}
          disabled={isSaving}
          required
        />

        <Input
          id="socWeight"
          type="number"
          step="0.01"
          min="0"
          max="1"
          label="Social (S)"
          placeholder="0.3"
          value={socWeight}
          onChange={(e) => setSocWeight(e.target.value)}
          disabled={isSaving}
          required
        />

        <Input
          id="govWeight"
          type="number"
          step="0.01"
          min="0"
          max="1"
          label="Governance (G)"
          placeholder="0.3"
          value={govWeight}
          onChange={(e) => setGovWeight(e.target.value)}
          disabled={isSaving}
          required
        />
      </div>

      <div className="p-4 bg-slate-950/40 rounded-lg border border-slate-900 text-xs text-slate-400 leading-normal">
        <span className="font-bold text-slate-300 block mb-1">Calculation Logic:</span>
        Overall ESG score is computed as: <code className="text-brand-400">Score = (E_score * E_weight) + (S_score * S_weight) + (G_score * G_weight)</code>.
        The system requires the sum of all coefficients to equal exactly <span className="font-bold text-slate-300">1.00</span>.
      </div>

      <Button type="submit" className="w-fit self-end mt-2 flex items-center gap-2" isLoading={isSaving}>
        <Save size={16} />
        Save ESG Weights
      </Button>
    </form>
  );
};
export default ScoreWeightSettings;
