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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-[#E4E6DF]/80 bg-white/10">
      <div className="text-xs text-[#90998C]">
        Showing <span className="font-semibold text-[#24333E]">{startIdx}</span> to{" "}
        <span className="font-semibold text-[#24333E]">{endIdx}</span> of{" "}
        <span className="font-semibold text-[#24333E]">{totalItems}</span> entries
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
                    : "text-[#90998C] hover:text-[#24333E] hover:bg-[#F3F5EF]"
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
