"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import api from "@/lib/axios";
import { ArrowUpRight, Check, Star } from "lucide-react";
import ButtonLoader from "@/components/ui/ButtonLoader";

export default function FeedbackPage() {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    type: "General Feedback",
    rating: 0,
    message: "",
    email: "",
  });

  const [hoveredRating, setHoveredRating] = useState(0);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const feedbackTypes = [
    "General Feedback",
    "Feature Request",
    "UI / Design",
    "Performance",
    "Suggestion",
    "Other",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.rating === 0) {
      setErrorMessage("Please select a rating.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await api.post("/feedback", formData);
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
  // STYLES (Matched with AddRoom / Report Issue)
  // ==========================================

  const inputClass =
    "h-11 w-full border border-[#CFCBBF] bg-transparent px-3 text-[13px] font-medium text-[#1C1B18] outline-none transition placeholder:text-[#918A7D] focus:border-[#174D35]";

  const labelClass =
    "mb-2 block text-[9px] font-bold uppercase tracking-[0.2em] text-[#1C1B18]";

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F4EA]">
      <Navbar />

      <main className="flex-1 px-4 pt-6 pb-24 md:py-8 text-[#1C1B18] sm:px-6 lg:px-8 flex flex-col justify-center">
        <div className="mx-auto w-full max-w-2xl flex-col border border-[#174D35]/15 bg-[#F8F4EA]">
          
          {status === "success" ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF2E9] text-[#174D35]">
                <Check size={32} />
              </div>
              <h2 className="font-serif text-[36px] leading-[0.95] tracking-[-0.035em] text-[#1C1B18]">
                Thank <em className="text-[#174D35]">You.</em>
              </h2>
              <p className="mt-4 max-w-md text-[13px] font-medium leading-5 text-[#756A5C]">
                Your feedback is incredibly valuable to us. We appreciate you taking the time to share your thoughts.
              </p>
              <button
                onClick={() => {
                  setFormData({ type: "General Feedback", rating: 0, message: "", email: "" });
                  setStatus("idle");
                }}
                className="group mt-8 flex h-11 items-center justify-center gap-2 bg-[#174D35] px-8 text-[9px] font-bold uppercase tracking-[0.18em] text-[#F8F4EA] transition hover:bg-[#123D2A]"
              >
                Send more feedback
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
              
              <div className="flex flex-1 flex-col">
                
                <section className="px-6 py-6 sm:px-10 sm:py-6">
                  
                  {/* Intro */}
                  <div className="mb-6">
                    <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#174D35]">
                      Feedback
                    </p>
                    <h1 className="mt-2 font-serif text-[36px] leading-[0.95] tracking-[-0.035em] sm:text-[42px]">
                      Help us make <em className="text-[#174D35]">ROOM</em> better.
                    </h1>
                    <p className="mt-3 max-w-md text-[11px] font-medium leading-5 text-[#756A5C]">
                      We value your thoughts and suggestions. Let us know how we can improve.
                    </p>
                  </div>

                  <div>
                    <div className="mb-4 flex items-center justify-between border-b border-[#1C1B18]/10 pb-2">
                      <p className="text-[9px] font-bold uppercase tracking-[0.22em]">
                        01 / Your thoughts
                      </p>
                      <span className="text-[9px] font-medium text-[#918A7D]">
                        Required
                      </span>
                    </div>

                    <div className="mb-6 flex flex-col items-center justify-center py-2">
                      <label className="mb-3 block text-[9px] font-bold uppercase tracking-[0.2em] text-[#1C1B18]">
                        Rate your experience
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                            onClick={() => {
                                setFormData({ ...formData, rating: star });
                                setErrorMessage("");
                            }}
                            className="transition-transform hover:scale-110 focus:outline-none"
                          >
                            <Star
                              size={28}
                              strokeWidth={1.5}
                              className={`transition-colors ${
                                (hoveredRating || formData.rating) >= star
                                  ? "fill-[#174D35] text-[#174D35]"
                                  : "fill-transparent text-[#174D35]/30"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
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
                      <label className={labelClass}>Feedback Type</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {feedbackTypes.map((type) => {
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
                      <label className={labelClass}>Message</label>
                      <textarea
                        name="message"
                        required
                        rows={4}
                        maxLength={2000}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Share your thoughts, suggestions, or feedback..."
                        className="w-full resize-none border border-[#CFCBBF] bg-transparent px-3 py-3 text-[13px] font-medium text-[#1C1B18] outline-none transition placeholder:text-[#918A7D] focus:border-[#174D35]"
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
                        Review your feedback before sending.
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group flex h-11 items-center justify-center gap-2 bg-[#174D35] px-8 text-[9px] font-bold uppercase tracking-[0.18em] text-[#F8F4EA] transition hover:bg-[#123D2A] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? <ButtonLoader color="#F8F4EA" /> : "Submit Feedback"}
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
