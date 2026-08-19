"use client";

import { useState } from "react";
import { Bell, ArrowUpRight, Loader2 } from "lucide-react";
import { subscribeToPush } from "../services/push.service";

interface NotificationPromptModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export default function NotificationPromptModal({
  isOpen,
  onComplete,
}: NotificationPromptModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAllow = async () => {
    setLoading(true);
    try {
      await subscribeToPush();
    } catch {
      // Continue regardless
    } finally {
      setLoading(false);
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1B18]/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md border border-[#1C1B18]/20 bg-[#F8F4EA] p-7 sm:p-9 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between border-b border-[#1C1B18]/10 pb-4">
          <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#5F554A]">
            Account Created
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#174D35]">
            01 / 02
          </span>
        </div>

        {/* Icon & Title */}
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#174D35]/10 text-[#174D35]">
          <Bell size={22} />
        </div>

        <h2 className="font-serif text-3xl font-normal leading-tight tracking-tight text-[#1C1B18]">
          Stay updated with <em className="text-[#174D35]">ROOM.</em>
        </h2>

        <p className="mt-3 text-xs font-medium leading-relaxed text-[#5F554A]">
          Allow browser notifications for instant alerts when you receive new chat messages, room inquiries, or important updates.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleAllow}
            disabled={loading}
            className="group flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#174D35] px-5 text-xs font-semibold uppercase tracking-[0.16em] !text-[#F8F4EA] transition-all duration-300 hover:bg-[#F8F4EA] hover:!text-[#174D35] hover:ring-1 hover:ring-[#174D35]/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin text-[#F8F4EA]" />
            ) : (
              <>
                Allow Notifications
                <ArrowUpRight
                  size={15}
                  className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSkip}
            disabled={loading}
            className="h-10 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5F554A] transition-colors hover:text-[#174D35]"
          >
            Maybe Later
          </button>
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
