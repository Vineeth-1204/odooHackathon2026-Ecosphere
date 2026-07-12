import React from "react";
import { Calendar, Target, AlertTriangle } from "lucide-react";

interface Goal {
  id: string;
  name: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: string | Date;
  endDate: string | Date;
  status: string;
  department?: {
    id: string;
    name: string;
  };
}

interface GoalProgressCardProps {
  goal: Goal;
  onEdit?: (goal: Goal) => void;
  isAdminOrManager?: boolean;
}

export const GoalProgressCard: React.FC<GoalProgressCardProps> = ({
  goal,
  onEdit,
  isAdminOrManager = false
}) => {
  const percent = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
  const isOverBudget = goal.currentValue > goal.targetValue;
  
  // Format dates
  const start = new Date(goal.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
  const end = new Date(goal.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
  
  // Days remaining calculation
  const today = new Date();
  const endD = new Date(goal.endDate);
  const diffTime = endD.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const statusConfig: Record<string, { label: string; style: string }> = {
    ACTIVE: {
      label: "Active",
      style: isOverBudget 
        ? "bg-red-500/10 text-red-400 border-red-500/20" 
        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    },
    ACHIEVED: {
      label: "Achieved",
      style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    },
    FAILED: {
      label: "Failed",
      style: "bg-red-500/10 text-red-400 border-red-500/20"
    }
  };

  const status = statusConfig[goal.status] || { label: goal.status, style: "bg-slate-800 text-slate-400 border-slate-700" };

  return (
    <div className="glass-panel glass-panel-hover rounded-xl p-5 flex flex-col justify-between h-full relative overflow-hidden group">
      {/* Top Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">
              {goal.department?.name || "Company Wide Target"}
            </span>
            <h4 className="font-bold text-slate-100 group-hover:text-white transition-colors tracking-tight line-clamp-1">
              {goal.name}
            </h4>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${status.style}`}>
            {status.label}
          </span>
        </div>

        {goal.description && (
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {goal.description}
          </p>
        )}
      </div>

      {/* Progress Metric */}
      <div className="my-5 flex flex-col gap-2">
        <div className="flex items-end justify-between text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Target size={14} className="text-emerald-400" />
            <span>Target Cap</span>
          </div>
          <span className="text-slate-200">
            {goal.currentValue.toLocaleString()} /{" "}
            <span className="font-bold text-slate-100">{goal.targetValue.toLocaleString()}</span>{" "}
            <span className="text-[10px] text-slate-500">{goal.unit}</span>
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-900/60 rounded-full border border-slate-800/50 overflow-hidden relative">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOverBudget 
                ? "bg-gradient-to-r from-red-500 to-rose-600" 
                : "bg-gradient-to-r from-emerald-500 to-green-600"
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold uppercase mt-0.5">
          <span>{percent.toFixed(0)}% Utilized</span>
          {isOverBudget && (
            <span className="text-red-400 flex items-center gap-1">
              <AlertTriangle size={10} /> Limit Exceeded
            </span>
          )}
        </div>
      </div>

      {/* Bottom Date/Footer Section */}
      <div className="border-t border-slate-900 pt-3.5 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold">
          <Calendar size={12} className="text-slate-500" />
          <span>{start} - {end}</span>
        </div>
        <div className="flex items-center gap-2">
          {daysLeft > 0 && goal.status === "ACTIVE" ? (
            <span className="text-[10px] text-slate-400 font-semibold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {daysLeft} days left
            </span>
          ) : (
            <span className="text-[10px] text-slate-500 font-semibold">Ended</span>
          )}
          
          {isAdminOrManager && onEdit && (
            <button
              onClick={() => onEdit(goal)}
              className="text-[10px] text-brand-400 hover:text-brand-300 font-bold border-l border-slate-800 pl-2 cursor-pointer transition-colors"
            >
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
