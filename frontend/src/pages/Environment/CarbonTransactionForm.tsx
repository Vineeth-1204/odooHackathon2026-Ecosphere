import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link as RouterLink } from "react-router-dom";
import { ArrowLeft, Leaf, Save } from "lucide-react";
import carbonService from "../../services/carbonService";
import emissionService from "../../services/emissionService";
import departmentService from "../../services/departmentService";
import { useAuth } from "../../context/AuthContext";
import { Loading } from "../../components/ui/Loading";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";


interface EmissionFactor {
  id: string;
  name: string;
  value: number;
  unit: string;
}

interface Department {
  id: string;
  name: string;
}

export const CarbonTransactionForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { user } = useAuth();
  const isEdit = !!id;

  const [factors, setFactors] = useState<EmissionFactor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [activityValue, setActivityValue] = useState<number | "">("");
  const [emissionFactorId, setEmissionFactorId] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  // Track the active factor details for calculator
  const selectedFactor = factors.find((f) => f.id === emissionFactorId);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setFetching(true);
        const [factorData, deptData] = await Promise.all([
          emissionService.getEmissionFactors(),
          departmentService.getDepartments()
        ]);

        setFactors(factorData.emissionFactors || []);
        setDepartments(deptData.departments || []);

        // Default department selection to logged user's department if available
        if (user?.departmentId) {
          setDepartmentId(user.departmentId);
        }

        if (isEdit && id) {
          const txData = await carbonService.getTransactionById(id);
          const t = txData.transaction;
          if (t) {
            setDate(new Date(t.date).toISOString().split("T")[0]);
            setDescription(t.description);
            setActivityValue(t.activityValue);
            setEmissionFactorId(t.emissionFactorId);
            setDepartmentId(t.departmentId);
          }
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load form details.");
      } finally {
        setFetching(false);
      }
    };
    bootstrap();
  }, [id, isEdit, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !description || activityValue === "" || !emissionFactorId || !departmentId) {
      setError("Please fill out all required fields.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        date: new Date(date).toISOString(),
        description,
        activityValue: Number(activityValue),
        emissionFactorId,
        departmentId
      };

      if (isEdit && id) {
        await carbonService.updateTransaction(id, payload);
      } else {
        await carbonService.createTransaction(payload);
      }

      navigate("/environment/transactions");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while saving transaction.");
    } finally {
      setLoading(false);
    }
  };

  // Real-time calculation helper
  const calculatedEmissions = selectedFactor && activityValue !== "" 
    ? Number((activityValue * selectedFactor.value).toFixed(2))
    : 0;

  if (fetching) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <Loading text="Loading log details..." />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      {/* Back Button */}
      <RouterLink
        to="/environment/transactions"
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors w-max"
      >
        <ArrowLeft size={14} /> Back to ledger
      </RouterLink>

      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2">
          <Leaf className="text-emerald-400" size={20} />
          {isEdit ? "Modify Carbon Entry" : "Log Carbon Activity"}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {isEdit 
            ? "Modify resource utilization parameters." 
            : "Record energy, travel, or waste utilization to calculate carbon equivalents."}
        </p>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="glass-panel rounded-xl p-6 space-y-5">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 text-xs">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="tx-date" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Activity Date
              </label>
              <input
                id="tx-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="glass-input w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs py-2"
              />
            </div>

            {/* Department */}
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="tx-dept" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Department Owner
              </label>
              <select
                id="tx-dept"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                required
                className="glass-input w-full bg-slate-950 border border-slate-800 text-xs py-2"
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <Input
            id="tx-desc"
            label="Activity Description"
            placeholder="e.g., Monthly electricity consumption for Office Wing A"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Emission Factor */}
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="tx-factor" className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Emission Source / Factor
              </label>
              <select
                id="tx-factor"
                value={emissionFactorId}
                onChange={(e) => setEmissionFactorId(e.target.value)}
                required
                className="glass-input w-full bg-slate-950 border border-slate-800 text-xs py-2"
              >
                <option value="">Select Source Factor</option>
                {factors.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.value} kg CO2e)
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <Input
              id="tx-quantity"
              type="number"
              step="any"
              label={`Quantity consumed ${selectedFactor ? `(${selectedFactor.unit})` : ""}`}
              placeholder="e.g. 500"
              value={activityValue}
              onChange={(e) => setActivityValue(e.target.value === "" ? "" : Number(e.target.value))}
              required
              disabled={!emissionFactorId}
              helperText={!emissionFactorId ? "Choose an emission source first" : ""}
            />
          </div>
        </div>

        {/* Real-time Emissions Calculator Glow Badge */}
        {selectedFactor && activityValue !== "" && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between shadow-lg shadow-emerald-500/5 animate-pulse select-none">
            <div className="flex items-center gap-2">
              <Leaf className="text-emerald-400" size={16} />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">Real-time Emissions Estimate</span>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-emerald-400 tracking-tight">
                {calculatedEmissions.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 font-bold ml-1 uppercase">
                kg CO2e
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-3 border-t border-slate-900 justify-end">
          <RouterLink
            to="/environment/transactions"
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-slate-900/60 transition-colors"
          >
            Cancel
          </RouterLink>
          <Button
            type="submit"
            isLoading={loading}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-950"
          >
            <Save size={14} /> Log Entry
          </Button>
        </div>
      </form>
    </div>
  );
};
export default CarbonTransactionForm;
