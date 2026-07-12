import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Target, Save, Trash2 } from "lucide-react";
import goalService from "../../services/goalService";
import departmentService from "../../services/departmentService";
import { Loading } from "../../components/ui/Loading";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

interface Department {
  id: string;
  name: string;
}

export const GoalForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetValue, setTargetValue] = useState<number | "">("");
  const [unit, setUnit] = useState("kg CO2e");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [departmentId, setDepartmentId] = useState("");

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setFetching(true);
        const deptData = await departmentService.getDepartments();
        setDepartments(deptData.departments || []);

        if (isEdit && id) {
          const goalData = await goalService.getGoalById(id);
          const g = goalData.goal;
          if (g) {
            setName(g.name);
            setDescription(g.description || "");
            setTargetValue(g.targetValue);
            setUnit(g.unit);
            setStartDate(new Date(g.startDate).toISOString().split("T")[0]);
            setEndDate(new Date(g.endDate).toISOString().split("T")[0]);
            setStatus(g.status);
            setDepartmentId(g.departmentId || "");
          }
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load goal data.");
      } finally {
        setFetching(false);
      }
    };
    bootstrap();
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || targetValue === "" || !unit || !startDate || !endDate) {
      setError("Please fill out all required fields.");
      return;
    }

    const startD = new Date(startDate);
    const endD = new Date(endDate);
    if (startD >= endD) {
      setError("The start date must be before the end date.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        name,
        description: description || undefined,
        targetValue: Number(targetValue),
        unit,
        startDate: startD.toISOString(),
        endDate: endD.toISOString(),
        status,
        departmentId: departmentId || null
      };

      if (isEdit && id) {
        await goalService.updateGoal(id, payload);
      } else {
        await goalService.createGoal(payload);
      }

      navigate("/admin/environment/goals");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while saving the sustainability goal.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit || !id) return;
    if (!window.confirm("Are you sure you want to delete this sustainability target?")) return;

    try {
      setLoading(true);
      await goalService.deleteGoal(id);
      navigate("/admin/environment/goals");
    } catch (err: any) {
      setError(err.message || "Failed to delete the goal.");
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <Loading text="Loading goal details..." />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      {/* Back Button */}
      <Link
        to="/admin/environment/goals"
        className="flex items-center gap-1.5 text-xs text-[#90998C] hover:text-[#24333E] transition-colors w-max"
      >
        <ArrowLeft size={14} /> Back to list
      </Link>

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-extrabold text-[#24333E] tracking-tight flex items-center gap-2">
            <Target className="text-[#1F4032]" size={20} />
            {isEdit ? "Modify Target Goal" : "Create Sustainability Target"}
          </h1>
          <p className="text-xs text-[#90998C] mt-1">
            {isEdit 
              ? "Update properties for this sustainability target." 
              : "Define a new target carbon cap limits and timelines."}
          </p>
        </div>

        {isEdit && (
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-bold border border-red-500/20 bg-red-500/5 px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
          >
            <Trash2 size={12} /> Delete
          </button>
        )}
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="glass-panel rounded-xl p-6 space-y-5">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 text-xs">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Name */}
          <Input
            id="goal-name"
            label="Goal Name (e.g. Q3 Carbon Cap)"
            placeholder="Reduce Q3 Scope 1 Emissions"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          {/* Description */}
          <div className="flex flex-col gap-1.5 w-full">
            <label htmlFor="goal-desc" className="text-xs font-semibold text-[#90998C] uppercase tracking-wider">
              Goal Description
            </label>
            <textarea
              id="goal-desc"
              placeholder="Detail target strategies..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="glass-input h-20 text-xs w-full py-2 bg-white/60 border border-[#E4E6DF] focus:border-brand-500 outline-none rounded-lg"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Target Value */}
            <Input
              id="goal-target"
              type="number"
              label="Target Cap Limit"
              placeholder="5000"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value === "" ? "" : Number(e.target.value))}
              required
            />

            {/* Unit */}
            <Input
              id="goal-unit"
              label="Unit of measure"
              placeholder="kg CO2e"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="goal-start" className="text-xs font-semibold text-[#90998C] uppercase tracking-wider">
                Start Date
              </label>
              <input
                id="goal-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="glass-input w-full bg-white border border-[#E4E6DF] text-[#24333E] text-xs py-2"
              />
            </div>

            {/* End Date */}
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="goal-end" className="text-xs font-semibold text-[#90998C] uppercase tracking-wider">
                End Date
              </label>
              <input
                id="goal-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="glass-input w-full bg-white border border-[#E4E6DF] text-[#24333E] text-xs py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Department (Optional) */}
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="goal-dept" className="text-xs font-semibold text-[#90998C] uppercase tracking-wider">
                Department Owner (Optional)
              </label>
              <select
                id="goal-dept"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="glass-input w-full bg-white border border-[#E4E6DF] text-xs py-2"
              >
                <option value="">Company-Wide Target (All Depts)</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="goal-status" className="text-xs font-semibold text-[#90998C] uppercase tracking-wider">
                Status
              </label>
              <select
                id="goal-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
                className="glass-input w-full bg-white border border-[#E4E6DF] text-xs py-2"
              >
                <option value="ACTIVE">Active</option>
                <option value="ACHIEVED">Achieved</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-3 border-t border-[#E4E6DF] justify-end">
          <Link
            to="/environment/goals"
            className="px-4 py-2 text-xs font-semibold text-[#90998C] hover:text-[#24333E] rounded-lg hover:bg-white/60 transition-colors"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            isLoading={loading}
            className="flex items-center gap-1.5 text-xs font-bold text-white"
          >
            <Save size={14} /> Save Target
          </Button>
        </div>
      </form>
    </div>
  );
};
export default GoalForm;
