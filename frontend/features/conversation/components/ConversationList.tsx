"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Home, Loader2, Search } from "lucide-react";
import type { Conversation } from "../types/conversation";
import { getRoomInfo } from "../types/conversation";
import Avatar from "./Avatar";

// ── Helpers ────────────────────────────────────────────────────────────────

function getOtherUser(conversation: Conversation) {
  return conversation.otherUser &&
    typeof conversation.otherUser !== "string"
    ? conversation.otherUser
    : null;
}

function formatTime(dateString?: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  return isToday
    ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function formatRent(rent?: number): string {
  if (!rent) return "";
  return `₹${rent.toLocaleString("en-IN")}/mo`;
}

// ── Room context chip ──────────────────────────────────────────────────────

function RoomChip({
  conversation,
  compact = false,
}: {
  conversation: Conversation;
  compact?: boolean;
}) {
  const room = getRoomInfo(conversation);

  // Fallback: bare ObjectId string or null — show minimal label
  const roomId =
    room?._id ??
    (typeof conversation.room === "string" ? conversation.room : null);

  const title = room?.title ?? "Room listing";
  const meta = [
    room ? formatRent(room.rent) : null,
    room?.location ?? null,
  ]
    .filter(Boolean)
    .join(" · ");

  const content = (
    <span
      className={`
        flex min-w-0 items-center gap-1
        ${compact ? "text-[10px]" : "text-[10px]"}
      `}
    >
      <Home
        size={10}
        className="shrink-0 text-[#174D35]"
        aria-hidden
      />
      <span className="truncate font-medium text-[#174D35]">
        {title}
      </span>
      {meta && (
        <span className="shrink-0 text-[#8A8177]">· {meta}</span>
      )}
    </span>
  );

  if (roomId) {
    return (
      <Link
        href={`/rentals/${roomId}`}
        onClick={(e) => e.stopPropagation()}
        aria-label={`View listing: ${title}`}
        className="mt-0.5 block min-w-0 truncate rounded hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#174D35]/40"
      >
        {content}
      </Link>
    );
  }

  return <div className="mt-0.5 min-w-0 truncate">{content}</div>;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function ConversationList({
  conversations,
  selectedId,
  loading,
  onSelect,
}: {
  conversations: Conversation[];
  selectedId?: string;
  loading: boolean;
  onSelect: (conversation: Conversation) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => {
      const other = getOtherUser(c);
      const room = getRoomInfo(c);
      const name = (other?.username ?? "").toLowerCase();
      const title = (room?.title ?? "").toLowerCase();
      const location = (room?.location ?? "").toLowerCase();
      const last = (c.lastMessage ?? "").toLowerCase();
      return (
        name.includes(q) ||
        title.includes(q) ||
        location.includes(q) ||
        last.includes(q)
      );
    });
  }, [conversations, query]);

  return (
    <aside className="flex h-full min-h-0 flex-col bg-[#FFFDF8]">
      {/* ── Header ── */}
      <div className="shrink-0 border-b border-[#1C1B18]/10 px-4 pb-3 pt-4 sm:px-5">
        <h2 className="font-serif text-xl text-[#1C1B18]">Messages</h2>

        <div className="relative mt-3">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8177]"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, room or message…"
            aria-label="Search conversations"
            className="
              w-full rounded-xl border border-[#1C1B18]/10
              bg-[#F8F4EA] py-2 pl-8 pr-3
              text-[12px] text-[#1C1B18]
              outline-none
              placeholder:text-[#9A9186]
              focus:border-[#174D35]/40 focus:ring-1 focus:ring-[#174D35]/20
            "
          />
        </div>
      </div>

      {/* ── List ── */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2
              className="animate-spin text-[#174D35]"
              size={22}
              aria-label="Loading conversations"
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#756B60]">
            {query
              ? "No conversations match your search."
              : "No conversations yet."}
          </div>
        ) : (
          <div role="list">
            {filtered.map((conversation) => {
              const other = getOtherUser(conversation);
              const isSelected = selectedId === conversation._id;
              const unread = conversation.unreadCount ?? 0;
              const room = getRoomInfo(conversation);
              const roomThumb =
                room?.images?.[0]?.url ?? null;

              return (
                <button
                  key={conversation._id}
                  role="listitem"
                  aria-label={`Conversation with ${other?.username ?? "User"}${room ? ` about ${room.title}` : ""}`}
                  aria-current={isSelected ? "true" : undefined}
                  onClick={() => onSelect(conversation)}
                  className={`
                    flex w-full items-start gap-3
                    border-b border-[#1C1B18]/5
                    px-4 py-3.5 text-left
                    transition-colors
                    hover:bg-[#F8F4EA]
                    sm:px-5
                    ${isSelected ? "bg-[#F8F4EA]" : ""}
                  `}
                >
                  {/* ── Avatars stacked: user + room thumbnail ── */}
                  <div className="relative shrink-0">
                    <Avatar user={other} size={44} />

                    {/* Room thumbnail badge — bottom-right corner of avatar */}
                    {roomThumb && (
                      <div
                        aria-hidden
                        className="
                          absolute -bottom-1 -right-1
                          h-5 w-5 overflow-hidden
                          rounded-sm border-2 border-[#FFFDF8]
                          bg-[#EBE5D9]
                        "
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={roomThumb}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                  </div>

                  {/* ── Text block ── */}
                  <div className="min-w-0 flex-1">
                    {/* Row 1: username + time */}
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-[13px] font-semibold text-[#1C1B18]">
                        {other?.username ?? "User"}
                      </span>
                      <span className="shrink-0 text-[10px] text-[#8A8177]">
                        {formatTime(
                          conversation.lastMessageAt ??
                            conversation.createdAt
                        )}
                      </span>
                    </div>

                    {/* Row 2: room chip — the key new element */}
                    <RoomChip conversation={conversation} />

                    {/* Row 3: last message + unread badge */}
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <p
                        className={`
                          truncate text-[12px] leading-4
                          ${
                            unread > 0
                              ? "font-semibold text-[#1C1B18]"
                              : "text-[#756B60]"
                          }
                        `}
                      >
                        {conversation.lastMessage ?? "No messages yet"}
                      </p>

                      {unread > 0 && (
                        <span
                          aria-label={`${unread} unread`}
                          className="
                            flex h-[18px] min-w-[18px] shrink-0
                            items-center justify-center
                            rounded-full bg-[#174D35]
                            px-1 text-[9px] font-bold text-white
                          "
                        >
                          {unread > 99 ? "99+" : unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
