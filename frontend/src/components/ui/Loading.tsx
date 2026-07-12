import React from "react";

interface LoadingProps {
  fullPage?: boolean;
  size?: "sm" | "md" | "lg";
  text?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  fullPage = false,
  size = "md",
  text = "Loading data..."
}) => {
  const sizeClasses = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4"
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`animate-spin rounded-full border-t-brand-500 border-r-transparent border-b-transparent border-l-transparent ${sizeClasses[size]}`} />
      {text && <p className="text-xs font-medium text-slate-400 tracking-wider uppercase animate-pulse">{text}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8 w-full h-full">
      {spinner}
    </div>
  );
};
