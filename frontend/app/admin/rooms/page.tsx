"use client";

import { useEffect, useState } from "react";
import { getAllRooms, deleteRoom } from "@/features/admin/services/admin.service";
import ConfirmModal from "@/features/admin/components/ConfirmModal";
import { Search, SearchX, MapPin, Trash2, CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";
import type { Room } from "@/features/rental/types/rental";

export default function AdminRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await getAllRooms(page, limit, debouncedSearch);
      setRooms(data.rooms);
      setTotalPages(data.totalPages || 1);
    } catch (error: unknown) {
      console.error("Failed to fetch rooms", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch]);

  const handleAction = async () => {
    if (!roomToDelete) return;
    try {
      setActionLoading(true);
      await deleteRoom(roomToDelete._id);
      setIsConfirmOpen(false);
      setRoomToDelete(null);
      fetchRooms();
    } catch (error: unknown) {
      console.error("Action failed", error);
    } finally {
      setActionLoading(false);
    }
  };

  const openConfirm = (room: Room) => {
    setRoomToDelete(room);
    setIsConfirmOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div>
          <div className="mb-2 flex items-center gap-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#174D35]" />
            <span className="h-px w-6 bg-[#174D35]/30" />
            <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#174D35]">
              Inventory Management
            </span>
          </div>
          <h1 className="font-serif text-[38px] font-normal leading-none tracking-[-0.03em] text-[#1C1B18]">
            Room <span className="italic text-[#174D35]">listings.</span>
          </h1>
          <p className="mt-2 text-[11px] font-medium text-[#5F554A]">Manage property listings, locations, and availability across the platform.</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756A5C]" />
          <input 
            type="text" 
            placeholder="Search by title or location..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-[#174D35]/15 bg-[#FAF7F0] py-2.5 pl-10 pr-4 text-xs font-medium text-[#1C1B18] outline-none transition focus:border-[#174D35] focus:ring-1 focus:ring-[#174D35]"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-[22px] border border-[#174D35]/12 bg-[#FAF7F0] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#5F554A]">
            <thead className="border-b border-[#174D35]/10 bg-[#F8F4EA] text-[9px] font-bold uppercase tracking-[0.18em] text-[#174D35]">
              <tr>
                <th className="px-6 py-4">Room</th>
                <th className="px-6 py-4">Owner</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1B18]/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-32 rounded bg-[#1C1B18]/5"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-[#1C1B18]/5"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 rounded bg-[#1C1B18]/5"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-8 rounded bg-[#1C1B18]/5 ml-auto"></div></td>
                  </tr>
                ))
              ) : rooms.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <SearchX size={32} className="mx-auto mb-3 text-[#1C1B18]/20" />
                    <p className="text-[#1C1B18] font-medium">No rooms found</p>
                    <p className="text-xs mt-1">Try adjusting your search criteria</p>
                  </td>
                </tr>
              ) : (
                rooms.map((r) => (
                  <tr key={r._id} className="hover:bg-[#F8F4EA]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded bg-[#1C1B18]/5">
                            {r.images?.[0] ? (
                                <Image src={typeof r.images[0] === 'string' ? r.images[0] : (r.images[0] as { url: string }).url} alt={r.title} fill className="h-full w-full object-cover" sizes="56px" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-[8px] uppercase text-[#5F554A]">No Img</div>
                            )}
                        </div>
                        <div>
                          <p className="font-medium text-[#1C1B18] max-w-[200px] truncate">{r.title}</p>
                          <p className="text-xs flex items-center gap-1 mt-0.5"><MapPin size={10} /> {r.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-[#1C1B18]">{(r.owner as { username?: string })?.username || 'Unknown'}</p>
                        <p className="text-xs">{(r.owner as { email?: string })?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {r.availability ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                          <CheckCircle size={12} /> Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                          <XCircle size={12} /> Sold Out
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openConfirm(r)}
                        className="rounded p-1.5 text-red-600 transition-colors hover:bg-red-50"
                        title="Delete Room"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#1C1B18]/10 px-6 py-4">
            <span className="text-xs text-[#5F554A]">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="rounded-full border border-[#1C1B18]/10 px-3 py-1 text-xs font-medium hover:bg-[#F8F4EA] disabled:opacity-50"
              >
                Previous
              </button>
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="rounded-full border border-[#1C1B18]/10 px-3 py-1 text-xs font-medium hover:bg-[#F8F4EA] disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleAction}
        title="Delete Room"
        description={`Are you sure you want to delete "${roomToDelete?.title}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        isDestructive={true}
        isLoading={actionLoading}
      />
    </div>
  );
}
