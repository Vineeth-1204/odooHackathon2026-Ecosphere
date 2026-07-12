import React from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { AlertCircle } from "lucide-react";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "info",
  isLoading = false
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex gap-4">
        <div className={`p-2.5 rounded-full h-fit ${
          type === "danger" 
            ? "bg-red-500/10 text-red-400" 
            : type === "warning" 
            ? "bg-yellow-500/10 text-yellow-400" 
            : "bg-blue-500/10 text-blue-400"
        }`}>
          <AlertCircle size={22} />
        </div>
        <div className="flex-1 flex flex-col gap-1.5">
          <p className="text-sm text-slate-300 leading-relaxed">{description}</p>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={onClose} disabled={isLoading}>
              {cancelText}
            </Button>
            <Button
              variant={type === "danger" ? "danger" : "primary"}
              onClick={onConfirm}
              isLoading={isLoading}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
