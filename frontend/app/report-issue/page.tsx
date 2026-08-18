"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import api from "@/lib/axios";
import { ArrowUpRight, Check, AlertCircle } from "lucide-react";
import ButtonLoader from "@/components/ui/ButtonLoader";

export default function ReportIssuePage() {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    type: "Technical Problem",
    subject: "",
    description: "",
    roomId: "",
    email: "",
  });

  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const issueTypes = [
    "Technical Problem",
    "Room / Listing Problem",
    "User / Owner Problem",
    "Messaging Problem",
    "Account Problem",
    "Safety / Abuse",
    "Other",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await api.post("/issues", formData);
      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setErrorMessage(axiosErr.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // STYLES (Matched with AddRoom)
  // ==========================================

  const inputClass =
    "h-11 w-full border border-[#CFCBBF] bg-transparent px-3 text-[13px] font-medium text-[#1C1B18] outline-none transition placeholder:text-[#918A7D] focus:border-[#174D35]";

  const labelClass =
    "mb-2 block text-[9px] font-bold uppercase tracking-[0.2em] text-[#1C1B18]";

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F4EA]">
      <Navbar />

      <main className="flex-1 px-4 py-6 md:py-8 text-[#1C1B18] sm:px-6 lg:px-8 flex flex-col justify-center">
        <div className="mx-auto w-full max-w-2xl flex-col border border-[#174D35]/15 bg-[#F8F4EA]">
          
          {status === "success" ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF2E9] text-[#174D35]">
                <Check size={32} />
              </div>
              <h2 className="font-serif text-[36px] leading-[0.95] tracking-[-0.035em] text-[#1C1B18]">
                Issue <em className="text-[#174D35]">Reported.</em>
              </h2>
              <p className="mt-4 max-w-md text-[13px] font-medium leading-5 text-[#756A5C]">
                Thank you for bringing this to our attention. Our team will review the issue shortly.
              </p>
              <button
                onClick={() => {
                  setFormData({ type: "Technical Problem", subject: "", description: "", roomId: "", email: "" });
                  setStatus("idle");
                }}
                className="group mt-8 flex h-11 items-center justify-center gap-2 bg-[#174D35] px-8 text-[9px] font-bold uppercase tracking-[0.18em] text-[#F8F4EA] transition hover:bg-[#123D2A]"
              >
                Report another issue
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
              
              <div className="flex flex-1 flex-col">
                
                <section className="px-6 py-6 sm:px-10 sm:py-6">
                  
                  {/* Intro */}
                  <div className="mb-6">
                    <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#174D35]">
                      Support
                    </p>
                    <h1 className="mt-2 font-serif text-[36px] leading-[0.95] tracking-[-0.035em] sm:text-[42px]">
                      Report an{" "}
                      <em className="text-[#174D35]">issue.</em>
                    </h1>
                    <p className="mt-3 max-w-md text-[11px] font-medium leading-5 text-[#756A5C]">
                      Experiencing a problem? Let us know so we can fix it as quickly as possible.
                    </p>
                  </div>

                  <div>
                    <div className="mb-4 flex items-center justify-between border-b border-[#1C1B18]/10 pb-2">
                      <p className="text-[9px] font-bold uppercase tracking-[0.22em]">
                        01 / Issue details
                      </p>
                      <span className="text-[9px] font-medium text-[#918A7D]">
                        Required
                      </span>
                    </div>

                    {!user && (
                      <div className="mb-4">
                        <label className={labelClass}>Email Address</label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter your email"
                          className={inputClass}
                        />
                      </div>
                    )}

                    <div className="mb-4">
                      <label className={labelClass}>Issue Type</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {issueTypes.map((type) => {
                          const active = formData.type === type;
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, type });
                                setErrorMessage("");
                              }}
                              className={`relative flex h-11 items-center justify-center border px-4 text-[10px] font-semibold transition ${
                                active
                                  ? "border-[#174D35] bg-[#174D35] text-[#F8F4EA]"
                                  : "border-[#CFCBBF] bg-transparent text-[#5F554A] hover:border-[#174D35]"
                              }`}
                            >
                              {active && <Check size={11} className="mr-1.5" />}
                              {type}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className={labelClass}>Subject</label>
                      <input
                        type="text"
                        name="subject"
                        required
                        maxLength={100}
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Brief summary of the issue"
                        className={inputClass}
                      />
                    </div>

                    <div className="mb-4">
                      <label className={labelClass}>Description</label>
                      <textarea
                        name="description"
                        required
                        rows={4}
                        maxLength={2000}
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Please provide details about the problem..."
                        className="w-full resize-none border border-[#CFCBBF] bg-transparent px-3 py-3 text-[13px] font-medium text-[#1C1B18] outline-none transition placeholder:text-[#918A7D] focus:border-[#174D35]"
                      />
                    </div>

                    <div className="mb-2">
                      <div className="mb-2 flex items-center justify-between">
                        <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-[#1C1B18]">
                          Listing Link (URL)
                        </label>
                        <span className="text-[9px] font-medium text-[#918A7D]">
                          Optional
                        </span>
                      </div>
                      <input
                        type="url"
                        name="roomId"
                        value={formData.roomId}
                        onChange={handleChange}
                        placeholder="Paste the link to the room here"
                        className={inputClass}
                      />
                    </div>

                  </div>

                </section>

              </div>

              {/* BOTTOM SUBMIT BAR */}
              <div className="border-t border-[#1C1B18]/10 px-6 py-3 sm:px-8 lg:px-10 bg-[#F8F4EA]">
                
                {errorMessage && (
                  <div className="mb-3 border border-red-500/20 bg-red-500/5 px-3 py-2 text-[10px] font-semibold text-red-600">
                    {errorMessage}
                  </div>
                )}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EEF2E9] text-[#174D35]">
                      <Check size={14} />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-[#1C1B18]">
                        Ready to submit?
                      </p>
                      <p className="mt-0.5 text-[9px] text-[#756A5C]">
                        Review your details before sending.
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group flex h-11 items-center justify-center gap-2 bg-[#174D35] px-8 text-[9px] font-bold uppercase tracking-[0.18em] text-[#F8F4EA] transition hover:bg-[#123D2A] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? <ButtonLoader color="#F8F4EA" /> : "Submit Report"}
                    {!isSubmitting && (
                      <ArrowUpRight
                        size={14}
                        className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    )}
                  </button>
                </div>
              </div>

            </form>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
