import React from "react";
import { Users, Trash2, Edit } from "lucide-react";
import { Button } from "./ui/Button";

interface DepartmentCardProps {
  department: {
    id: string;
    name: string;
    description: string | null;
    _count?: {
      users: number;
    };
  };
  onEdit?: () => void;
  onDelete?: () => void;
  isAdmin?: boolean;
}

export const DepartmentCard: React.FC<DepartmentCardProps> = ({
  department,
  onEdit,
  onDelete,
  isAdmin = false
}) => {
  const memberCount = department._count?.users ?? 0;

  return (
    <div className="glass-panel glass-panel-hover rounded-xl p-5 flex flex-col justify-between h-48">
      <div>
        <div className="flex justify-between items-start gap-2">
          <h4 className="text-base font-bold text-slate-100 line-clamp-1">{department.name}</h4>
          <div className="flex items-center gap-1 bg-brand-500/10 text-brand-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider h-fit">
            <Users size={12} className="mr-1" />
            {memberCount} {memberCount === 1 ? "User" : "Users"}
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
          {department.description || "No description provided for this department."}
        </p>
      </div>

      {isAdmin && (
        <div className="flex items-center justify-end gap-2 border-t border-slate-800/80 pt-3 mt-4">
          <Button variant="ghost" size="sm" onClick={onEdit} className="h-8 w-8 !p-0">
            <Edit size={14} className="text-slate-400 hover:text-white" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} className="h-8 w-8 !p-0 hover:bg-red-500/10">
            <Trash2 size={14} className="text-red-400 hover:text-red-300" />
          </Button>
        </div>
      )}
    </div>
  );
};
export default DepartmentCard;
