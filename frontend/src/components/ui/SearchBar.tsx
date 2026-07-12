import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "./Input";

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  debounceMs?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search...",
  value,
  onChange,
  debounceMs = 300
}) => {
  const [localVal, setLocalVal] = useState(value);

  // Sync internal state when parent value changes
  useEffect(() => {
    setLocalVal(value);
  }, [value]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localVal !== value) {
        onChange(localVal);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localVal, debounceMs, onChange, value]);

  const handleClear = () => {
    setLocalVal("");
    onChange("");
  };

  return (
    <div className="relative w-full max-w-sm">
      <Input
        type="text"
        placeholder={placeholder}
        value={localVal}
        onChange={(e) => setLocalVal(e.target.value)}
        icon={<Search size={18} />}
        className="pr-10"
      />
      {localVal && (
        <button
          onClick={handleClear}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-0.5 rounded hover:bg-slate-800 transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
