"use client";

import React, { useState } from "react";
import {
  X,
  Search,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  CalendarDays,
  Loader2,
} from "lucide-react";
import { formatDisplayDate, format12Hour } from "@/lib/utils/date";
import { SlotAvailability } from "./SchedulePicker";

interface ManageBookingModalProps {
  onClose: () => void;
}

export const ManageBookingModal: React.FC<ManageBookingModalProps> = ({
  onClose,
}) => {
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reschedule state
  const [reschedulingBooking, setReschedulingBooking] = useState<any | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [availableSlotsForReschedule, setAvailableSlotsForReschedule] = useState<SlotAvailability[]>([]);
  const [selectedNewSlotId, setSelectedNewSlotId] = useState("");
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleSuccessMsg, setRescheduleSuccessMsg] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!mobile.trim() || !email.trim()) {
      setErrorMsg("Please provide both your mobile number and email address.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setRescheduleSuccessMsg(null);

    try {
      const cleanMobile = mobile.trim().replace(/[\s-]/g, "");
      const cleanEmail = email.trim().toLowerCase();

      const params = new URLSearchParams();
      params.append("mobile", cleanMobile);
      params.append("email", cleanEmail);

      const res = await fetch(`/api/bookings/manage?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.error ||
            "Booking not found. Please make sure your mobile number and email address match the details used for your booking."
        );
      }

      const foundBookings = data.bookings || [];
      if (foundBookings.length === 0) {
        throw new Error(
          "Booking not found. Please make sure your mobile number and email address match the details used for your booking."
        );
      }

      setBookings(foundBookings);
      setSearched(true);
    } catch (err: any) {
      setErrorMsg(
        err.message ||
          "Booking not found. Please make sure your mobile number and email address match the details used for your booking."
      );
      setBookings([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  // Start Rescheduling Flow
  const startReschedule = async (booking: any) => {
    setReschedulingBooking(booking);
    setRescheduleDate(booking.date);
    setSelectedNewSlotId("");
    setRescheduleSuccessMsg(null);
    fetchSlotsForReschedule(booking.date);
  };

  const fetchSlotsForReschedule = async (targetDate: string) => {
    if (!targetDate) return;
    try {
      const res = await fetch(`/api/availability?date=${targetDate}`);
      const data = await res.json();
      if (data.success) {
        setAvailableSlotsForReschedule(data.slots || []);
      }
    } catch (err) {
      console.error("Failed to load slots for reschedule:", err);
    }
  };

  const handleConfirmReschedule = async () => {
    if (!reschedulingBooking || !rescheduleDate || !selectedNewSlotId) {
      setErrorMsg("Please select a new date and an available slot.");
      return;
    }

    setRescheduleLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/bookings/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: reschedulingBooking.bookingId,
          mobile: reschedulingBooking.mobile,
          email: reschedulingBooking.email || email.trim().toLowerCase(),
          newDate: rescheduleDate,
          newSlotId: selectedNewSlotId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to process reschedule.");
      }

      setRescheduleSuccessMsg("Your booking schedule has been updated successfully!");
      setReschedulingBooking(null);
      // Refresh list
      handleSearch();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to reschedule booking.");
    } finally {
      setRescheduleLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stadium-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-stadium-900 border border-stadium-700/80 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-stadium-850 to-stadium-900 border-b border-stadium-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-pitch-500/10 border border-pitch-500/30 flex items-center justify-center">
              <Search className="w-4 h-4 text-pitch-400" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-lg text-white">
                Manage My Booking
              </h3>
              <p className="text-xs text-stadium-400">
                Look up status, price breakdown & request schedule changes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-stadium-800 text-stadium-400 hover:text-white hover:bg-stadium-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Alerts */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-start gap-2.5 animate-shake">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {rescheduleSuccessMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{rescheduleSuccessMsg}</span>
            </div>
          )}

          {/* Search Inputs */}
          <form onSubmit={handleSearch} className="p-4 rounded-xl bg-stadium-850 border border-stadium-700 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Booking Verification
              </h4>
              <span className="text-[11px] text-stadium-400">
                Both fields required
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stadium-400 mb-1">
                  Mobile Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="017XXXXXXXX"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-stadium-900 border border-stadium-700 text-stadium-100 placeholder-stadium-500 text-xs focus:outline-none focus:border-pitch-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stadium-400 mb-1">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-stadium-900 border border-stadium-700 text-stadium-100 placeholder-stadium-500 text-xs focus:outline-none focus:border-pitch-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-pitch-500 hover:bg-pitch-400 text-stadium-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching Booking...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Find My Booking</span>
                </>
              )}
            </button>
          </form>

          {/* Reschedule View if Active */}
          {reschedulingBooking && (
            <div className="p-4 rounded-xl bg-stadium-850 border-2 border-pitch-500/50 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stadium-700">
                <div>
                  <h4 className="font-display font-extrabold text-sm text-white flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-pitch-400" />
                    Reschedule Booking #{reschedulingBooking.bookingId}
                  </h4>
                  <p className="text-[11px] text-stadium-400">
                    Current: {formatDisplayDate(reschedulingBooking.date)} at {reschedulingBooking.timeRange}
                  </p>
                </div>
                <button
                  onClick={() => setReschedulingBooking(null)}
                  className="text-xs text-stadium-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              {/* Date picker for new slot */}
              <div>
                <label className="block text-xs font-semibold text-stadium-300 mb-1.5">
                  Select New Date:
                </label>
                <input
                  type="date"
                  value={rescheduleDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    setRescheduleDate(e.target.value);
                    fetchSlotsForReschedule(e.target.value);
                  }}
                  className="px-3.5 py-2 rounded-lg bg-stadium-900 border border-stadium-700 text-white text-xs focus:outline-none focus:border-pitch-500"
                />
              </div>

              {/* Available Slots for new date */}
              <div>
                <label className="block text-xs font-semibold text-stadium-300 mb-1.5">
                  Select New Available Slot:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {availableSlotsForReschedule
                    .filter((s) => s.status === "AVAILABLE")
                    .map((s) => (
                      <button
                        key={s.slotId}
                        type="button"
                        onClick={() => setSelectedNewSlotId(s.slotId)}
                        className={`p-2 rounded-lg border text-left text-xs transition-all ${selectedNewSlotId === s.slotId
                          ? "bg-pitch-500 text-stadium-950 font-bold border-pitch-400 shadow-sm"
                          : "bg-stadium-900 hover:bg-stadium-800 border-stadium-700 text-stadium-200"
                          }`}
                      >
                        <p className="font-semibold">{s.label}</p>
                        <p className={`text-[10px] ${selectedNewSlotId === s.slotId ? "text-stadium-950" : "text-pitch-400"}`}>
                          ৳{s.discountedPrice.toLocaleString()} ({s.slotType})
                        </p>
                      </button>
                    ))}
                  {availableSlotsForReschedule.filter((s) => s.status === "AVAILABLE").length === 0 && (
                    <p className="col-span-full text-xs text-stadium-400 py-2">
                      No available slots on this date. Please pick another date.
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReschedulingBooking(null)}
                  className="px-4 py-2 rounded-lg bg-stadium-800 text-stadium-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!selectedNewSlotId || rescheduleLoading}
                  onClick={handleConfirmReschedule}
                  className="px-4 py-2 rounded-lg bg-pitch-500 hover:bg-pitch-400 text-stadium-950 font-extrabold text-xs disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                >
                  {rescheduleLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Confirm Schedule Change</span>
                </button>
              </div>
            </div>
          )}

          {/* Bookings List */}
          {searched && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stadium-800">
                <h4 className="font-display font-bold text-sm text-white">
                  Found Bookings ({bookings.length})
                </h4>
              </div>

              {bookings.length === 0 ? (
                <div className="text-center py-8 text-stadium-400 text-xs px-4">
                  Booking not found. Please make sure your mobile number and email address match the details used for your booking.
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((b) => (
                    <div
                      key={b.bookingId}
                      className="p-4 rounded-xl bg-stadium-850 border border-stadium-700/80 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-stadium-800">
                        <div>
                          <span className="font-mono font-bold text-xs text-pitch-400">
                            #{b.bookingId}
                          </span>
                          <p className="text-xs font-semibold text-white mt-0.5">
                            {b.customerName} • {b.mobile}
                          </p>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {b.status === "CONFIRMED" && (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              CONFIRMED
                            </span>
                          )}
                          {b.status === "PENDING" && (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 flex items-center gap-1">
                              <RefreshCw className="w-3.5 h-3.5 text-yellow-400 animate-spin" />
                              PENDING
                            </span>
                          )}
                          {b.status === "DECLINED" && (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5 text-red-400" />
                              DECLINED
                            </span>
                          )}
                          {b.status === "CANCELLED" && (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-stadium-700 text-stadium-300 border border-stadium-600">
                              CANCELLED
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-stadium-500">Date:</span>
                          <p className="font-semibold text-white">{b.displayDate}</p>
                        </div>
                        <div>
                          <span className="text-stadium-500">Time:</span>
                          <p className="font-semibold text-pitch-300">{b.timeRange}</p>
                        </div>
                        <div>
                          <span className="text-stadium-500">Paid Advance:</span>
                          <p className="font-semibold text-emerald-400">৳{b.paymentAmount?.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-stadium-500">Due at Turf:</span>
                          <p className="font-bold text-white">৳{b.dueAmount?.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* 48-Hour Reschedule Action */}
                      <div className="pt-2 border-t border-stadium-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        {b.isEligibleToReschedule ? (
                          <>
                            <span className="text-[11px] text-pitch-300 flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-pitch-400" />
                              Eligible to reschedule ({b.hoursRemainingBeforeMatch} hrs before match)
                            </span>
                            <button
                              onClick={() => startReschedule(b)}
                              className="px-3 py-1.5 rounded-lg bg-stadium-800 hover:bg-pitch-500 hover:text-stadium-950 text-pitch-400 text-xs font-bold border border-pitch-500/40 transition-colors"
                            >
                              Change Schedule
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-stadium-500">
                            {b.status === "DECLINED" || b.status === "CANCELLED"
                              ? "Rescheduling unavailable for this status."
                              : "Schedule changes not allowed within 48h of match time."}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
