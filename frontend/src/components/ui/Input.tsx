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
    <div className="flex flex-col gap-1.5 w-full text-left">
      {label && (
        <label htmlFor={id} className="text-xs font-bold text-[#24333E] uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#90998C] pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        )}
        <input
          id={id}
          className={`glass-input w-full ${icon ? "pl-10 pr-4" : "px-4"} ${
            error ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : ""
          } ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs font-medium text-red-500 mt-0.5">{error}</span>}
      {!error && helperText && <span className="text-xs text-[#90998C] mt-0.5">{helperText}</span>}
    </div>
  );
};
