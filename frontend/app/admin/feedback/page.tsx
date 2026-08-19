"use client";

import { useEffect, useState } from "react";
import { getAllFeedback, updateFeedbackStatus, deleteFeedback } from "@/features/admin/services/admin.service";
import ConfirmModal from "@/features/admin/components/ConfirmModal";
import { Search, SearchX, CheckCircle, Trash2, Star, CheckSquare } from "lucide-react";

export default function AdminFeedback() {
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const data = await getAllFeedback(page, limit, debouncedSearch);
      setFeedbackList(data.data);
      setTotalPages(data.totalPages || 1);
    } catch (error: unknown) {
      console.error("Failed to fetch feedback", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [page, debouncedSearch]);

  const handleDelete = async () => {
    if (!feedbackToDelete) return;
    try {
      setActionLoading(true);
      await deleteFeedback(feedbackToDelete._id);
      setIsConfirmOpen(false);
      setFeedbackToDelete(null);
      fetchFeedback();
    } catch (error: unknown) {
      console.error("Action failed", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "NEW" ? "REVIEWED" : "NEW";

    try {
      await updateFeedbackStatus(id, nextStatus);
      fetchFeedback();
    } catch (error: unknown) {
      console.error("Update failed", error);
    }
  };

  const openConfirm = (fb: any) => {
    setFeedbackToDelete(fb);
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
              User Reviews
            </span>
          </div>
          <h1 className="font-serif text-[38px] font-normal leading-none tracking-[-0.03em] text-[#1C1B18]">
            User <span className="italic text-[#174D35]">feedback.</span>
          </h1>
          <p className="mt-2 text-[11px] font-medium text-[#5F554A]">Review ratings, suggestions, and testimonials submitted by platform users.</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756A5C]" />
          <input 
            type="text" 
            placeholder="Search feedback..." 
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
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Feedback</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#1C1B18]/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#174D35] border-t-transparent"></div>
                  </td>
                </tr>
              ) : feedbackList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-[#B7AA99]">
                      <SearchX size={32} className="mb-2 opacity-20" />
                      <p>No feedback found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                feedbackList.map((fb) => (
                  <tr key={fb._id} className="transition hover:bg-[#F8F4EA]/50">
                    <td className="px-6 py-4 align-top">
                      <div className="font-medium text-[#1C1B18]">
                        {fb.user ? `${fb.user.firstName} ${fb.user.lastName}` : "Guest"}
                      </div>
                      <div className="text-xs mt-0.5">
                        {fb.email || fb.user?.email || "No email"}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            size={14} 
                            className={fb.rating >= star ? "fill-[#174D35] text-[#174D35]" : "fill-transparent text-[#174D35]/30"} 
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-[#174D35] font-medium">{fb.type}</div>
                      <p className="mt-1 text-xs max-w-sm whitespace-pre-wrap">{fb.message}</p>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium tracking-wide uppercase ${
                        fb.status === 'NEW' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {fb.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-top text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleUpdateStatus(fb._id, fb.status)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-[#1C1B18] transition hover:bg-[#1C1B18]/5"
                          title="Toggle Status"
                        >
                          <CheckSquare size={15} />
                        </button>

                        <button
                          onClick={() => openConfirm(fb)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-red-500 transition hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#1C1B18]/10 px-6 py-4 text-sm">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="rounded-full px-4 py-1.5 font-medium transition hover:bg-[#1C1B18]/5 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-[#5F554A]">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="rounded-full px-4 py-1.5 font-medium transition hover:bg-[#1C1B18]/5 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Feedback"
        description="Are you sure you want to delete this feedback? This action cannot be undone."
        isLoading={actionLoading}
        confirmText="Delete"
      />
    </div>
  );
}
