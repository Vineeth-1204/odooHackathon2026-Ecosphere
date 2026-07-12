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
    <div className="glass-panel glass-panel-hover rounded-xl p-5 flex flex-col justify-between h-48 bg-white border border-[#E4E6DF] shadow-sm text-left">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#EAF0EC] text-[#1F4032]">
            <Folder size={18} />
          </div>
          <h4 className="text-sm font-bold text-[#24333E] line-clamp-1">{category.name}</h4>
        </div>
        <p className="text-xs text-[#90998C] mt-3.5 line-clamp-3 leading-relaxed">
          {category.description || "No description configured for this category."}
        </p>
      </div>

      {isAdmin && (
        <div className="flex items-center justify-end gap-2 border-t border-[#E4E6DF] pt-3 mt-4">
          <Button variant="ghost" size="sm" onClick={onEdit} className="h-8 w-8 !p-0">
            <Edit size={14} className="text-[#90998C] hover:text-[#24333E]" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} className="h-8 w-8 !p-0 hover:bg-red-50">
            <Trash2 size={14} className="text-[#C1503A] hover:brightness-110" />
          </Button>
        </div>
      )}
    </div>
  );
};
export default CategoryCard;
