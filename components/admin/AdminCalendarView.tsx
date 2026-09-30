"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Sun,
  Moon,
  CheckCircle2,
  RefreshCw,
  PlusCircle,
  AlertCircle,
  Lock,
} from "lucide-react";
import { getBangladeshTodayString, formatDisplayDate, format12Hour } from "@/lib/utils/date";

interface AdminCalendarViewProps {
  onSelectBooking: (booking: any) => void;
  onAddBooking: (date?: string, slotId?: string) => void;
  adminRole?: string;
}

export const AdminCalendarView: React.FC<AdminCalendarViewProps> = ({
  onSelectBooking,
  onAddBooking,
  adminRole = "superadmin",
}) => {
  const isReadOnly = adminRole === "viewadmin";
  const [selectedDate, setSelectedDate] = useState<string>(getBangladeshTodayString());
  const [slots, setSlots] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCalendarData = async (date: string) => {
    setLoading(true);
    try {
      // 1. Fetch slots
      const slotsRes = await fetch("/api/admin/slots");
      const slotsData = await slotsRes.json();
      const allSlots = slotsData.slots || [];
      setSlots(allSlots);

      // 2. Fetch bookings for this date
      const bookingsRes = await fetch(`/api/admin/bookings?date=${date}`);
      const bookingsData = await bookingsRes.json();
      setBookings(bookingsData.bookings || []);
    } catch (err) {
      console.error("Calendar fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData(selectedDate);
  }, [selectedDate]);

  const bookingMap = React.useMemo(() => {
    const map: Record<string, any> = {};
    for (const b of bookings) {
      if (b.status === "CONFIRMED" || b.status === "PENDING") {
        map[b.slotId] = b;
      }
    }
    return map;
  }, [bookings]);

  const daySlots = slots.filter((s) => s.slotType === "DAY");
  const nightSlots = slots.filter((s) => s.slotType === "NIGHT");

  return (
    <div className="space-y-6">
      {/* Date Header & Quick Nav */}
      <div className="p-4 sm:p-6 rounded-2xl glass-card border border-stadium-750 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pitch-500/10 border border-pitch-500/30 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-pitch-400" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-lg text-white">
              Turf Schedule Matrix
            </h3>
            <p className="text-xs text-stadium-400">
              Viewing: <strong className="text-pitch-300">{formatDisplayDate(selectedDate)}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
            className="bg-pitch-800 px-3 font-bold py-2 rounded-xl bg-stadium-850 border border-stadium-700 text-white text-xs focus:outline-none focus:border-pitch-500"
            id="schedule-date-input"
          />
          <style jsx>{`
            #schedule-date-input::-webkit-calendar-picker-indicator {
              filter: invert(1);
              cursor: pointer;
              transform: scale(1.4);
            }
          `}</style>
          <button
            onClick={() => fetchCalendarData(selectedDate)}
            className="p-2 rounded-xl bg-stadium-850 border border-stadium-700 text-stadium-300 hover:text-white"
            title="Refresh Schedule"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-pitch-400" : ""}`} />
          </button>
          <button
            onClick={() => onAddBooking(selectedDate)}
            className="px-3.5 py-2 rounded-xl bg-pitch-500 hover:bg-pitch-400 text-stadium-950 font-black text-xs shadow-glow flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Booking</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-pitch-400 animate-spin mx-auto" />
          <p className="text-xs text-stadium-400">Loading schedule matrix...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Day Slots Matrix */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-stadium-800">
              <Sun className="w-4 h-4 text-amber-400" />
              <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                Day Slots (6:00 AM – 4:30 PM)
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {daySlots.map((slot) => {
                const booking = bookingMap[slot.slotId];
                return (
                  <SlotMatrixCard
                    key={slot.slotId}
                    slot={slot}
                    booking={booking}
                    isReadOnly={isReadOnly}
                    onOpenBooking={() => booking && onSelectBooking(booking)}
                    onBookSlot={() => !isReadOnly && onAddBooking(selectedDate, slot.slotId)}
                  />
                );
              })}
            </div>
          </div>

          {/* Night Slots Matrix */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-stadium-800">
              <Moon className="w-4 h-4 text-indigo-400" />
              <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">
                Night Floodlight Slots (5:00 PM – 2:00 AM)
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {nightSlots.map((slot) => {
                const booking = bookingMap[slot.slotId];
                return (
                  <SlotMatrixCard
                    key={slot.slotId}
                    slot={slot}
                    booking={booking}
                    isReadOnly={isReadOnly}
                    onOpenBooking={() => booking && onSelectBooking(booking)}
                    onBookSlot={() => !isReadOnly && onAddBooking(selectedDate, slot.slotId)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Subcomponent: SlotMatrixCard
const SlotMatrixCard: React.FC<{
  slot: any;
  booking?: any;
  isReadOnly?: boolean;
  onOpenBooking: () => void;
  onBookSlot: () => void;
}> = ({ slot, booking, isReadOnly, onOpenBooking, onBookSlot }) => {
  const isBooked = !!booking;
  const isConfirmed = booking?.status === "CONFIRMED";
  const isPending = booking?.status === "PENDING";

  return (
    <div
      onClick={() => {
        if (isBooked) {
          onOpenBooking();
        } else if (!isReadOnly) {
          onBookSlot();
        }
      }}
      className={`p-4 rounded-xl border transition-all flex flex-col justify-between min-h-[140px] ${
        isConfirmed
          ? "bg-stadium-900 border-red-500/40 hover:border-red-400 hover:shadow-md cursor-pointer"
          : isPending
          ? "bg-yellow-950/20 border-yellow-500/40 hover:border-yellow-400 hover:shadow-md cursor-pointer"
          : isReadOnly
          ? "bg-stadium-900/40 border-stadium-800 cursor-default"
          : "bg-stadium-900/60 border-stadium-750 hover:border-pitch-500/50 hover:bg-stadium-850 cursor-pointer"
      }`}
    >
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-stadium-800">
          <span className="font-display font-bold text-sm text-white">
            {slot.label}
          </span>

          <div>
            {isConfirmed && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                Booked
              </span>
            )}
            {isPending && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                Pending
              </span>
            )}
            {!isBooked && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Available
              </span>
            )}
          </div>
        </div>

        {isBooked ? (
          <div className="pt-2 space-y-1 text-xs">
            <p className="font-bold text-white truncate">{booking.customerName}</p>
            <p className="text-pitch-300 font-mono text-[11px]">{booking.mobile}</p>
            <p className="text-[10px] text-stadium-400">
              Paid: ৳{booking.paymentAmount} • Due: ৳{booking.finalPrice - booking.paymentAmount}
            </p>
          </div>
        ) : (
          <div className="pt-4 text-center">
            <p className="text-xs text-stadium-400 font-medium">Slot Open</p>
            <p className="text-[11px] text-pitch-400 font-bold">
              ৳{slot.discountedPrice.toLocaleString()}
            </p>
          </div>
        )}
      </div>

      <div className="pt-2 text-right">
        <span className="text-[10px] font-semibold text-stadium-500 hover:text-white">
          {isBooked
            ? "View Details →"
            : isReadOnly
            ? "Open for bookings"
            : "+ Reserve Slot"}
        </span>
      </div>
    </div>

  );
};
