"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";

import RentalCard from "@/features/rental/components/RentalCard";
import { getAllRooms } from "@/features/rental/services/rental.service";
import type { Room } from "@/features/rental/types/rental";
import { motion } from "framer-motion";
import { fadeUpVariants, staggerContainerVariants, shouldReduceMotion } from "@/lib/animations";
import { useAuth } from "@/features/auth/hooks/useAuth";
import BecomeOwnerModal from "@/features/auth/components/BecomeOwnerModal";

interface FeaturedRentalsProps {
  initialRentals?: Room[];
}

export default function FeaturedRentals({
  initialRentals,
}: FeaturedRentalsProps) {
  const { user, isAuthenticated } = useAuth();
  const [becomeOwnerModalOpen, setBecomeOwnerModalOpen] = useState(false);
  const reduceMotion = shouldReduceMotion();
  const [rooms, setRooms] = useState<Room[]>(initialRentals || []);
  const [isLoading, setIsLoading] = useState(!initialRentals);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialRentals) return;

    const fetchFeaturedRooms = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await getAllRooms({
          availability: true,
          page: 1,
          limit: 4,
          sort: "newest",
        });

        setRooms(response.rooms || []);
      } catch (error) {
        console.error(
          "Failed to fetch featured rooms:",
          error
        );

        setError("Unable to load rentals right now.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedRooms();
  }, []);

  return (
    <section className="bg-[#F8F4EA] px-4 py-12 sm:px-6 md:py-16">
      <div className="mx-auto max-w-6xl">

        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">

          <motion.div 
            className="max-w-lg"
            initial={reduceMotion ? false : "hidden"}
            whileInView={reduceMotion ? undefined : "visible"}
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainerVariants}
          >

            <motion.p variants={fadeUpVariants} className="mb-1 text-xs md:text-[10px] font-medium uppercase tracking-[0.3em] text-[#174D35]">
              Featured rentals
            </motion.p>

            <motion.h2 variants={fadeUpVariants} className="font-serif text-2xl leading-tight tracking-[-0.025em] text-[#1C1B18] sm:text-3xl md:text-4xl">
              Places worth{" "}
              <em className="text-[#174D35]">
                calling home.
              </em>
            </motion.h2>

            <motion.p variants={fadeUpVariants} className="mt-2 max-w-md text-xs leading-6 text-[#756A5C] sm:text-sm">
              Explore comfortable rooms and homes from
              local owners, available for long-term living.
            </motion.p>

          </motion.div>

          <Link
            href="/rentals"
            className="group flex w-fit items-center gap-1.5 text-xs font-medium text-[#174D35] sm:text-sm"
          >
            View all rentals

            <ArrowUpRight
              size={15}
              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>

        </div>

        {/* ==========================================
            LOADING
        ========================================== */}

        {isLoading && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-3xl border border-[#174D35]/10 bg-white"
              >

                <div className="aspect-[4/3] animate-pulse bg-[#DDE7DD]" />

                <div className="space-y-3 p-4 sm:p-5">

                  <div className="h-5 w-3/4 animate-pulse rounded-full bg-[#DDE7DD]" />

                  <div className="h-4 w-1/2 animate-pulse rounded-full bg-[#DDE7DD]" />

                  <div className="h-4 w-1/3 animate-pulse rounded-full bg-[#DDE7DD]" />

                </div>

              </div>
            ))}

          </div>
        )}

        {/* ==========================================
            ERROR
        ========================================== */}

        {!isLoading && error && (
          <div className="rounded-3xl border border-red-500/10 bg-white px-5 py-8 text-center">

            <p className="text-sm font-semibold text-red-600">
              {error}
            </p>

          </div>
        )}

        {/* ==========================================
            EMPTY
        ========================================== */}

        {!isLoading &&
          !error &&
          rooms.length === 0 && (
            <div className="mx-auto max-w-lg rounded-2xl border border-[#174D35]/15 bg-[#174D35]/5 px-6 py-7 text-center">

              <p className="font-serif text-lg font-normal text-[#1C1B18]">
                No homes here yet.
              </p>

              <p className="mt-1 text-xs font-medium text-[#756A5C]">
                New listings are on their way.
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-semibold text-[#174D35]">
                <Link
                  href="/rentals"
                  className="hover:underline"
                >
                  Explore all rentals →
                </Link>

                <span className="text-[#174D35]/30 hidden sm:inline">·</span>

                <Link
                  href="/owner-dashboard/add-room"
                  onClick={(e) => {
                    if (isAuthenticated && user?.role === "tenant") {
                      e.preventDefault();
                      setBecomeOwnerModalOpen(true);
                    }
                  }}
                  className="hover:underline"
                >
                  Be the first to list a property →
                </Link>
              </div>

            </div>
          )}

        {/* ==========================================
            ROOMS
        ========================================== */}

        {!isLoading &&
          !error &&
          rooms.length > 0 && (
            <motion.div 
              className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
              initial={reduceMotion ? false : "hidden"}
              whileInView={reduceMotion ? undefined : "visible"}
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainerVariants}
            >

              {rooms.map((room) => (
                <RentalCard
                  key={room._id}
                  room={room}
                />
              ))}

            </motion.div>
          )}

      </div>

      <BecomeOwnerModal
        isOpen={becomeOwnerModalOpen}
        onClose={() => setBecomeOwnerModalOpen(false)}
      />
    </section>
  );
}