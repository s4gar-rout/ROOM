"use client";

import { useEffect, useState } from "react";
import { getAllUsers, blockUser, unblockUser } from "@/features/admin/services/admin.service";
import ConfirmModal from "@/features/admin/components/ConfirmModal";
import UserDetailsModal from "@/features/admin/components/UserDetailsModal";
import { Search, Ban, CheckCircle, SearchX } from "lucide-react";
import type { User } from "@/types/auth.types";

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userToBlock, setUserToBlock] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [userToView, setUserToView] = useState<User | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers(page, limit, debouncedSearch);
      setUsers(data.users);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, debouncedSearch]);

  const handleAction = async () => {
    if (!userToBlock) return;
    try {
      setActionLoading(true);
      if (userToBlock.isBlocked) {
        await unblockUser(userToBlock._id);
      } else {
        await blockUser(userToBlock._id);
      }
      setIsConfirmOpen(false);
      setUserToBlock(null);
      fetchUsers();
    } catch (error) {
      console.error("Action failed", error);
    } finally {
      setActionLoading(false);
    }
  };

  const openConfirm = (user: User) => {
    setUserToBlock(user);
    setIsConfirmOpen(true);
  };

  const openDetails = (user: User) => {
    setUserToView(user);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-[#1C1B18]">Users</h1>
          <p className="text-sm text-[#5F554A]">Manage user accounts and roles.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5F554A]" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
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
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1B18]/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-32 rounded bg-[#1C1B18]/5"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 rounded bg-[#1C1B18]/5"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 rounded bg-[#1C1B18]/5"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-8 rounded bg-[#1C1B18]/5 ml-auto"></div></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <SearchX size={32} className="mx-auto mb-3 text-[#1C1B18]/20" />
                    <p className="text-[#1C1B18] font-medium">No users found</p>
                    <p className="text-xs mt-1">Try adjusting your search criteria</p>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr 
                    key={u._id} 
                    className="hover:bg-[#F8F4EA]/50 transition-colors cursor-pointer"
                    onClick={() => openDetails(u)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#174D35] text-xs font-bold text-white overflow-hidden">
                          {u.avatar?.url ? (
                            <img src={u.avatar.url} alt={u.username} className="h-full w-full object-cover" />
                          ) : (
                            u.username?.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-[#1C1B18]">{u.username}</p>
                          <p className="text-xs">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-800">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {u.isBlocked ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                          <Ban size={12} /> Blocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                          <CheckCircle size={12} /> Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openConfirm(u);
                          }}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                            u.isBlocked 
                              ? "bg-green-50 text-green-700 hover:bg-green-100" 
                              : "bg-red-50 text-red-700 hover:bg-red-100"
                          }`}
                        >
                          {u.isBlocked ? "Unblock" : "Block"}
                        </button>
                      )}
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
        title={userToBlock?.isBlocked ? "Unblock User" : "Block User"}
        description={`Are you sure you want to ${userToBlock?.isBlocked ? 'unblock' : 'block'} ${userToBlock?.username}? ${userToBlock?.isBlocked ? 'They will regain access to their account.' : 'They will no longer be able to log in or use the platform.'}`}
        confirmText={userToBlock?.isBlocked ? "Yes, Unblock" : "Yes, Block"}
        isDestructive={!userToBlock?.isBlocked}
        isLoading={actionLoading}
      />

      <UserDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        user={userToView}
      />
    </div>
  );
}
