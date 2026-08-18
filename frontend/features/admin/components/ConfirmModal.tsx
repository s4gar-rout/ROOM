import { X } from "lucide-react";
import ButtonLoader from "@/components/ui/ButtonLoader";

type ConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
};

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = true,
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1B18]/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm rounded-[2px] bg-white p-6 shadow-xl animate-in zoom-in-95 duration-200"
        data-lenis-prevent="true"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-serif font-medium text-[#1C1B18]">{title}</h2>
          <button onClick={onClose} disabled={isLoading} className="text-[#5F554A] hover:text-[#1C1B18]">
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-[#5F554A] mb-6">{description}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-full px-5 py-2 text-sm font-medium text-[#5F554A] hover:bg-[#1C1B18]/5 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`rounded-full px-5 py-2 text-sm font-medium text-white disabled:opacity-50 flex items-center gap-2 ${
              isDestructive ? "bg-red-600 hover:bg-red-700" : "bg-[#174D35] hover:bg-[#174D35]/90"
            }`}
          >
            {isLoading && <ButtonLoader color="#FFFFFF" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
