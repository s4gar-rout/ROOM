"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { MoreHorizontal, Trash2, X } from "lucide-react";
import type { Message } from "../types/conversation";

// ── Types ──────────────────────────────────────────────────────────────────

interface MessageBubbleProps {
  message: Message;
  mine: boolean;
  isGroupStart?: boolean;
  isGroupEnd?: boolean;
  onDeleteForMe?: () => void;
  onDeleteForEveryone?: () => void;
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
}: {
  onConfirm: () => void;
  onCancel: () => void;
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
          className="
            flex-1 border-r border-[#E8E3D6]
            py-2.5 text-[12px] font-medium text-[#756B60]
            transition-colors hover:bg-[#1C1B18]/5
          "
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="
            flex-1 py-2.5 text-[12px]
            font-medium text-[#A53B32]
            transition-colors hover:bg-[#A53B32]/5
          "
        >
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
  onDeleteForMe,
  onDeleteForEveryoneClick,
  onConfirmDeleteForEveryone,
  onCancelConfirm,
}: {
  mine: boolean;
  menuRef: React.RefObject<HTMLDivElement | null>;
  showConfirm: boolean;
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
        ${mine ? "right-0" : "left-0"}
        animate-in fade-in zoom-in-95 duration-150 origin-top
      `}
    >
      <button
        role="menuitem"
        type="button"
        onClick={onDeleteForMe}
        className="
          flex w-full items-center gap-2.5
          px-4 py-3 text-left
          font-sans text-[13px] text-[#1C1B18]
          transition-colors hover:bg-[#1C1B18]/5
        "
      >
        <Trash2 size={14} className="shrink-0 text-[#756B60]" aria-hidden />
        Delete for me
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
          ${isGroupEnd ? "mb-4" : "mb-0.5"}
          ${mine ? "justify-end" : "justify-start"}
        `}
      >
        <DeletedTombstone mine={mine} />
      </div>
    );
  }

  // ── Border radius per group position ─────────────────────────────────────

  const baseRadius = "rounded-[18px]";
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
        group flex w-full items-end
        ${mine ? "flex-row-reverse" : "flex-row"}
        ${isGroupEnd ? "mb-4" : "mb-0.5"}
        gap-1.5
      `}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        // Don't close menu on mouse leave — only close on outside click
      }}
      onTouchStart={startLongPress}
      onTouchEnd={cancelLongPress}
      onTouchMove={cancelLongPress}
    >
      {/* ── Bubble wrapper (max width container) ── */}
      <div className="relative flex min-w-0 max-w-[78%] flex-col sm:max-w-[65%]">

        {/* ── Floating 3-dot trigger ── */}
        {/*
         * Hidden by default. Visible on hover or when menu is open.
         * Uses opacity + scale transition so the layout is NEVER affected —
         * the button is always in the DOM, just invisible.
         */}
        <div
          className={`
            relative mb-1 flex h-6 items-center
            ${mine ? "justify-end" : "justify-start"}
          `}
        >
          <div className="relative">
            <button
              ref={triggerRef}
              type="button"
              aria-label="Message options"
              aria-expanded={showMenu}
              aria-haspopup="menu"
              onClick={() => setShowMenu((v) => !v)}
              className={`
                flex h-6 w-6 items-center justify-center
                rounded-full
                text-[#8A8177]
                transition-all duration-150
                hover:bg-[#1C1B18]/8 hover:text-[#1C1B18]
                focus-visible:outline-none focus-visible:ring-1
                focus-visible:ring-[#174D35]/40
                ${hovered || showMenu
                  ? "scale-100 opacity-100"
                  : "pointer-events-none scale-90 opacity-0"
                }
              `}
            >
              <MoreHorizontal size={15} aria-hidden />
            </button>

            {/* Action menu */}
            {showMenu && (
              <ActionMenu
                mine={mine}
                menuRef={menuRef}
                showConfirm={showConfirm}
                onDeleteForMe={handleDeleteForMe}
                onDeleteForEveryoneClick={handleDeleteForEveryoneClick}
                onConfirmDeleteForEveryone={handleConfirmDeleteForEveryone}
                onCancelConfirm={() => setShowConfirm(false)}
              />
            )}
          </div>
        </div>

        {/* ── Bubble ── */}
        <div
          className={`
            ${bubbleClass}
            break-words px-3.5 py-2.5
            text-[14px] leading-relaxed
            shadow-[0_1px_3px_rgba(0,0,0,0.05)]
            ${
              mine
                ? "bg-[#174D35] text-[#FFFDF8]"
                : "border border-[#1C1B18]/[0.07] bg-[#FFFDF8] text-[#1C1B18]"
            }
          `}
          style={{ overflowWrap: "break-word", wordBreak: "break-word" }}
          // Tap on bubble to open menu on mobile
          onDoubleClick={() => setShowMenu((v) => !v)}
        >
          {message.message}
        </div>

        {/* ── Timestamp + read receipt (shown only for last in group) ── */}
        {isGroupEnd && (
          <div
            className={`
              mt-1 flex items-center gap-1
              text-[9px] text-[#9A9186]
              ${mine ? "justify-end" : "justify-start"}
            `}
          >
            <span>{time}</span>
            {mine && (
              <span
                aria-label={message.read ? "Read" : "Sent"}
                className="tracking-[-2px]"
              >
                {message.read ? "✓✓" : "✓"}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}