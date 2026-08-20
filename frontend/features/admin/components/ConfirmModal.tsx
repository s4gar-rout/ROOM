import { X, Trash2 } from "lucide-react";
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
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0F1E17]/45 backdrop-blur-[10px] animate-in fade-in duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div className="relative w-full max-w-[480px] sm:max-w-[500px]">
        <div 
          className="w-full border border-[#174D35]/12 bg-[#FAF7F2] p-7 sm:p-9 shadow-[0_24px_50px_-12px_rgba(28,27,24,0.14)] text-[#1C1B18] animate-in fade-in zoom-in-95 duration-300 ease-out"
          data-lenis-prevent="true"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-11 w-11 items-center justify-center bg-[#174D35]/8 text-[#174D35] border border-[#174D35]/12">
              <Trash2 size={20} strokeWidth={1.75} />
            </div>
            <button 
              onClick={onClose} 
              disabled={isLoading} 
              className="p-1.5 text-[#756A5C] hover:bg-[#1C1B18]/5 hover:text-[#1C1B18] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <h2 className="font-serif text-2xl sm:text-[28px] font-normal leading-tight text-[#1C1B18] tracking-tight">{title}</h2>
          <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-[#756A5C]">{description}</p>
          
          <div className="my-6 border-t border-[#1C1B18]/8" />
          
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 sm:gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto h-11 border border-[#1C1B18]/15 bg-[#F5F0E5]/70 px-6 text-xs sm:text-[13px] font-semibold text-[#1C1B18] hover:bg-[#EFE8D8] hover:-translate-y-[1px] active:translate-y-0 transition-all duration-200 disabled:opacity-50 cursor-pointer"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="w-full sm:w-auto h-11 bg-[#174D35] px-6 text-xs sm:text-[13px] font-semibold text-[#F8F4EA] hover:bg-[#123E2B] hover:-translate-y-[1px] active:translate-y-0 transition-all duration-200 disabled:opacity-50 shadow-sm shadow-[#174D35]/20 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading && <ButtonLoader color="#F8F4EA" />}
              {confirmText}
            </button>
          </div>
        </div>

        {/* Architectural Corners */}
        <span className="absolute -left-1 -top-1 h-3 w-3 border-l border-t border-[#174D35]" />
        <span className="absolute -right-1 -top-1 h-3 w-3 border-r border-t border-[#174D35]" />
        <span className="absolute -bottom-1 -left-1 h-3 w-3 border-b border-l border-[#174D35]" />
        <span className="absolute -bottom-1 -right-1 h-3 w-3 border-b border-r border-[#174D35]" />
      </div>
    </div>
  );
}
