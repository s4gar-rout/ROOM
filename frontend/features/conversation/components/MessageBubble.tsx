"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import type { Message } from "../types/conversation";

// ── Types ──────────────────────────────────────────────────────────────────

interface MessageBubbleProps {
  message: Message;
  mine: boolean;
  isGroupStart?: boolean;
  isGroupEnd?: boolean;
  onDeleteForMe?: () => void;
  onDeleteForEveryone?: () => void;
  isDeletingForMe?: boolean;
  isDeletingForEveryone?: boolean;
}

// ── Deleted tombstone ──────────────────────────────────────────────────────

function DeletedTombstone({ mine }: { mine: boolean }) {
  return (
    <div className={`flex w-full ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className="
          flex items-center gap-1.5
          rounded-[17px]
          border border-[#1C1B18]/[0.07]
          bg-[#FFFDF8]/80
          px-4 py-2.5
          text-[13px] italic text-[#9A9186]
        "
      >
        <Trash2 size={11} className="shrink-0 opacity-50" aria-hidden />
        This message was deleted
      </div>
    </div>
  );
}

// ── Confirm dialog (inline) ────────────────────────────────────────────────

function DeleteConfirm({
  onConfirm,
  onCancel,
  isDeleting,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}) {
  return (
    <div
      className="
        absolute bottom-full right-0 z-[300] mb-2 w-52 overflow-hidden
        rounded-[18px] border border-[#E8E3D6] bg-[#FFFDF8]
        shadow-[0_12px_40px_rgba(28,27,24,0.14)]
        animate-in fade-in zoom-in-95 duration-150
      "
      role="alertdialog"
      aria-label="Confirm delete for everyone"
    >
      <div className="border-b border-[#E8E3D6] px-4 py-3">
        <p className="font-serif text-[13px] font-medium text-[#1C1B18]">
          Delete for everyone?
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-[#756B60]">
          This message will be removed for both participants.
        </p>
      </div>
      <div className="flex bg-[#FFFDF8]">
        <button
          type="button"
          onClick={onCancel}
          disabled={isDeleting}
          className="
            flex-1 border-r border-[#E8E3D6]
            py-2.5 text-[12px] font-medium text-[#756B60]
            transition-colors hover:bg-[#1C1B18]/5
            disabled:opacity-50
          "
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isDeleting}
          className="
            flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[12px]
            font-medium text-[#A53B32]
            transition-colors hover:bg-[#A53B32]/5
            disabled:opacity-50
          "
        >
          {isDeleting && <Loader2 size={12} className="animate-spin" />}
          Delete
        </button>
      </div>
    </div>
  );
}

// ── Action menu ────────────────────────────────────────────────────────────

function ActionMenu({
  mine,
  menuRef,
  showConfirm,
  isDeletingForMe,
  isDeletingForEveryone,
  onDeleteForMe,
  onDeleteForEveryoneClick,
  onConfirmDeleteForEveryone,
  onCancelConfirm,
}: {
  mine: boolean;
  menuRef: React.RefObject<HTMLDivElement | null>;
  showConfirm: boolean;
  isDeletingForMe?: boolean;
  isDeletingForEveryone?: boolean;
  onDeleteForMe: () => void;
  onDeleteForEveryoneClick: () => void;
  onConfirmDeleteForEveryone: () => void;
  onCancelConfirm: () => void;
}) {
  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Message options"
      className={`
        absolute top-full z-[200]
        mt-1.5 w-48 overflow-hidden
        rounded-[18px] border border-[#E8E3D6] bg-[#FFFDF8]
        shadow-[0_12px_40px_rgba(28,27,24,0.14)]
        ${mine ? "left-0 sm:right-0 sm:left-auto" : "right-0 sm:left-0 sm:right-auto"}
        animate-in fade-in zoom-in-95 duration-150 origin-top
      `}
    >
      <button
        role="menuitem"
        type="button"
        onClick={onDeleteForMe}
        disabled={isDeletingForMe}
        className="
          flex w-full items-center gap-2.5
          px-4 py-3 text-left
          font-sans text-[13px] text-[#1C1B18]
          transition-colors hover:bg-[#1C1B18]/5
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        {isDeletingForMe ? (
          <Loader2 size={14} className="shrink-0 text-[#756B60] animate-spin" aria-hidden />
        ) : (
          <Trash2 size={14} className="shrink-0 text-[#756B60]" aria-hidden />
        )}
        {isDeletingForMe ? "Deleting..." : "Delete for me"}
      </button>

      {mine && (
        <div className="relative border-t border-[#E8E3D6]">
          <button
            role="menuitem"
            type="button"
            onClick={onDeleteForEveryoneClick}
            className="
              flex w-full items-center gap-2.5
              px-4 py-3 text-left
              font-sans text-[13px] text-[#A53B32]
              transition-colors hover:bg-[#A53B32]/5
            "
          >
            <Trash2 size={14} className="shrink-0" aria-hidden />
            Delete for everyone
          </button>

          {/* Inline confirmation — sits above the "delete for everyone" button */}
          {showConfirm && (
            <DeleteConfirm
              onConfirm={onConfirmDeleteForEveryone}
              onCancel={onCancelConfirm}
              isDeleting={isDeletingForEveryone}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export default function MessageBubble({
  message,
  mine,
  isGroupStart = true,
  isGroupEnd = true,
  onDeleteForMe,
  onDeleteForEveryone,
  isDeletingForMe,
  isDeletingForEveryone,
}: MessageBubbleProps) {
  const [hovered, setHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // ── Close menu on outside click or Escape ────────────────────────────────

  const closeMenu = useCallback(() => {
    setShowMenu(false);
    setShowConfirm(false);
  }, []);

  useEffect(() => {
    if (!showMenu) return;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      const inMenu = menuRef.current?.contains(target);
      const inTrigger = triggerRef.current?.contains(target);
      if (!inMenu && !inTrigger) closeMenu();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showMenu, closeMenu]);

  // ── Long press (mobile) ───────────────────────────────────────────────────

  const startLongPress = () => {
    longPressTimer.current = setTimeout(() => {
      setShowMenu(true);
    }, 480);
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  useEffect(() => () => cancelLongPress(), []);

  // ── Action handlers ───────────────────────────────────────────────────────

  const handleDeleteForMe = () => {
    closeMenu();
    onDeleteForMe?.();
  };

  const handleDeleteForEveryoneClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmDeleteForEveryone = () => {
    closeMenu();
    onDeleteForEveryone?.();
  };

  // ── Deleted state ─────────────────────────────────────────────────────────

  if (message.isDeletedForEveryone || message.isDeleted) {
    return (
      <div
        className={`
          flex w-full
          ${isGroupEnd ? "mb-3 sm:mb-4" : "mb-[2px] sm:mb-0.5"}
          ${mine ? "justify-end" : "justify-start"}
        `}
      >
        <DeletedTombstone mine={mine} />
      </div>
    );
  }

  // ── Border radius per group position ─────────────────────────────────────

  const baseRadius = "rounded-[18px] sm:rounded-[20px]";
  const topRadius = mine
    ? isGroupStart ? "" : "!rounded-tr-[6px]"
    : isGroupStart ? "" : "!rounded-tl-[6px]";
  const bottomRadius = mine
    ? isGroupEnd ? "" : "!rounded-br-[6px]"
    : isGroupEnd ? "" : "!rounded-bl-[6px]";

  const bubbleClass = `${baseRadius} ${topRadius} ${bottomRadius}`.trim();

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      ref={wrapperRef}
      className={`
        group relative flex w-full items-end
        ${mine ? "flex-row-reverse" : "flex-row"}
        ${isGroupEnd ? "mb-3 sm:mb-4" : "mb-[2px] sm:mb-0.5"}
        gap-1.5 sm:gap-2
      `}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={startLongPress}
      onTouchEnd={cancelLongPress}
      onTouchMove={cancelLongPress}
    >
      {/* ── Bubble wrapper (max width container) ── */}
      <div
        className={`relative flex min-w-0 max-w-[85%] flex-col sm:max-w-[70%] lg:max-w-[65%] ${
          mine ? "items-end" : "items-start"
        }`}
      >

        {/* ── Bubble ── */}
        <div className="relative flex items-center group">
          <div
            className={`
              ${bubbleClass}
              break-words px-3.5 py-2 sm:px-4 sm:py-2.5
              text-[15px] sm:text-[14px] leading-[1.4] sm:leading-relaxed
              shadow-sm
              ${
                mine
                  ? "bg-[#174D35] text-[#FFFDF8]"
                  : "border border-[#1C1B18]/[0.08] bg-[#FFFDF8] text-[#1C1B18]"
              }
            `}
            style={{ overflowWrap: "break-word", wordBreak: "break-word" }}
            onDoubleClick={() => setShowMenu((v) => !v)}
          >
            {message.message}
          </div>

          {/* ── Floating 3-dot trigger (desktop/tablet only usually, but accessible on mobile via double-click/long-press) ── */}
          <div className={`
            absolute top-1/2 -translate-y-1/2
            ${mine ? "-left-9" : "-right-9"}
          `}>
            <div className="relative">
              <button
                ref={triggerRef}
                type="button"
                aria-label="Message options"
                aria-expanded={showMenu}
                aria-haspopup="menu"
                onClick={() => setShowMenu((v) => !v)}
                className={`
                  flex h-7 w-7 items-center justify-center
                  rounded-full bg-transparent
                  text-[#8A8177]
                  transition-all duration-150
                  hover:bg-[#1C1B18]/8 hover:text-[#1C1B18]
                  focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#174D35]/40
                  ${hovered || showMenu
                    ? "scale-100 opacity-100"
                    : "pointer-events-none scale-90 opacity-0"
                  }
                `}
              >
                <MoreHorizontal size={16} aria-hidden />
              </button>

              {/* Action menu */}
              {showMenu && (
                <ActionMenu
                  mine={mine}
                  menuRef={menuRef}
                  showConfirm={showConfirm}
                  isDeletingForMe={isDeletingForMe}
                  isDeletingForEveryone={isDeletingForEveryone}
                  onDeleteForMe={handleDeleteForMe}
                  onDeleteForEveryoneClick={handleDeleteForEveryoneClick}
                  onConfirmDeleteForEveryone={handleConfirmDeleteForEveryone}
                  onCancelConfirm={() => setShowConfirm(false)}
                />
              )}
            </div>
          </div>
        </div>

        {/* ── Timestamp + read receipt (shown only for last in group) ── */}
        {isGroupEnd && (
          <div
            className={`
              mt-1 flex items-center gap-1
              text-xs text-[#8A8177] sm:text-[11px] sm:text-[#9A9186]
              ${mine ? "justify-end" : "justify-start"}
            `}
          >
            <span>{time}</span>
            {mine && (
              <div
                className={`flex items-center gap-1 transition-colors duration-300 ${
                  message.read ? "text-[#174D35]" : ""
                }`}
              >
                <span
                  aria-label={message.read ? "Seen" : "Sent"}
                  className="tracking-[-1.5px]"
                >
                  {message.read ? "✓✓" : "✓"}
                </span>
                {message.read && (
                  <span className="text-[11px] font-medium tracking-wide sm:text-[10px]">Seen</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
