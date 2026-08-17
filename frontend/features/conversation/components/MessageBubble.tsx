"use client";

import { useState } from "react";
import { MoreVertical, Trash } from "lucide-react";
import type { Message } from "../types/conversation";
import type { User } from "@/types/auth.types";
import Avatar from "./Avatar";

function user(value: Message["sender"]): User | null {
  return typeof value === "string" ? null : value;
}

export default function MessageBubble({ message, mine, onDelete }: { message: Message; mine: boolean; onDelete?: (id: string) => void }) {
  const sender = user(message.sender);
  const time = new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const [showMenu, setShowMenu] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    setShowMenu(false);
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    setShowConfirm(false);
    if (onDelete) onDelete(message._id);
  };

  if (message.isDeleted) {
    return (
      <div className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}>
        {!mine && <Avatar user={sender} size={28} />}
        <div className={`max-w-[78%] sm:max-w-[65%] ${mine ? "items-end" : "items-start"}`}>
          <div className={`rounded-2xl px-4 py-2.5 text-sm leading-5 italic text-[#8A8177] ${mine ? "rounded-br-sm border border-[#1C1B18]/10 bg-transparent" : "rounded-bl-sm border border-[#1C1B18]/10 bg-transparent"}`}>
            This message was deleted
          </div>
        </div>
        {mine && <Avatar user={sender} size={28} />}
      </div>
    );
  }

  return (
    <div className={`flex items-end gap-2 group ${mine ? "justify-end" : "justify-start"}`}>
      {!mine && <Avatar user={sender} size={28} />}
      
      {mine && (
        <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setShowMenu(!showMenu)} className="p-1 rounded-full text-[#756B60] hover:bg-[#1C1B18]/5">
            <MoreVertical size={14} />
          </button>
          {showMenu && (
            <div className="absolute right-0 bottom-full mb-1 w-28 bg-[#FFFDF8] border border-[#1C1B18]/10 shadow-lg rounded-md overflow-hidden z-10">
              <button 
                onClick={handleDelete}
                className="w-full text-left px-3 py-2 text-[10px] uppercase tracking-wider text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash size={12} /> Delete
              </button>
            </div>
          )}
        </div>
      )}

      <div className={`max-w-[78%] sm:max-w-[65%] ${mine ? "items-end" : "items-start"}`}>
        {!mine && sender?.username ? <p className="mb-1 px-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#756B60]">{sender.username}</p> : null}
        <div className={`rounded-2xl px-4 py-2.5 text-sm leading-5 ${mine ? "rounded-br-sm bg-[#174D35] text-[#F8F4EA]" : "rounded-bl-sm border border-[#1C1B18]/10 bg-[#FFFDF8] text-[#1C1B18]"}`}>
          {message.message}
        </div>
        <div className={`mt-1 px-1 text-[8px] uppercase tracking-[0.08em] text-[#8A8177] ${mine ? "text-right" : "text-left"}`}>
          {time}{mine && message.read ? " · Read" : ""}
        </div>
      </div>
      {mine && <Avatar user={sender} size={28} />}

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[20px] bg-[#F8F4EA] p-6 shadow-2xl relative text-left">
            <h2 className="font-serif text-2xl font-medium text-[#1C1B18]">Delete message?</h2>
            <p className="mt-3 text-sm text-[#5F554A] leading-relaxed">Are you sure you want to delete this message?</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowConfirm(false)} className="rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-[#174D35] hover:bg-[#1C1B18]/5 transition-colors">
                Cancel
              </button>
              <button onClick={confirmDelete} className="rounded-full bg-red-600 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-white hover:bg-red-700 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
