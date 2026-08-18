"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";
import type { Message } from "../types/conversation";

// ── Component ──────────────────────────────────────────────────────────────

export default function MessageBubble({
  message,
  mine,
  isGroupStart = true,
  isGroupEnd = true,
  onDeleteForMe,
  onDeleteForEveryone,
}: {
  message: Message;
  mine: boolean;
  isGroupStart?: boolean;
  isGroupEnd?: boolean;
  onDeleteForMe?: () => void;
  onDeleteForEveryone?: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Close menu on outside click / Escape
  useEffect(() => {
    if (!showMenu) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setShowMenu(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowMenu(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showMenu]);

  // ── Deleted message ─────────────────────────────────────────────────────

  if (message.isDeletedForEveryone || message.isDeleted) {
    return (
      <div className={`flex w-full ${mine ? "justify-end" : "justify-start"}`}>
        <div
          className="
            max-w-[80%] rounded-[17px]
            border border-[#1C1B18]/[0.08]
            bg-[#FFFDF8]/70 px-4 py-2.5
            text-[13px] italic text-[#8A8177]
            shadow-[0_1px_2px_rgba(0,0,0,0.03)]
          "
        >
          This message was deleted
        </div>
      </div>
    );
  }

  // ── Bubble border-radius per group position ────────────────────────────

  const baseRadius = "rounded-[17px]";
  const topRadius = mine
    ? isGroupStart ? "" : "!rounded-tr-[6px]"
    : isGroupStart ? "" : "!rounded-tl-[6px]";
  const bottomRadius = mine
    ? isGroupEnd ? "" : "!rounded-br-[6px]"
    : isGroupEnd ? "" : "!rounded-bl-[6px]";

  const bubbleClass = `${baseRadius} ${topRadius} ${bottomRadius}`.trim();

  // ── Menu component (shared) ────────────────────────────────────────────

  const menuButton = (
    <button
      ref={triggerRef}
      type="button"
      aria-label="Message options"
      aria-expanded={showMenu}
      aria-haspopup="menu"
      onClick={() => setShowMenu((v) => !v)}
      className="
        rounded-full p-1.5
        text-[#8A8177]
        hover:bg-[#1C1B18]/5
        focus-visible:outline-none
        focus-visible:ring-1
        focus-visible:ring-[#174D35]/40
      "
    >
      <MoreVertical size={14} aria-hidden />
    </button>
  );

  /*
   * The menu uses `fixed`-like positioning via a portal approach — but since
   * we can't use a real portal easily here, we position relative to the
   * trigger using absolute. The key fix is that the parent of the menu
   * does NOT have `overflow-hidden`, so the menu can escape its container.
   */
  const menuDropdown = showMenu ? (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Message options"
      className={`
        absolute top-full z-[200]
        mt-1 w-44 overflow-hidden
        rounded-xl border border-[#1C1B18]/10
        bg-[#FFFDF8]
        shadow-[0_10px_30px_rgba(28,27,24,0.12)]
        ${mine ? "right-0" : "left-0"}
      `}
    >
      {onDeleteForMe && (
        <button
          role="menuitem"
          type="button"
          onClick={() => { setShowMenu(false); onDeleteForMe(); }}
          className="w-full px-4 py-2.5 text-left text-[12px] text-[#1C1B18] hover:bg-[#F8F4EA]"
        >
          Delete for me
        </button>
      )}
      {mine && onDeleteForEveryone && (
        <button
          role="menuitem"
          type="button"
          onClick={() => { setShowMenu(false); onDeleteForEveryone(); }}
          className="w-full px-4 py-2.5 text-left text-[12px] text-red-600 hover:bg-red-50"
        >
          Delete for everyone
        </button>
      )}
    </div>
  ) : null;

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    /*
     * mb-1 adds spacing between ungrouped messages; isGroupEnd adds extra
     * space after the last bubble in a group so the timestamp has room.
     */
    <div
      className={`
        flex w-full items-end gap-1.5
        ${mine ? "flex-row-reverse" : "flex-row"}
        ${isGroupEnd ? "mb-4" : "mb-0.5"}
      `}
    >
      {/* ── Bubble + menu trigger ── */}
      <div className="relative flex min-w-0 max-w-[82%] flex-col sm:max-w-[68%]">
        {/* Options button row — shown above the bubble */}
        <div
          className={`
            relative mb-0.5 flex items-center
            ${mine ? "justify-end" : "justify-start"}
          `}
        >
          {/* This wrapper is `relative` so the dropdown anchors to it */}
          <div className="relative">
            {menuButton}
            {menuDropdown}
          </div>
        </div>

        {/* Bubble */}
        <div
          className={`
            ${bubbleClass}
            break-words px-3.5 py-2.5
            text-[14px] leading-[1.5]
            shadow-[0_1px_2px_rgba(0,0,0,0.04)]
            ${
              mine
                ? "bg-[#174D35] text-[#FFFDF8]"
                : "border border-[#1C1B18]/[0.08] bg-[#FFFDF8] text-[#1C1B18]"
            }
          `}
          style={{ overflowWrap: "break-word", wordBreak: "break-word" }}
        >
          {message.message}
        </div>

        {/* Timestamp + read status — inline below the last bubble in group */}
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