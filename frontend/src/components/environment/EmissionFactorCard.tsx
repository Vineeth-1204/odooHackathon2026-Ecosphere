import React from "react";
import { Edit, Trash2 } from "lucide-react";

interface EmissionFactor {
  id: string;
  name: string;
  value: number;
  unit: string;
  source?: string;
  year: number;
  category: {
    id: string;
    name: string;
  };
}

interface EmissionFactorCardProps {
  factor: EmissionFactor;
  onEdit?: (factor: EmissionFactor) => void;
  onDelete?: (id: string) => void;
  isAdmin?: boolean;
}

export const EmissionFactorCard: React.FC<EmissionFactorCardProps> = ({
  factor,
  onEdit,
  onDelete,
  isAdmin = false
}) => {
  return (
    <div className="glass-panel glass-panel-hover rounded-xl p-5 flex flex-col justify-between h-48 select-none">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 font-bold px-2 py-0.5 rounded-full w-max">
            {factor.category.name}
          </span>
          <h4 className="font-bold text-slate-100 line-clamp-1 text-sm tracking-tight">
            {factor.name}
          </h4>
        </div>

        {isAdmin && (onEdit || onDelete) && (
          <div className="flex items-center gap-1.5">
            {onEdit && (
              <button
                onClick={() => onEdit(factor)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
                title="Edit Factor"
              >
                <Edit size={14} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(factor.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                title="Delete Factor"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Metric */}
      <div className="my-2.5">
        <span className="text-2xl font-extrabold text-emerald-400 tracking-tight">
          {factor.value}
        </span>
        <span className="text-xs text-slate-400 ml-1.5 font-medium">
          kg CO2e / {factor.unit}
        </span>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between border-t border-slate-900 pt-2.5 text-[10px] text-slate-500 font-semibold uppercase">
        <span className="truncate max-w-[140px]" title={factor.source || "Generic"}>
          Source: {factor.source || "Generic"}
        </span>
        <span>
          Year: {factor.year}
        </span>
      </div>
    </div>
  );
};
export default EmissionFactorCard;
