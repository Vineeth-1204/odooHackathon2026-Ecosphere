import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  className = "",
  id,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-slate-500 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={id}
          className={`glass-input w-full ${icon ? "pl-11" : "pl-4"} ${
            error ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : ""
          } ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs font-medium text-red-400 mt-0.5">{error}</span>}
      {!error && helperText && <span className="text-xs text-slate-500 mt-0.5">{helperText}</span>}
    </div>
  );
};
