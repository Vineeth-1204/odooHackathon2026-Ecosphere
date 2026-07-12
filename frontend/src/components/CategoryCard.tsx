import React from "react";
import { Folder, Trash2, Edit } from "lucide-react";
import { Button } from "./ui/Button";

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    description: string | null;
  };
  onEdit?: () => void;
  onDelete?: () => void;
  isAdmin?: boolean;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onEdit,
  onDelete,
  isAdmin = false
}) => {
  return (
    <div className="glass-panel glass-panel-hover rounded-xl p-5 flex flex-col justify-between h-48">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
            <Folder size={18} />
          </div>
          <h4 className="text-sm font-bold text-slate-100 line-clamp-1">{category.name}</h4>
        </div>
        <p className="text-xs text-slate-400 mt-3.5 line-clamp-3 leading-relaxed">
          {category.description || "No description configured for this category."}
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
export default CategoryCard;
