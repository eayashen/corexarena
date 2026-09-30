"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  X,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileImage,
  RefreshCw,
  CalendarDays,
  Shield,
  User,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  History,
  Loader2,
  Trash2,
  Tag,
  Percent,
  Edit2,
  MinusCircle,
  Plus,
  Eye,
} from "lucide-react";
import { formatDisplayDate, format12Hour } from "@/lib/utils/date";
import { SlotAvailability } from "../user/SchedulePicker";

interface BookingDetailModalProps {
  booking: any;
  onClose: () => void;
  onUpdate: () => void;
  adminRole?: string;
}

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  booking,
  onClose,
  onUpdate,
  adminRole = "superadmin",
}) => {
  const isReadOnly = adminRole === "viewadmin";

  const [currentBooking, setCurrentBooking] = useState<any>(booking);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Decline Dialog State
  const [showDeclinePrompt, setShowDeclinePrompt] = useState(false);
  const [declineReason, setDeclineReason] = useState("");

  // Cancel Dialog State
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // Admin Reschedule State (No 48h rule for Admin!)
  const [showReschedulePrompt, setShowReschedulePrompt] = useState(false);
  const [newRescheduleDate, setNewRescheduleDate] = useState(currentBooking.date);
  const [rescheduleSlots, setRescheduleSlots] = useState<SlotAvailability[]>([]);
  const [selectedRescheduleSlotId, setSelectedRescheduleSlotId] = useState("");

  // Special Discount State
  const [showDiscountPrompt, setShowDiscountPrompt] = useState(false);
  const [discountInput, setDiscountInput] = useState<string>(
    (currentBooking.specialDiscount ?? 0).toString()
  );
  const [discountReasonInput, setDiscountReasonInput] = useState<string>("");
  const [discountValidationMsg, setDiscountValidationMsg] = useState<string | null>(null);
  const [discountLoading, setDiscountLoading] = useState(false);

  // Screenshot viewer toggle
  const [showFullScreenshot, setShowFullScreenshot] = useState(false);

  const originalPrice =
    currentBooking.originalPrice ?? currentBooking.discountedPrice ?? currentBooking.finalPrice ?? 0;
  const specialDiscount = currentBooking.specialDiscount ?? 0;
  const finalPrice =
    currentBooking.finalPrice ?? Math.max(0, originalPrice - specialDiscount);
  const paymentAmount = currentBooking.paymentAmount ?? 0;
  const dueAmount = finalPrice - paymentAmount;

  const fetchRescheduleSlots = async (date: string) => {
    try {
      const res = await fetch(`/api/availability?date=${date}`);
      const data = await res.json();
      if (data.success) {
        setRescheduleSlots(data.slots || []);
      }
    } catch (err) {
      console.error("Failed to fetch slots for admin reschedule:", err);
    }
  };

  const handleAction = async (action: string, payload: any = {}) => {
    setActionLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/admin/bookings/${currentBooking._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `Failed to perform ${action}`);
      }

      if (data.booking) {
        setCurrentBooking(data.booking);
      }

      onUpdate();
      if (action !== "UPDATE_DISCOUNT") {
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to execute action.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveDiscount = async (amount: number, reason?: string) => {
    if (isNaN(amount) || amount < 0) {
      setDiscountValidationMsg("Special discount cannot be negative.");
      return;
    }
    if (amount > originalPrice) {
      setDiscountValidationMsg(
        `Special discount (৳${amount.toLocaleString()}) cannot exceed original price of ৳${originalPrice.toLocaleString()}.`
      );
      return;
    }

    setDiscountLoading(true);
    setDiscountValidationMsg(null);

    try {
      const res = await fetch(`/api/admin/bookings/${currentBooking._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_DISCOUNT",
          specialDiscount: amount,
          discountReason: reason || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update special discount");
      }

      if (data.booking) {
        setCurrentBooking(data.booking);
      }
      setShowDiscountPrompt(false);
      setDiscountReasonInput("");
      onUpdate();
    } catch (err: any) {
      setDiscountValidationMsg(err.message || "Failed to update discount");
    } finally {
      setDiscountLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stadium-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-stadium-900 border border-stadium-700/80 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-stadium-850 to-stadium-900 border-b border-stadium-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-pitch-950 text-pitch-400 border border-pitch-500/30">
              #{currentBooking.bookingId}
            </span>
            <div>
              <h3 className="font-display font-extrabold text-base sm:text-lg text-white">
                Booking Details
              </h3>
              <p className="text-[11px] text-stadium-400">
                Created on {new Date(currentBooking.createdAt).toLocaleString()} by{" "}
                <strong className="text-white">
                  {currentBooking.bookingSource || currentBooking.createdBy}
                </strong>
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

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          {isReadOnly && (
            <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/40 text-blue-200 text-xs flex items-center gap-2.5">
              <Eye className="w-4 h-4 text-blue-400 shrink-0" />
              <span>
                <strong>View-Only Mode:</strong> You are logged in as a <strong>viewadmin</strong>. Action buttons (Approve, Decline, Reschedule, Cancel, and Special Discount adjustments) are disabled.
              </span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Top Status & Quick Action Bar */}
          <div className="p-4 rounded-xl bg-stadium-850 border border-stadium-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-stadium-400">Current Status</p>
              <div className="mt-1">
                {currentBooking.status === "PENDING" && (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
                    PENDING APPROVAL
                  </span>
                )}
                {currentBooking.status === "CONFIRMED" && (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    CONFIRMED
                  </span>
                )}
                {currentBooking.status === "DECLINED" && (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-red-500/20 text-red-300 border border-red-500/30 inline-flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-red-400" />
                    DECLINED
                  </span>
                )}
                {currentBooking.status === "CANCELLED" && (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-stadium-700 text-stadium-300 border border-stadium-600 inline-flex items-center gap-1.5">
                    CANCELLED
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons for Pending or Active */}
            <div className="flex flex-wrap items-center gap-2">
              {isReadOnly ? (
                <div className="px-3 py-1.5 rounded-lg bg-stadium-900 border border-stadium-750 text-stadium-400 text-xs flex items-center gap-1.5 italic">
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  <span>Read-only view</span>
                </div>
              ) : (
                <>
                  {currentBooking.status === "PENDING" && (
                    <>
                      <button
                        disabled={actionLoading}
                        onClick={() => handleAction("APPROVE")}
                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve</span>
                      </button>

                      <button
                        disabled={actionLoading}
                        onClick={() => setShowDeclinePrompt(true)}
                        className="px-4 py-2 rounded-lg bg-red-700/60 hover:bg-red-700 text-red-100 text-xs font-bold border border-red-500/40 flex items-center gap-1.5 transition-all"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Decline</span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => {
                      setShowReschedulePrompt(true);
                      fetchRescheduleSlots(booking.date);
                    }}
                    className="px-3.5 py-2 rounded-lg bg-stadium-800 hover:bg-stadium-750 text-pitch-300 text-xs font-bold border border-stadium-700 flex items-center gap-1.5 transition-all"
                  >
                    <CalendarDays className="w-4 h-4 text-pitch-400" />
                    <span>Change Schedule</span>
                  </button>

                  {booking.status !== "CANCELLED" && booking.status !== "DECLINED" && (
                    <button
                      disabled={actionLoading}
                      onClick={() => setShowCancelPrompt(true)}
                      className="px-3 py-2 rounded-lg bg-stadium-800 hover:bg-red-900/40 text-stadium-300 hover:text-red-300 text-xs font-medium border border-stadium-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Decline Reason Prompt Form */}
          {showDeclinePrompt && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-700/60 space-y-3">
              <h4 className="font-bold text-xs text-red-300 uppercase tracking-wider">
                Decline Booking Reason (Optional)
              </h4>
              <input
                type="text"
                placeholder="e.g. Invalid payment screenshot, unreceived bKash transaction..."
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-stadium-900 border border-stadium-700 text-xs text-white placeholder-stadium-500 focus:outline-none focus:border-red-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeclinePrompt(false)}
                  className="px-3 py-1.5 rounded-lg bg-stadium-800 text-xs text-stadium-300"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleAction("DECLINE", { declineReason })}
                  className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
                >
                  Confirm Decline
                </button>
              </div>
            </div>
          )}

          {/* Cancel Prompt Form */}
          {showCancelPrompt && (
            <div className="p-4 rounded-xl bg-stadium-850 border border-stadium-700 space-y-3">
              <h4 className="font-bold text-xs text-stadium-300 uppercase tracking-wider">
                Cancel Booking Note
              </h4>
              <input
                type="text"
                placeholder="Reason for cancellation..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-stadium-900 border border-stadium-700 text-xs text-white placeholder-stadium-500 focus:outline-none focus:border-pitch-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCancelPrompt(false)}
                  className="px-3 py-1.5 rounded-lg bg-stadium-800 text-xs text-stadium-300"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleAction("CANCEL", { adminNote: cancelReason })}
                  className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
                >
                  Confirm Cancel
                </button>
              </div>
            </div>
          )}

          {/* Admin Reschedule Prompt (Bypasses 48h limit) */}
          {showReschedulePrompt && (
            <div className="p-4 rounded-xl bg-stadium-850 border-2 border-pitch-500/40 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stadium-700">
                <h4 className="font-display font-bold text-xs text-pitch-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  Admin Schedule Override (No 48h Restriction)
                </h4>
                <button
                  onClick={() => setShowReschedulePrompt(false)}
                  className="text-xs text-stadium-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stadium-300 mb-1">
                  Choose New Date:
                </label>
                <input
                  type="date"
                  value={newRescheduleDate}
                  onChange={(e) => {
                    setNewRescheduleDate(e.target.value);
                    fetchRescheduleSlots(e.target.value);
                  }}
                  className="px-3 py-2 rounded-lg bg-stadium-900 border border-stadium-700 text-white text-xs focus:outline-none focus:border-pitch-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stadium-300 mb-1">
                  Select Available Slot:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                  {rescheduleSlots
                    .filter((s) => s.status === "AVAILABLE")
                    .map((s) => (
                      <button
                        key={s.slotId}
                        type="button"
                        onClick={() => setSelectedRescheduleSlotId(s.slotId)}
                        className={`p-2 rounded-lg border text-left text-xs transition-all ${selectedRescheduleSlotId === s.slotId
                            ? "bg-pitch-500 text-stadium-950 font-bold border-pitch-400"
                            : "bg-stadium-900 hover:bg-stadium-800 border-stadium-700 text-stadium-200"
                          }`}
                      >
                        <p>{s.label}</p>
                        <p className={`text-[10px] ${selectedRescheduleSlotId === s.slotId ? "text-stadium-950" : "text-pitch-400"}`}>
                          ৳{s.discountedPrice.toLocaleString()} ({s.slotType})
                        </p>
                      </button>
                    ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReschedulePrompt(false)}
                  className="px-3 py-1.5 rounded-lg bg-stadium-800 text-xs text-stadium-300"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={!selectedRescheduleSlotId || actionLoading}
                  onClick={() =>
                    handleAction("RESCHEDULE", {
                      newDate: newRescheduleDate,
                      newSlotId: selectedRescheduleSlotId,
                    })
                  }
                  className="px-4 py-1.5 rounded-lg bg-pitch-500 hover:bg-pitch-400 text-stadium-950 font-bold text-xs"
                >
                  Save Schedule Change
                </button>
              </div>
            </div>
          )}

          {/* Customer & Match Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer Information Card */}
            <div className="p-4 rounded-xl bg-stadium-850 border border-stadium-700 space-y-2.5">
              <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-stadium-800">
                <User className="w-3.5 h-3.5 text-pitch-400" />
                Customer Information
              </h4>
              <div className="text-xs space-y-1.5">
                <p className="flex justify-between">
                  <span className="text-stadium-400">Name:</span>
                  <strong className="text-white">{currentBooking.customerName}</strong>
                </p>
                <p className="flex justify-between">
                  <span className="text-stadium-400">Mobile:</span>
                  <a href={`tel:${currentBooking.mobile}`} className="text-pitch-300 font-mono hover:underline">
                    {currentBooking.mobile}
                  </a>
                </p>
                {currentBooking.email && (
                  <p className="flex justify-between">
                    <span className="text-stadium-400">Email:</span>
                    <a href={`mailto:${currentBooking.email}`} className="text-blue-300 hover:underline truncate max-w-[160px]">
                      {currentBooking.email}
                    </a>
                  </p>
                )}
                {currentBooking.address && (
                  <p className="flex justify-between">
                    <span className="text-stadium-400">Area:</span>
                    <span className="text-stadium-200">{currentBooking.address}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Match Slot Details Card */}
            <div className="p-4 rounded-xl bg-stadium-850 border border-stadium-700 space-y-2.5">
              <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-stadium-800">
                <Calendar className="w-3.5 h-3.5 text-pitch-400" />
                Match Slot Details
              </h4>
              <div className="text-xs space-y-1.5">
                <p className="flex justify-between">
                  <span className="text-stadium-400">Date:</span>
                  <strong className="text-white">{formatDisplayDate(currentBooking.date)}</strong>
                </p>
                <p className="flex justify-between">
                  <span className="text-stadium-400">Time:</span>
                  <strong className="text-pitch-300">
                    {format12Hour(currentBooking.startTime)} – {format12Hour(currentBooking.endTime)}
                  </strong>
                </p>
                <p className="flex justify-between">
                  <span className="text-stadium-400">Type:</span>
                  <span className="uppercase font-bold text-stadium-200">{currentBooking.slotType} Slot</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-stadium-400">Slot ID:</span>
                  <span className="font-mono text-stadium-300">{currentBooking.slotId}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Pricing, Payment & bKash Screenshot Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pricing & Payment Summary */}
            <div className="p-4 rounded-xl bg-stadium-850 border border-stadium-700 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stadium-800">
                <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-gold-400" />
                  Pricing & Payment
                </h4>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => {
                      setDiscountInput(specialDiscount.toString());
                      setDiscountReasonInput("");
                      setDiscountValidationMsg(null);
                      setShowDiscountPrompt(!showDiscountPrompt);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-pitch-500/20 hover:bg-pitch-500/30 text-pitch-300 border border-pitch-500/40 text-[11px] font-bold flex items-center gap-1 transition-all"
                    id="btn-toggle-special-discount"
                  >
                    <Tag className="w-3 h-3 text-pitch-400" />
                    <span>{specialDiscount > 0 ? "Edit Discount" : "Special Discount"}</span>
                  </button>
                )}
              </div>

              {/* Pricing breakdown */}
              <div className="text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-stadium-400">Original Price:</span>
                  <span className="font-semibold text-stadium-200">৳{originalPrice.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-stadium-400 flex items-center gap-1">
                    Special Discount:
                    {specialDiscount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Admin
                      </span>
                    )}
                  </span>
                  <span className={`font-bold ${specialDiscount > 0 ? "text-amber-400" : "text-stadium-400"}`}>
                    {specialDiscount > 0 ? `- ৳${specialDiscount.toLocaleString()}` : "৳0"}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-1.5 border-t border-stadium-800/80">
                  <span className="text-stadium-300 font-bold">Final Price:</span>
                  <strong className="text-pitch-300 text-sm font-black">
                    ৳{finalPrice.toLocaleString()}
                  </strong>
                </div>

                <div className="flex justify-between items-center pt-1.5 border-t border-stadium-800/60">
                  <span className="text-stadium-400">Advance Paid:</span>
                  <strong className="text-emerald-400">৳{paymentAmount.toLocaleString()}</strong>
                </div>

                <div className="flex justify-between items-center font-bold">
                  <span className="text-stadium-400">Due at Turf:</span>
                  <strong className="text-white">৳{dueAmount.toLocaleString()}</strong>
                </div>

                {currentBooking.transactionId && (
                  <div className="pt-2 border-t border-stadium-800 flex justify-between items-center">
                    <span className="text-stadium-400">bKash TrxID:</span>
                    <span className="font-mono font-bold text-pitch-300">{currentBooking.transactionId}</span>
                  </div>
                )}
              </div>

              {/* Special Discount Edit Form */}
              {showDiscountPrompt && (
                <div className="mt-3 p-3.5 rounded-xl bg-stadium-900 border border-pitch-500/40 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between pb-1 border-b border-stadium-800">
                    <span className="text-[11px] font-bold text-pitch-300 uppercase tracking-wider flex items-center gap-1">
                      <Percent className="w-3 h-3" />
                      Admin Special Discount
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowDiscountPrompt(false)}
                      className="text-[11px] text-stadium-400 hover:text-white"
                    >
                      Close
                    </button>
                  </div>

                  {discountValidationMsg && (
                    <div className="p-2 rounded-lg bg-red-950/60 border border-red-700 text-red-300 text-[11px] flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>{discountValidationMsg}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-stadium-300 mb-1">
                        Special Discount Amount (৳):
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={originalPrice}
                        value={discountInput}
                        onChange={(e) => {
                          setDiscountInput(e.target.value);
                          const val = Number(e.target.value);
                          if (val < 0) {
                            setDiscountValidationMsg("Special discount cannot be negative.");
                          } else if (val > originalPrice) {
                            setDiscountValidationMsg(
                              `Special discount (৳${val.toLocaleString()}) cannot exceed original price (৳${originalPrice.toLocaleString()}).`
                            );
                          } else {
                            setDiscountValidationMsg(null);
                          }
                        }}
                        placeholder="e.g. 500"
                        className="w-full px-3 py-1.5 rounded-lg bg-stadium-850 border border-stadium-700 text-white text-xs focus:outline-none focus:border-pitch-500 font-mono"
                        id="input-special-discount-amount"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stadium-300 mb-1">
                        Note (Optional):
                      </label>
                      <input
                        type="text"
                        value={discountReasonInput}
                        onChange={(e) => setDiscountReasonInput(e.target.value)}
                        placeholder="e.g. Regular team, promotional discount..."
                        className="w-full px-3 py-1.5 rounded-lg bg-stadium-850 border border-stadium-700 text-white text-xs focus:outline-none focus:border-pitch-500"
                      />
                    </div>
                  </div>

                  {/* Calculation Preview */}
                  {(() => {
                    const parsed = Number(discountInput) || 0;
                    const previewFinal = Math.max(0, originalPrice - parsed);
                    const isExceeding = parsed > originalPrice;
                    return (
                      <div className="p-2 rounded-lg bg-stadium-850 border border-stadium-750 text-[11px] flex justify-between items-center">
                        <span className="text-stadium-400">
                          Final Price: ৳{originalPrice.toLocaleString()} − ৳{parsed.toLocaleString()} =
                        </span>
                        <span
                          className={`font-black ${isExceeding ? "text-red-400" : "text-pitch-300"
                            }`}
                        >
                          ৳{previewFinal.toLocaleString()}
                        </span>
                      </div>
                    );
                  })()}

                  <div className="flex items-center justify-between pt-1">
                    {specialDiscount > 0 ? (
                      <button
                        type="button"
                        disabled={discountLoading}
                        onClick={() => handleSaveDiscount(0, "Special discount removed by Admin")}
                        className="px-2.5 py-1 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800 text-[11px] font-bold flex items-center gap-1 transition-colors"
                      >
                        <MinusCircle className="w-3 h-3" />
                        <span>Remove Discount</span>
                      </button>
                    ) : (
                      <div />
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowDiscountPrompt(false)}
                        className="px-3 py-1 rounded-lg bg-stadium-800 text-stadium-400 text-[11px] font-semibold hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={
                          discountLoading ||
                          Number(discountInput) < 0 ||
                          Number(discountInput) > originalPrice
                        }
                        onClick={() =>
                          handleSaveDiscount(Number(discountInput) || 0, discountReasonInput)
                        }
                        className="px-3.5 py-1 rounded-lg bg-pitch-500 hover:bg-pitch-400 text-stadium-950 text-[11px] font-black shadow-glow disabled:opacity-50 flex items-center gap-1"
                        id="btn-save-special-discount"
                      >
                        {discountLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                        <span>Save Discount</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Screenshot Box */}
            <div className="p-4 rounded-xl bg-stadium-850 border border-stadium-700 space-y-2.5">
              <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-stadium-800">
                <FileImage className="w-3.5 h-3.5 text-pink-400" />
                Payment Screenshot
              </h4>

              {currentBooking.paymentScreenshot ? (
                <div className="space-y-2">
                  <div
                    onClick={() => setShowFullScreenshot(true)}
                    className="relative w-full h-28 rounded-lg overflow-hidden bg-stadium-950 border border-stadium-700 cursor-pointer group hover:border-pitch-500 transition-colors"
                  >
                    <img
                      src={currentBooking.paymentScreenshot}
                      alt="bKash Payment Screenshot"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-stadium-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold text-white transition-opacity">
                      Click to View Full Image
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFullScreenshot(true)}
                    className="text-[11px] text-pitch-400 hover:underline font-semibold"
                  >
                    🔍 Zoom Payment Screenshot
                  </button>
                </div>
              ) : (
                <p className="text-xs text-stadium-500 py-4">No payment screenshot attached.</p>
              )}
            </div>
          </div>

          {/* Special Discount History Section */}
          <div className="p-4 rounded-xl bg-stadium-850 border border-stadium-700 space-y-3">
            <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-stadium-800">
              <Percent className="w-3.5 h-3.5 text-amber-400" />
              Discount History
            </h4>

            {currentBooking.discountHistory && currentBooking.discountHistory.length > 0 ? (
              <div className="space-y-2">
                {currentBooking.discountHistory.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-stadium-900 border border-stadium-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stadium-200">
                          ৳{item.previousDiscount?.toLocaleString()} → ৳{item.newDiscount?.toLocaleString()}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {item.newDiscount > item.previousDiscount
                            ? `+৳${(item.newDiscount - item.previousDiscount).toLocaleString()}`
                            : item.newDiscount === 0
                              ? "Removed"
                              : `-৳${(item.previousDiscount - item.newDiscount).toLocaleString()}`}
                        </span>
                      </div>
                      {item.reason && (
                        <p className="text-[11px] text-stadium-400 mt-0.5">Note: {item.reason}</p>
                      )}
                    </div>
                    <div className="text-right text-[10px] text-stadium-500 shrink-0">
                      <p className="font-medium text-stadium-300">By {item.changedBy}</p>
                      <p>
                        {new Date(item.timestamp).toLocaleString("en-US", {
                          timeZone: "Asia/Dhaka",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-stadium-500 py-1">
                No special discounts have been recorded for this booking.
              </p>
            )}
          </div>

          {/* Audit Trail & History */}
          <div className="p-4 rounded-xl bg-stadium-850 border border-stadium-700 space-y-3">
            <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-pitch-400" />
              Activity History
            </h4>

            <div className="space-y-2 text-xs">
              {booking.auditLog && booking.auditLog.length > 0 ? (
                booking.auditLog.map((log: any, index: number) => (
                  <div
                    key={index}
                    className="p-2.5 rounded-lg bg-stadium-900 border border-stadium-800 flex items-start justify-between gap-2"
                  >
                    <div>
                      <p className="font-semibold text-stadium-200">{log.action}</p>
                      {log.details && <p className="text-[11px] text-stadium-400 mt-0.5">{log.details}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stadium-800 text-pitch-400">
                        {log.actor}
                      </span>
                      <p className="text-[10px] text-stadium-500 mt-1">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-stadium-500">No activity logged.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full Screenshot Lightbox Modal */}
      {showFullScreenshot && booking.paymentScreenshot && (
        <div
          className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setShowFullScreenshot(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={booking.paymentScreenshot}
              alt="bKash Full Screenshot"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-stadium-700"
            />
            <button
              onClick={() => setShowFullScreenshot(false)}
              className="absolute -top-4 -right-4 p-2 rounded-full bg-stadium-800 text-white hover:bg-stadium-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
