"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Filter,
  Search,
  ChevronDown,
  RefreshCw,
} from "lucide-react";

import {
  getAllRooms,
  type GetRoomsParams,
} from "@/features/rental/services/rental.service";
import type { Room } from "@/features/rental/types/rental";
import RentalCard from "@/features/rental/components/RentalCard";
import Navbar from "@/components/layout/Navbar";
import { motion } from "framer-motion";
import { staggerContainerVariants, shouldReduceMotion } from "@/lib/animations";

export default function AllRoomsPage() {
  const reduceMotion = shouldReduceMotion();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
    limit: 12,
  });

  const [showFilters, setShowFilters] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const [isRoomTypeOpen, setIsRoomTypeOpen] = useState(false);
  const roomTypeRef = useRef<HTMLDivElement>(null);

  const [isRentOpen, setIsRentOpen] = useState(false);
  const rentRef = useRef<HTMLDivElement>(null);

  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);

  const toggleFacility = (facility: string) => {
    setSelectedFacilities((prev) =>
      prev.includes(facility)
        ? prev.filter((f) => f !== facility)
        : [...prev, facility]
    );
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
      if (roomTypeRef.current && !roomTypeRef.current.contains(event.target as Node)) {
        setIsRoomTypeOpen(false);
      }
      if (rentRef.current && !rentRef.current.contains(event.target as Node)) {
        setIsRentOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [filters, setFilters] = useState<GetRoomsParams>({
    search: searchParams.get("search") || "",
    location: searchParams.get("location") || "",
    roomType:
      (searchParams.get("roomType") as GetRoomsParams["roomType"]) ||
      undefined,
    minRent: searchParams.get("minRent")
      ? Number(searchParams.get("minRent"))
      : undefined,
    maxRent: searchParams.get("maxRent")
      ? Number(searchParams.get("maxRent"))
      : undefined,
    availability:
      searchParams.get("availability") === "true" ? true : undefined,
    sort:
      (searchParams.get("sort") as GetRoomsParams["sort"]) || "newest",
    page: searchParams.get("page")
      ? Number(searchParams.get("page"))
      : 1,
    limit: 12,
  });

  const [searchValue, setSearchValue] = useState(filters.search || "");

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev: GetRoomsParams) => ({
        ...prev,
        search: searchValue,
        page: 1,
      }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.search) params.set("search", filters.search);
    if (filters.location) params.set("location", filters.location);
    if (filters.roomType) params.set("roomType", filters.roomType);

    if (filters.minRent !== undefined) {
      params.set("minRent", String(filters.minRent));
    }

    if (filters.maxRent !== undefined) {
      params.set("maxRent", String(filters.maxRent));
    }

    if (filters.sort && filters.sort !== "newest") {
      params.set("sort", filters.sort);
    }

    if (filters.page && filters.page > 1) {
      params.set("page", String(filters.page));
    }

    const currentQuery = searchParams.toString();
    const newQuery = params.toString();

    if (currentQuery !== newQuery) {
      router.push(`/rentals?${newQuery}`, { scroll: false });
    }
  }, [filters, router, searchParams]);

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const activeFilters: GetRoomsParams = {};

      if (filters.search) activeFilters.search = filters.search;
      if (filters.location) activeFilters.location = filters.location;
      if (filters.roomType) activeFilters.roomType = filters.roomType;
      if (filters.minRent !== undefined) {
        activeFilters.minRent = filters.minRent;
      }
      if (filters.maxRent !== undefined) {
        activeFilters.maxRent = filters.maxRent;
      }
      if (filters.sort && filters.sort !== "newest") {
        activeFilters.sort = filters.sort;
      }
      if (filters.page) activeFilters.page = filters.page;
      if (filters.limit) activeFilters.limit = filters.limit;

      const response = await getAllRooms(activeFilters);

      setRooms(response.rooms);
      setPagination(response.pagination);
    } catch (err: unknown) {
      console.error("Failed to fetch rooms", err);
      setError("Failed to load rooms. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRooms();
  }, [fetchRooms]);

  const handleFilterChange = (
    key: keyof GetRoomsParams,
    value: string | number | undefined | boolean
  ) => {
    setFilters((prev: GetRoomsParams) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const clearFilters = () => {
    setSearchValue("");

    setFilters({
      search: "",
      location: "",
      roomType: undefined,
      minRent: undefined,
      maxRent: undefined,
      availability: undefined,
      sort: "newest",
      page: 1,
      limit: 12,
    });
  };

  const activeFilterCount = [
    filters.location,
    filters.roomType,
    filters.minRent,
    filters.maxRent,
    filters.availability !== undefined,
  ].filter(Boolean).length;

  return (
    <main className="min-h-screen bg-[#F8F4EA] text-[#1C1B18] pb-20">
      <Navbar />

      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10 pt-5 lg:pt-6">

        {/* ================================
            SEARCH / FILTER / SORT CONTROLS
        ================================= */}
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

          {/* SEARCH */}
          <div className="relative w-full lg:max-w-[560px]">
            <Search
              strokeWidth={1.8}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5F554A] w-[14px] h-[14px] sm:w-[16px] sm:h-[16px]"
            />

            <input
              type="text"
              placeholder="Search rooms, locations..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="
                h-[40px] sm:h-[44px]
                w-full
                border
                border-[#1C1B18]/15
                bg-transparent
                pl-10 sm:pl-11
                pr-4 sm:pr-5
                font-sans
                text-sm
                font-medium
                text-[#1C1B18]
                outline-none
                placeholder:font-medium
                placeholder:text-[#756A5C]
                transition-colors
                focus:border-[#174D35]
              "
            />
          </div>

          {/* FILTER + SORT + REFRESH */}
          <div className="flex w-full items-center gap-1.5 sm:gap-2 lg:w-auto">

            {/* FILTER BUTTON */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`
                flex
                h-[36px] sm:h-[44px]
                shrink-0
                items-center
                justify-center
                gap-1.5 sm:gap-2
                border
                px-2.5 sm:px-5
                font-sans
                text-[11px] sm:text-xs
                font-bold sm:font-semibold
                uppercase
                tracking-[0.08em] sm:tracking-[0.15em]
                transition-colors
                ${showFilters || activeFilterCount > 0
                  ? "border-[#174D35] bg-[#174D35]/5 text-[#174D35]"
                  : "border-[#1C1B18]/15 bg-transparent text-[#5F554A] hover:text-[#174D35] hover:border-[#174D35]/30"
                }
              `}
            >
              <Filter strokeWidth={1.8} className="w-[11px] h-[11px] sm:w-[13px] sm:h-[13px]" />

              <span className="hidden sm:inline">Filters</span>
              <span className="inline sm:hidden">Filter</span>

              {activeFilterCount > 0 && (
                <span
                  className="
                    ml-0.5
                    flex
                    h-[14px] sm:h-[15px]
                    min-w-[14px] sm:min-w-[15px]
                    items-center
                    justify-center
                    rounded-full
                    bg-[#174D35]
                    px-1
                    text-[9px] sm:text-[8px]
                    font-bold
                    text-[#F8F4EA]
                  "
                >
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* SORT */}
            <div className={`relative min-w-0 flex-1 lg:flex-none ${isSortOpen ? 'z-50' : 'z-10'}`} ref={sortRef}>
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="
                  flex
                  h-[36px] sm:h-[44px]
                  w-full
                  items-center
                  justify-between
                  border
                  border-[#1C1B18]/15
                  bg-transparent
                  px-2.5 sm:px-4
                  font-sans
                  text-[11px] sm:text-xs
                  font-bold sm:font-semibold
                  uppercase
                  tracking-[0.05em] sm:tracking-[0.1em]
                  text-[#5F554A]
                  transition-colors
                  hover:border-[#174D35]/30
                  lg:w-[220px]
                "
              >
                <span className="truncate">
                  {filters.sort === "newest" || !filters.sort
                    ? "Sort: Newest"
                    : filters.sort === "oldest"
                    ? "Sort: Oldest"
                    : filters.sort === "rentAsc"
                    ? "Sort: Low to High"
                    : "Sort: High to Low"}
                </span>
                <ChevronDown
                  strokeWidth={1.8}
                  className={`shrink-0 w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#5F554A] transition-transform duration-300 ${
                    isSortOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* DROPDOWN MENU */}
              {isSortOpen && (
                <div className="absolute left-0 top-full z-50 mt-1 w-full border border-[#1C1B18]/15 bg-[#F8F4EA] py-0 shadow-lg">
                  {[
                    { value: "newest", label: "Sort: Newest" },
                    { value: "oldest", label: "Sort: Oldest" },
                    { value: "rentAsc", label: "Sort: Low to High" },
                    { value: "rentDesc", label: "Sort: High to Low" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        handleFilterChange("sort", option.value);
                        setIsSortOpen(false);
                      }}
                      className={`
                        w-full
                        px-3 sm:px-4
                        py-2 sm:py-2.5
                        text-left
                        font-sans
                        text-[11px] sm:text-[13px]
                        font-medium
                        tracking-normal
                        transition-colors
                        hover:bg-[#174D35]/5
                        hover:text-[#174D35]
                        ${
                          (filters.sort || "newest") === option.value
                            ? "bg-[#174D35]/5 text-[#174D35]"
                            : "text-[#5F554A]"
                        }
                      `}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* REFRESH */}
            <button
              onClick={fetchRooms}
              title="Refresh results"
              className="
                flex
                h-[36px] sm:h-[44px]
                w-[36px] sm:w-[44px]
                shrink-0
                items-center
                justify-center
                border
                border-[#1C1B18]/15
                bg-transparent
                text-[#5F554A]
                transition-colors
                hover:border-[#174D35]/30
                hover:text-[#174D35]
              "
            >
              <RefreshCw
                strokeWidth={1.8}
                className={`w-[12px] h-[12px] sm:w-[14px] sm:h-[14px] ${
                  loading ? "animate-spin text-[#174D35]" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* ================================
            FILTER PANEL
        ================================= */}
        <div
          className={`
            transition-all
            duration-300
            ease-in-out
            ${showFilters
              ? "mb-8 max-h-[1000px] opacity-100 overflow-visible"
              : "mb-0 max-h-0 opacity-0 overflow-hidden"
            }
          `}
        >
          <div
            className="
              border
              border-[#1C1B18]/15
              bg-transparent
              p-4
              sm:p-5
              lg:px-6
              lg:py-5
            "
          >
            {/* TOP FILTERS */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3 lg:gap-6">

              {/* LOCATION */}
              <div>
                <label
                  className="
                    mb-1.5 sm:mb-2
                    block
                    font-sans
                    text-[10px] sm:text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.2em] sm:tracking-[0.25em]
                    text-[#5F554A]
                  "
                >
                  Location / Locality
                </label>

                <input
                  type="text"
                  placeholder="e.g. Jharsuguda"
                  value={filters.location || ""}
                  onChange={(e) =>
                    handleFilterChange("location", e.target.value)
                  }
                  className="
                    h-[38px] sm:h-[42px]
                    w-full
                    border
                    border-[#1C1B18]/15
                    bg-transparent
                    px-3 sm:px-3.5
                    font-sans
                    text-sm
                    font-medium
                    text-[#1C1B18]
                    outline-none
                    placeholder:font-medium
                    placeholder:text-[#756A5C]
                    transition-colors
                    focus:border-[#174D35]
                  "
                />
              </div>

              {/* ROOM TYPE */}
              <div>
                <label
                  className="
                    mb-1.5 sm:mb-2
                    block
                    font-sans
                    text-[10px] sm:text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.2em] sm:tracking-[0.25em]
                    text-[#5F554A]
                  "
                >
                  Room Type
                </label>

                <div className={`relative ${isRoomTypeOpen ? 'z-50' : ''}`} ref={roomTypeRef}>
                  <button
                    onClick={() => setIsRoomTypeOpen(!isRoomTypeOpen)}
                    className="
                      flex
                      h-[38px] sm:h-[42px]
                      w-full
                      items-center
                      justify-between
                      border
                      border-[#1C1B18]/15
                      bg-transparent
                      px-3 sm:px-3.5
                      font-sans
                      text-sm
                      font-medium
                      transition-colors
                      hover:border-[#174D35]/30
                    "
                  >
                    <span className={!filters.roomType ? "text-[#756A5C]" : "text-[#1C1B18]"}>
                      {filters.roomType === "single"
                        ? "Single Room"
                        : filters.roomType === "double"
                        ? "Double Room"
                        : filters.roomType === "3BHK"
                        ? "3 BHK"
                        : filters.roomType === "1BHK"
                        ? "1 BHK"
                        : filters.roomType === "2BHK"
                        ? "2 BHK"
                        : "All Types"}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-[#5F554A] w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-300 ${
                        isRoomTypeOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* DROPDOWN MENU */}
                  {isRoomTypeOpen && (
                    <div className="absolute left-0 top-full z-10 mt-1 w-full border border-[#1C1B18]/15 bg-[#F8F4EA] py-0 shadow-lg">
                      {[
                        { value: "", label: "All Types" },
                        { value: "single", label: "Single Room" },
                        { value: "double", label: "Double Room" },
                        { value: "1BHK", label: "1 BHK" },
                        { value: "2BHK", label: "2 BHK" },
                        { value: "3BHK", label: "3 BHK" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            handleFilterChange("roomType", option.value || undefined);
                            setIsRoomTypeOpen(false);
                          }}
                          className={`
                            w-full
                            px-3 sm:px-3.5
                            py-2 sm:py-2.5
                            text-left
                            font-sans
                            text-xs sm:text-[13px]
                            font-medium
                            tracking-normal
                            transition-colors
                            hover:bg-[#174D35]/5
                            hover:text-[#174D35]
                            ${
                              (filters.roomType || "") === option.value
                                ? "bg-[#174D35]/5 text-[#174D35]"
                                : "text-[#1C1B18]"
                            }
                          `}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* RENT */}
              <div>
                <label
                  className="
                    mb-1.5 sm:mb-2
                    block
                    font-sans
                    text-[10px] sm:text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.2em] sm:tracking-[0.25em]
                    text-[#5F554A]
                  "
                >
                  Rent Budget (₹)
                </label>

                <div className={`relative ${isRentOpen ? 'z-50' : ''}`} ref={rentRef}>
                  <button
                    onClick={() => setIsRentOpen(!isRentOpen)}
                    className="
                      flex
                      h-[38px] sm:h-[42px]
                      w-full
                      items-center
                      justify-between
                      border
                      border-[#1C1B18]/15
                      bg-transparent
                      px-3 sm:px-3.5
                      font-sans
                      text-sm
                      font-medium
                      transition-colors
                      hover:border-[#174D35]/30
                    "
                  >
                    <span className={(!filters.minRent && !filters.maxRent) ? "text-[#756A5C]" : "text-[#1C1B18]"}>
                      {!filters.minRent && !filters.maxRent
                        ? "Any Budget"
                        : !filters.minRent && filters.maxRent === 5000
                        ? "Under ₹5,000"
                        : filters.minRent === 5000 && filters.maxRent === 10000
                        ? "₹5,000 - ₹10,000"
                        : filters.minRent === 10000 && filters.maxRent === 20000
                        ? "₹10,000 - ₹20,000"
                        : filters.minRent === 20000 && !filters.maxRent
                        ? "Above ₹20,000"
                        : "Custom Budget"}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-[#5F554A] w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-300 ${
                        isRentOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isRentOpen && (
                    <div className="absolute left-0 top-full z-10 mt-1 w-full border border-[#1C1B18]/15 bg-[#F8F4EA] py-0 shadow-lg">
                      {[
                        { label: "Any Budget", min: undefined, max: undefined },
                        { label: "Under ₹5,000", min: undefined, max: 5000 },
                        { label: "₹5,000 - ₹10,000", min: 5000, max: 10000 },
                        { label: "₹10,000 - ₹20,000", min: 10000, max: 20000 },
                        { label: "Above ₹20,000", min: 20000, max: undefined },
                      ].map((option) => (
                        <button
                          key={option.label}
                          onClick={() => {
                            setFilters((prev) => ({
                              ...prev,
                              minRent: option.min,
                              maxRent: option.max,
                              page: 1,
                            }));
                            setIsRentOpen(false);
                          }}
                          className={`
                            w-full
                            px-3 sm:px-3.5
                            py-2 sm:py-2.5
                            text-left
                            font-sans
                            text-xs sm:text-[13px]
                            font-medium
                            tracking-normal
                            transition-colors
                            hover:bg-[#174D35]/5
                            hover:text-[#174D35]
                            ${
                              filters.minRent === option.min && filters.maxRent === option.max
                                ? "bg-[#174D35]/5 text-[#174D35]"
                                : "text-[#1C1B18]"
                            }
                          `}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* FACILITIES & CLEAR */}
            <div className="mt-5 border-t border-[#1C1B18]/10 pt-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

                <div className="min-w-0 flex-1">
                  <label
                    className="
                      mb-2 sm:mb-2.5
                      block
                      font-sans
                      text-[10px] sm:text-[9px]
                      font-semibold
                      uppercase
                      tracking-[0.2em] sm:tracking-[0.25em]
                      text-[#5F554A]
                    "
                  >
                    Facilities
                  </label>

                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {[
                      "WIFI",
                      "AC",
                      "PARKING",
                      "ATTACHED BATHROOM",
                      "KITCHEN",
                      "FURNISHED",
                      "POWER BACKUP",
                      "WATER SUPPLY",
                    ].map((facility) => (
                      <button
                        key={facility}
                        type="button"
                        onClick={() => toggleFacility(facility)}
                        className={`
                          rounded-full
                          border
                          px-2.5 sm:px-3
                          py-1 sm:py-1.5
                          font-sans
                          text-xs sm:text-[11px]
                          font-medium
                          capitalize
                          tracking-normal
                          transition-colors
                          ${
                            selectedFacilities.includes(facility)
                              ? "border-[#174D35] bg-[#174D35] text-[#F8F4EA]"
                              : "border-[#1C1B18]/15 bg-transparent text-[#5F554A] hover:border-[#174D35]/30 hover:text-[#174D35]"
                          }
                        `}
                      >
                        {facility === "WIFI"
                          ? "WiFi"
                          : facility === "AC"
                          ? "AC"
                          : facility.toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    clearFilters();
                    setSelectedFacilities([]);
                  }}
                  className="
                    shrink-0
                    self-start
                    font-sans
                    text-xs sm:text-[12px]
                    font-medium
                    tracking-normal
                    text-[#5F554A]
                    transition-colors
                    hover:text-[#174D35]
                    lg:self-end
                  "
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================================
            MAIN CONTENT
        ================================= */}
        <div className="mb-4">
          <p className="text-xs md:text-[10px] font-semibold uppercase tracking-[0.25em] text-[#5F554A]">
            Showing {loading ? "..." : rooms.length} of{" "}
            {loading ? "..." : pagination.total} rooms
          </p>
        </div>

        {error ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center border border-red-500/20 bg-white p-8 text-center">
            <p className="text-sm font-medium text-red-600">
              {error}
            </p>

            <button
              onClick={fetchRooms}
              className="
                mt-4
                bg-[#174D35]
                px-6
                py-2.5
                text-[11px]
                font-bold
                uppercase
                tracking-wider
                text-[#F8F4EA]
                transition
                hover:bg-[#113B28]
              "
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="
                  animate-pulse
                  overflow-hidden
                  rounded-[16px]
                  border
                  border-[#E8E2D2]
                  bg-white
                "
              >
                <div className="aspect-[4/3] bg-gray-200" />

                <div className="p-4 sm:p-5">
                  <div className="mb-2 h-5 w-3/4 bg-gray-200" />
                  <div className="mb-4 h-4 w-1/2 bg-gray-200" />
                  <div className="h-6 w-1/3 bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : rooms.length > 0 ? (
          <>
            <motion.div 
              variants={staggerContainerVariants}
              initial={reduceMotion ? false : "hidden"}
              animate={reduceMotion ? false : "visible"}
              className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4"
            >
              {rooms.map((room) => (
                <RentalCard key={room._id} room={room} />
              ))}
            </motion.div>

            {/* PAGINATION */}
            {pagination.pages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-4">
                <button
                  onClick={() =>
                    handleFilterChange(
                      "page",
                      pagination.page - 1
                    )
                  }
                  disabled={pagination.page === 1}
                  className="
                    border
                    border-[#E8E2D2]
                    bg-white
                    px-5
                    py-2.5
                    text-[11px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-[#1C1B18]
                    transition
                    hover:bg-[#F8F4EA]
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  Prev
                </button>

                <span className="text-sm font-medium text-[#756A5C]">
                  {pagination.page} / {pagination.pages}
                </span>

                <button
                  onClick={() =>
                    handleFilterChange(
                      "page",
                      pagination.page + 1
                    )
                  }
                  disabled={
                    pagination.page === pagination.pages
                  }
                  className="
                    border
                    border-[#E8E2D2]
                    bg-white
                    px-5
                    py-2.5
                    text-[11px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-[#1C1B18]
                    transition
                    hover:bg-[#F8F4EA]
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex min-h-[400px] flex-col items-center justify-center border border-dashed border-[#A39B8F] bg-transparent px-5 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#174D35] shadow-sm">
              <Search size={24} />
            </div>

            <h2 className="font-serif text-[28px] font-medium text-[#1C1B18]">
              No rooms found
            </h2>

            <p className="mt-3 max-w-sm text-sm text-[#756A5C]">
              We couldn&apos;t find any rooms matching your
              current filters. Try adjusting your search
              criteria.
            </p>

            <button
              onClick={clearFilters}
              className="
                mt-8
                border
                border-[#174D35]
                px-6
                py-3
                text-[11px]
                font-bold
                uppercase
                tracking-wider
                text-[#174D35]
                transition
                hover:bg-[#174D35]
                hover:text-[#F8F4EA]
              "
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
