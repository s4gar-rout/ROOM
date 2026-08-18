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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-[#1C1B18]">Feedback</h1>
          <p className="text-sm text-[#5F554A]">Review and manage user feedback and suggestions.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5F554A]" />
          <input 
            type="text" 
            placeholder="Search feedback..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-[#1C1B18]/10 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-[#174D35] focus:ring-1 focus:ring-[#174D35]"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-[#1C1B18]/10 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#5F554A]">
            <thead className="border-b border-[#1C1B18]/10 bg-[#F8F4EA] text-xs font-semibold uppercase tracking-wider text-[#1C1B18]">
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
