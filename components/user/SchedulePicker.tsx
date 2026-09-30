"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Calendar as CalendarIcon,
  Sun,
  Moon,
  Clock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Lock,
  RefreshCw,
} from "lucide-react";
import { formatDisplayDate, format12Hour } from "@/lib/utils/date";

export interface SlotAvailability {
  slotId: string;
  slotType: "DAY" | "NIGHT";
  label: string;
  startTime: string;
  endTime: string;
  regularPrice: number;
  discountedPrice: number;
  order: number;
  status: "AVAILABLE" | "PENDING" | "BOOKED" | "PAST";
}

interface SchedulePickerProps {
  onSelectSlot: (slot: SlotAvailability, date: string) => void;
}

export const SchedulePicker: React.FC<SchedulePickerProps> = ({
  onSelectSlot,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [slots, setSlots] = useState<SlotAvailability[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<"ALL" | "DAY" | "NIGHT">("ALL");
  const dateStripRef = useRef<HTMLDivElement>(null);

  // Generate 30 upcoming dates starting today
  const upcomingDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 90; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      const dayName = new Intl.DateTimeFormat("en-GB", { weekday: "short" }).format(d);
      const dayNumber = d.getDate();
      const monthName = new Intl.DateTimeFormat("en-GB", { month: "short" }).format(d);

      dates.push({
        dateStr,
        dayName,
        dayNumber,
        monthName,
        isToday: i === 0,
      });
    }
    return dates;
  }, []);

  // Initialize selectedDate to today on mount
  useEffect(() => {
    if (upcomingDates.length > 0 && !selectedDate) {
      setSelectedDate(upcomingDates[0].dateStr);
    }
  }, [upcomingDates, selectedDate]);

  // Fetch slots for selected date
  const fetchAvailability = async (date: string) => {
    if (!date) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/availability?date=${date}`);
      const data = await res.json();
      if (data.success) {
        setSlots(data.slots || []);
      }
    } catch (err) {
      console.error("Failed to load availability:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchAvailability(selectedDate);
    }
  }, [selectedDate]);

  const scrollDates = (direction: "left" | "right") => {
    if (dateStripRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      dateStripRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const daySlots = slots.filter((s) => s.slotType === "DAY");
  const nightSlots = slots.filter((s) => s.slotType === "NIGHT");

  const displayedSlots = useMemo(() => {
    if (filterType === "DAY") return { day: daySlots, night: [] };
    if (filterType === "NIGHT") return { day: [], night: nightSlots };
    return { day: daySlots, night: nightSlots };
  }, [filterType, daySlots, nightSlots]);

  const availableCount = slots.filter((s) => s.status === "AVAILABLE").length;
  const pendingCount = slots.filter((s) => s.status === "PENDING").length;
  const bookedCount = slots.filter((s) => s.status === "BOOKED").length;

  return (
    <section id="schedule" className="py-16 bg-stadium-950 border-b border-stadium-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pitch-500/10 border border-pitch-500/30 text-pitch-400 text-xs font-bold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" />
            Live Slot Schedule
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Choose Your Match Date & Time
          </h2>
          <p className="text-stadium-300 text-sm sm:text-base">
            Select a date to check real-time turf availability. Click any available slot to book instantly.
          </p>
        </div>

        {/* Date Selector Strip */}
        <div className="relative glass-card rounded-2xl p-4 sm:p-6 mb-8 border border-stadium-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 mb-4 border-b border-stadium-800/80">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-pitch-400" />
              <span className="font-display font-bold text-base sm:text-lg text-white">
                Selected Date:{" "}
                <span className="text-pitch-400 font-extrabold">
                  {formatDisplayDate(selectedDate)}
                </span>
              </span>
            </div>

            {/* Custom Date Picker & Quick Actions */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <input
                type="date"
                value={selectedDate}
                min={upcomingDates[0]?.dateStr}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                className="bg-pitch-800 border border-stadium-700 text-stadium-100 text-xs font-bold rounded-lg px-3 py-2 focus:outline-none focus:border-pitch-500 transition-colors"
                id="schedule-date-input"
              />
              <style jsx>{`
                #schedule-date-input::-webkit-calendar-picker-indicator {
                  filter: invert(80%) sepia(100%) saturate(2000%) hue-rotate(5deg) brightness(105%) contrast(105%);
                  cursor: pointer;
                  transform: scale(1.4);
                }
              `}</style>
              <button
                onClick={() => fetchAvailability(selectedDate)}
                className="p-2 rounded-lg bg-stadium-850 hover:bg-stadium-800 border border-stadium-700 text-stadium-300 hover:text-white transition-colors"
                title="Refresh Availability"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-pitch-400" : ""}`} />
              </button>
            </div>
          </div>

          {/* Horizontal Scrollable Date Strip */}
          <div className="relative">
            <button
              onClick={() => scrollDates("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-8 h-8 rounded-full bg-stadium-800/90 border border-stadium-700 text-white flex items-center justify-center shadow-lg hover:bg-pitch-500 hover:text-stadium-950 transition-all hidden sm:flex"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div
              ref={dateStripRef}
              className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none scroll-smooth px-1"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {upcomingDates.map((item) => {
                const isSelected = selectedDate === item.dateStr;
                return (
                  <button
                    key={item.dateStr}
                    onClick={() => setSelectedDate(item.dateStr)}
                    className={`shrink-0 flex flex-col items-center justify-center w-16 sm:w-20 py-2.5 sm:py-3 rounded-xl border transition-all ${isSelected
                      ? "bg-pitch-500 text-stadium-950 border-pitch-400 shadow-glow font-extrabold scale-105"
                      : "bg-stadium-850 hover:bg-stadium-800 border-stadium-700/80 text-stadium-300 hover:text-white"
                      }`}
                  >
                    <span className={`text-[10px] sm:text-xs font-semibold uppercase ${isSelected ? "text-stadium-950" : "text-stadium-400"}`}>
                      {item.isToday ? "Today" : item.dayName}
                    </span>
                    <span className="text-base sm:text-xl font-display font-black leading-tight">
                      {item.dayNumber}
                    </span>
                    <span className={`text-[10px] font-medium ${isSelected ? "text-stadium-950" : "text-stadium-400"}`}>
                      {item.monthName}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => scrollDates("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-8 h-8 rounded-full bg-stadium-800/90 border border-stadium-700 text-white flex items-center justify-center shadow-lg hover:bg-pitch-500 hover:text-stadium-950 transition-all hidden sm:flex"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Slot Filter Tabs & Status Legend */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-stadium-800">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-stadium-900 border border-stadium-800 text-xs font-semibold w-full sm:w-auto">
              <button
                onClick={() => setFilterType("ALL")}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-md transition-all ${filterType === "ALL"
                  ? "bg-pitch-500 text-stadium-950 font-bold shadow-sm"
                  : "text-stadium-400 hover:text-white"
                  }`}
              >
                All Slots ({slots.length})
              </button>
              <button
                onClick={() => setFilterType("DAY")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 rounded-md transition-all ${filterType === "DAY"
                  ? "bg-pitch-500 text-stadium-950 font-bold shadow-sm"
                  : "text-stadium-400 hover:text-white"
                  }`}
              >
                <Sun className="w-3.5 h-3.5" /> Day (7)
              </button>
              <button
                onClick={() => setFilterType("NIGHT")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 rounded-md transition-all ${filterType === "NIGHT"
                  ? "bg-pitch-500 text-stadium-950 font-bold shadow-sm"
                  : "text-stadium-400 hover:text-white"
                  }`}
              >
                <Moon className="w-3.5 h-3.5" /> Night (6)
              </button>
            </div>

            {/* Status Legend */}
            <div className="flex items-center gap-4 text-xs font-medium text-stadium-300">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Available ({availableCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <span>Pending ({pendingCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span>Booked ({bookedCount})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Slots Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-pitch-400 animate-spin mx-auto" />
            <p className="text-sm text-stadium-400">Loading live slot schedule...</p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Day Slots Section */}
            {displayedSlots.day.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-stadium-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                      <Sun className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-display font-extrabold text-lg text-white">
                        DAY SLOTS (6:00 AM – 4:30 PM)
                      </h3>
                      <p className="text-xs text-stadium-400">
                        7 morning & afternoon slots • ৳2,000 per slot (৳500 OFF)
                      </p>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-bold text-pitch-400 bg-pitch-950 px-2.5 py-1 rounded border border-pitch-500/30">
                      Regular: ৳2,500 → Now: ৳2,000
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {displayedSlots.day.map((slot) => (
                    <SlotCard
                      key={slot.slotId}
                      slot={slot}
                      date={selectedDate}
                      onBook={() => onSelectSlot(slot, selectedDate)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Night Slots Section */}
            {displayedSlots.night.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-stadium-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                      <Moon className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-display font-extrabold text-lg text-white">
                        NIGHT SLOTS (5:00 PM – 2:00 AM)
                      </h3>
                      <p className="text-xs text-stadium-400">
                        6 floodlight prime match slots • ৳4,000 per slot (৳500 OFF)
                      </p>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-bold text-gold-400 bg-gold-950 px-2.5 py-1 rounded border border-gold-500/30">
                      Regular: ৳4,500 → Now: ৳4,000
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {displayedSlots.night.map((slot) => (
                    <SlotCard
                      key={slot.slotId}
                      slot={slot}
                      date={selectedDate}
                      onBook={() => onSelectSlot(slot, selectedDate)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

// Subcomponent: SlotCard
interface SlotCardProps {
  slot: SlotAvailability;
  onBook: () => void;
  date: string;
}

const SlotCard: React.FC<SlotCardProps> = ({ slot, onBook, date }) => {
  const isAvailable = slot.status === "AVAILABLE";
  const isPending = slot.status === "PENDING";
  const isBooked = slot.status === "BOOKED";
  const isPast = slot.status === "PAST";

  return (
    <div
      className={`relative rounded-xl p-4 border transition-all flex flex-col justify-between ${isAvailable
        ? "bg-stadium-900 hover:bg-stadium-850 border-stadium-700/90 hover:border-pitch-500/60 shadow-md hover:shadow-glow cursor-pointer group"
        : isPending
          ? "bg-yellow-950/20 border-yellow-800/40 opacity-80"
          : isBooked
            ? "bg-red-950/20 border-red-900/40 opacity-75"
            : "bg-stadium-900/40 border-stadium-800/40 opacity-50 cursor-not-allowed"
        }`}
      onClick={() => isAvailable && onBook()}
    >
      {/* Top row: Time & Status Badge */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-stadium-400 font-medium">
            <Clock className="w-3.5 h-3.5 text-stadium-500" />
            <span>{slot.slotType === "DAY" ? "Day Slot" : "Night Slot"}</span>
          </div>
          <h4 className="font-display font-extrabold text-base text-white mt-0.5">
            {slot.label || `${format12Hour(slot.startTime)} – ${format12Hour(slot.endTime)}`}
          </h4>
        </div>

        {/* Status Pill */}
        <div>
          {isAvailable && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Available
            </span>
          )}
          {isPending && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
              Pending
            </span>
          )}
          {isBooked && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              Booked
            </span>
          )}
          {isPast && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stadium-800 text-stadium-400 border border-stadium-700">
              <Lock className="w-3 h-3" />
              Past
            </span>
          )}
        </div>
      </div>

      {/* Pricing & Booking CTA */}
      <div className="pt-3 border-t border-stadium-800/80 flex items-center justify-between">
        <div>
          <div className="text-[11px] text-stadium-500 line-through">
            ৳{slot.regularPrice.toLocaleString()}
          </div>
          <div className="font-display font-black text-xl text-pitch-400">
            ৳{slot.discountedPrice.toLocaleString()}
          </div>
        </div>

        <p className="text-xs text-stadium-400">
          {new Date(date).toLocaleDateString("en-GB", {
            weekday: "short",
            day: "2-digit",
            month: "short",
          })}
        </p>

        {isAvailable ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBook();
            }}
            className="px-3.5 py-2 rounded-lg text-xs font-bold text-stadium-950 bg-pitch-500 group-hover:bg-pitch-400 transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>Book</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="text-xs font-medium text-stadium-500 flex items-center gap-1">
            {isPending && <AlertCircle className="w-3.5 h-3.5 text-yellow-500" />}
            {isBooked && <Lock className="w-3.5 h-3.5 text-red-500" />}
            <span>{isPending ? "Reserved" : isBooked ? "Unavailable" : "Passed"}</span>
          </div>
        )}
      </div>
    </div>
  );
};
