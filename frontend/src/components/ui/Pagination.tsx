import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  limit: number;
  totalItems: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  limit,
  totalItems
}) => {
  if (totalPages <= 1) return null;

  const startIdx = (currentPage - 1) * limit + 1;
  const endIdx = Math.min(currentPage * limit, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-800/80 bg-slate-900/10">
      <div className="text-xs text-slate-400">
        Showing <span className="font-semibold text-slate-200">{startIdx}</span> to{" "}
        <span className="font-semibold text-slate-200">{endIdx}</span> of{" "}
        <span className="font-semibold text-slate-200">{totalItems}</span> entries
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft size={16} className="mr-0.5" />
          Previous
        </Button>
        <div className="flex items-center gap-1.5 px-2">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            // For hackathon, just show all buttons. If total pages is large, we can truncate, but standard is fine
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`w-7 h-7 text-xs font-semibold rounded-md flex items-center justify-center transition-colors ${
                  currentPage === pageNum
                    ? "bg-brand-500 text-white font-bold"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight size={16} className="ml-0.5" />
        </Button>
      </div>
    </div>
  );
};
