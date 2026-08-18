import { useState } from "react";
import { X, Mail, Phone, Calendar, Shield, Ban, CheckCircle } from "lucide-react";
import type { User } from "@/types/auth.types";

type UserDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
};

export default function UserDetailsModal({ isOpen, onClose, user }: UserDetailsModalProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  if (!isOpen || !user) return null;

  // Function to format date safely if createdAt exists on User (often standard in mongoose)
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-[#FFFDF8] p-6 shadow-xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif font-medium text-[#1C1B18]">User Details</h2>
          <button onClick={onClose} className="text-[#5F554A] hover:text-[#1C1B18] transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Profile Header */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div 
            className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#174D35] text-2xl font-bold text-white overflow-hidden shadow-sm mb-4 ${user.avatar?.url ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
            onClick={() => user.avatar?.url && setIsPreviewOpen(true)}
            title={user.avatar?.url ? "Click to view picture" : ""}
          >
            {user.avatar?.url ? (
              <img src={user.avatar.url} alt={user.username} className="h-full w-full object-cover" />
            ) : (
              user.username?.charAt(0).toUpperCase()
            )}
          </div>
          <h3 className="font-serif text-2xl font-medium text-[#1C1B18]">{user.username}</h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-gray-800 border border-gray-200">
              {user.role}
            </span>
            {user.isBlocked ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 border border-red-200">
                <Ban size={12} /> Blocked
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 border border-green-200">
                <CheckCircle size={12} /> Active
              </span>
            )}
          </div>
        </div>

        {/* Details List */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#1C1B18]/10">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F8F4EA] text-[#174D35]">
              <Mail size={18} />
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#756A5C]">Email</p>
              <p className="text-sm font-medium text-[#1C1B18] truncate">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#1C1B18]/10">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F8F4EA] text-[#174D35]">
              <Phone size={18} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#756A5C]">Contact</p>
              <p className="text-sm font-medium text-[#1C1B18]">{user.contact || "Not provided"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#1C1B18]/10">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F8F4EA] text-[#174D35]">
              <Shield size={18} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#756A5C]">Auth Provider</p>
              <p className="text-sm font-medium text-[#1C1B18] capitalize">{user.authProvider || "Local"}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#1C1B18]/10">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F8F4EA] text-[#174D35]">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#756A5C]">Joined</p>
              <p className="text-sm font-medium text-[#1C1B18]">{(user as any).createdAt ? formatDate((user as any).createdAt) : "N/A"}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Picture Preview Modal */}
      {isPreviewOpen && user.avatar?.url && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#F8F4EA]/90 p-4 animate-in fade-in duration-200"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div className="relative animate-in zoom-in-95 duration-200 flex flex-col items-center">
            <div className="h-64 w-64 md:h-80 md:w-80 rounded-full border border-[#1C1B18]/10 bg-[#FFFDF8] overflow-hidden shadow-xl">
              <img 
                src={user.avatar.url} 
                alt={`${user.username}'s profile`} 
                className="h-full w-full object-cover"
              />
            </div>
            <button 
              onClick={() => setIsPreviewOpen(false)}
              className="mt-6 rounded-full bg-[#FFFDF8] px-6 py-2.5 text-sm font-medium text-[#5F554A] shadow-sm border border-[#1C1B18]/10 hover:bg-[#1C1B18]/5 transition-colors"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
