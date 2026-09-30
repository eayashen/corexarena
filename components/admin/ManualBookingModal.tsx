"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  PlusCircle,
  AlertTriangle,
  Loader2,
  DollarSign,
  FileText,
} from "lucide-react";
import { SlotAvailability } from "../user/SchedulePicker";
import { getBangladeshTodayString } from "@/lib/utils/date";

interface ManualBookingModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const ManualBookingModal: React.FC<ManualBookingModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState(getBangladeshTodayString());
  const [slots, setSlots] = useState<SlotAvailability[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [status, setStatus] = useState<"CONFIRMED" | "PENDING">("CONFIRMED");
  const [paymentAmount, setPaymentAmount] = useState<string>("0");
  const [specialDiscount, setSpecialDiscount] = useState<string>("0");
  const [adminNote, setAdminNote] = useState("");

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchSlotsForDate = async (targetDate: string) => {
    if (!targetDate) return;
    setLoadingSlots(true);
    try {
      const res = await fetch(`/api/availability?date=${targetDate}`);
      const data = await res.json();
      if (data.success) {
        setSlots(data.slots || []);
        const firstAvailable = (data.slots || []).find((s: any) => s.status === "AVAILABLE");
        if (firstAvailable) {
          setSelectedSlotId(firstAvailable.slotId);
        } else {
          setSelectedSlotId("");
        }
      }
    } catch (err) {
      console.error("Failed to load availability:", err);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchSlotsForDate(date);
  }, [date]);

  const selectedSlot = slots.find((s) => s.slotId === selectedSlotId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!customerName.trim()) {
      setErrorMsg("Please enter the customer's name.");
      return;
    }
    if (!mobile.trim()) {
      setErrorMsg("Please enter the customer's mobile number.");
      return;
    }
    if (!date) {
      setErrorMsg("Please select a valid date.");
      return;
    }
    if (!selectedSlotId) {
      setErrorMsg("Please select an available slot.");
      return;
    }

    const discountNum = Number(specialDiscount) || 0;
    if (discountNum < 0) {
      setErrorMsg("Special discount cannot be negative.");
      return;
    }
    if (selectedSlot && discountNum > selectedSlot.discountedPrice) {
      setErrorMsg(
        `Special discount (৳${discountNum.toLocaleString()}) cannot exceed slot price (৳${selectedSlot.discountedPrice.toLocaleString()}).`
      );
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          mobile: mobile.trim(),
          email: email.trim() || undefined,
          date,
          slotId: selectedSlotId,
          status,
          paymentAmount: Number(paymentAmount) || 0,
          specialDiscount: discountNum,
          adminNote: adminNote.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create manual booking.");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create manual booking.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stadium-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-xl bg-stadium-900 border border-stadium-700 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-stadium-850 to-stadium-900 border-b border-stadium-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-pitch-500/20 text-pitch-400 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-base sm:text-lg text-white">
                Add Manual Booking
              </h3>
              <p className="text-[11px] text-stadium-400">
                Create walk-in, phone call or offline match reservation
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2 animate-shake">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stadium-300 mb-1.5">
                Customer Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Name.."
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stadium-850 border border-stadium-700 text-stadium-100 placeholder-stadium-500 text-xs focus:outline-none focus:border-pitch-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stadium-300 mb-1.5">
                Mobile Number <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="01********"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stadium-850 border border-stadium-700 text-stadium-100 placeholder-stadium-500 text-xs focus:outline-none focus:border-pitch-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stadium-300 mb-1.5">
                Match Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stadium-850 border border-stadium-700 text-stadium-100 text-xs focus:outline-none focus:border-pitch-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stadium-300 mb-1.5">
                Initial Booking Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-stadium-850 border border-stadium-700 text-stadium-100 text-xs focus:outline-none focus:border-pitch-500"
              >
                <option value="CONFIRMED">CONFIRMED (Default for Admin)</option>
                <option value="PENDING">PENDING</option>
              </select>
            </div>
          </div>

          {/* Time Slot Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-stadium-300">
              Select Time Slot <span className="text-red-400">*</span>
            </label>

            {loadingSlots ? (
              <div className="py-4 text-center text-xs text-stadium-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-pitch-400" />
                <span>Checking availability...</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                {slots.map((s) => {
                  const isAvailable = s.status === "AVAILABLE";
                  const isSelected = selectedSlotId === s.slotId;
                  return (
                    <button
                      key={s.slotId}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => setSelectedSlotId(s.slotId)}
                      className={`p-2 rounded-xl border text-left text-xs transition-all ${isSelected
                          ? "bg-pitch-500 text-stadium-950 font-bold border-pitch-400 shadow-sm"
                          : isAvailable
                            ? "bg-stadium-850 hover:bg-stadium-800 border-stadium-700 text-stadium-100"
                            : "bg-stadium-900/50 border-stadium-800/40 opacity-40 cursor-not-allowed text-stadium-500"
                        }`}
                    >
                      <p className="font-bold">{s.label}</p>
                      <p className={`text-[10px] ${isSelected ? "text-stadium-950" : "text-pitch-400"}`}>
                        ৳{s.discountedPrice.toLocaleString()} ({s.slotType})
                        {!isAvailable ? ` • ${s.status}` : ""}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Payment & Discount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stadium-300 mb-1.5">
                Advance Paid Amount (৳)
              </label>
              <input
                type="number"
                min="0"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="500"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stadium-850 border border-stadium-700 text-stadium-100 text-xs focus:outline-none focus:border-pitch-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stadium-300 mb-1.5">
                Special Discount (৳)
              </label>
              <input
                type="number"
                min="0"
                value={specialDiscount}
                onChange={(e) => setSpecialDiscount(e.target.value)}
                placeholder="0"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stadium-850 border border-stadium-700 text-stadium-100 text-xs focus:outline-none focus:border-pitch-500 font-mono"
                id="input-manual-special-discount"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stadium-300 mb-1.5">
                Customer Email (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stadium-850 border border-stadium-700 text-stadium-100 text-xs focus:outline-none focus:border-pitch-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stadium-300 mb-1.5">
                Admin Note (Optional)
              </label>
              <input
                type="text"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="e.g. Walk-in regular team discount"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stadium-850 border border-stadium-700 text-stadium-100 text-xs focus:outline-none focus:border-pitch-500"
              />
            </div>
          </div>

          {selectedSlot && (
            <div className="p-3 rounded-xl bg-stadium-850 border border-stadium-750 text-xs space-y-1.5">
              <div className="flex justify-between text-stadium-400">
                <span>Original Slot Fee:</span>
                <span>৳{selectedSlot.discountedPrice.toLocaleString()}</span>
              </div>
              {Number(specialDiscount) > 0 && (
                <div className="flex justify-between text-amber-400 font-semibold">
                  <span>Special Discount:</span>
                  <span>- ৳{Number(specialDiscount).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-white pt-1 border-t border-stadium-800">
                <span className="text-pitch-300">Final Price:</span>
                <span className="text-pitch-300">
                  ৳{Math.max(0, selectedSlot.discountedPrice - (Number(specialDiscount) || 0)).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-stadium-800 text-stadium-300 font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedSlotId}
              className="px-5 py-2.5 rounded-xl bg-pitch-500 hover:bg-pitch-400 text-stadium-950 font-black text-xs shadow-glow disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
              <span>Create Reservation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
