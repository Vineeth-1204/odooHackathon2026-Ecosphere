import React, { useState, useEffect } from "react";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

interface DepartmentFormProps {
  initialData?: {
    id: string;
    name: string;
    description: string | null;
  } | null;
  onSubmit: (data: { name: string; description: string }) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}

export const DepartmentForm: React.FC<DepartmentFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSaving = false
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setDescription(initialData.description || "");
    } else {
      setName("");
      setDescription("");
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Department name is required");
      return;
    }

    try {
      await onSubmit({ name, description });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save department details.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="p-3 text-xs font-semibold rounded bg-red-500/10 border border-red-500/20 text-red-400">
          {error}
        </div>
      )}

      <Input
        id="dept-name"
        type="text"
        label="Department Name"
        placeholder="e.g. Sustainability & ESG"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        disabled={isSaving}
      />

      <div className="flex flex-col gap-1.5 w-full">
        <label htmlFor="dept-desc" className="text-xs font-semibold text-[#90998C] uppercase tracking-wider">
          Description
        </label>
        <textarea
          id="dept-desc"
          placeholder="Describe the department's role and operations..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="glass-input h-24 resize-none"
          disabled={isSaving}
        />
      </div>

      <div className="flex justify-end gap-3 border-t border-[#E4E6DF]/80 pt-4 mt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSaving}>
          {initialData ? "Update Department" : "Create Department"}
        </Button>
      </div>
    </form>
  );
};
export default DepartmentForm;
