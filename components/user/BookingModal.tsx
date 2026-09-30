"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  X,
  Calendar,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  Upload,
  AlertTriangle,
  Loader2,
  ShieldAlert,
  HelpCircle,
  FileImage,
} from "lucide-react";
import { SlotAvailability } from "./SchedulePicker";
import { formatDisplayDate } from "@/lib/utils/date";

interface BookingModalProps {
  slot: SlotAvailability | null;
  date: string;
  onClose: () => void;
  onSuccess: (booking: any) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  slot,
  date,
  onClose,
  onSuccess,
}) => {
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [screenshotBase64, setScreenshotBase64] = useState<string>("");
  const [screenshotName, setScreenshotName] = useState<string>("");
  const [copiedNumber, setCopiedNumber] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!slot || !date) return null;

  const regularPrice = slot.regularPrice;
  const discount = regularPrice - slot.discountedPrice;
  const finalPrice = slot.discountedPrice;
  const advancePayment = 500;
  const duePayment = finalPrice - advancePayment;

  const bkashNumber = "01675906833";

  const handleCopyBkash = () => {
    navigator.clipboard.writeText(bkashNumber);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (max 6MB)
    if (file.size > 6 * 1024 * 1024) {
      setErrorMsg("Image size exceeds 6MB. Please upload a smaller screenshot.");
      return;
    }

    // Check type
    if (!["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.type)) {
      setErrorMsg("Please upload a valid image (JPG, PNG, or WebP).");
      return;
    }

    setErrorMsg(null);
    setScreenshotName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setScreenshotBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Client validations
    if (!customerName.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    const cleanMobile = mobile.replace(/[\s-]/g, "");
    if (!/^(?:\+8801|8801|01)[3-9]\d{8}$/.test(cleanMobile)) {
      setErrorMsg("Please enter a valid 11-digit Bangladeshi mobile number (e.g. 017XXXXXXXX).");
      return;
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (!screenshotBase64) {
      setErrorMsg("Please upload your bKash payment screenshot.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          mobile: cleanMobile,
          email: email.trim() || undefined,
          address: address.trim() || undefined,
          date,
          slotId: slot.slotId,
          transactionId: transactionId.trim() || undefined,
          paymentScreenshot: screenshotBase64,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit booking.");
      }

      onSuccess(data.booking);
    } catch (err: any) {
      console.error("Booking error:", err);
      setErrorMsg(
        err.message ||
        "Sorry, this slot has just been booked by another customer. Please choose another slot."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stadium-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-stadium-900 border border-stadium-700/80 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-stadium-850 to-stadium-900 border-b border-stadium-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden ring-1 ring-pitch-500/40 relative">
              <Image
                src="/assets/logo.jpg"
                alt="Logo"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-lg text-white">
                Book Turf Slot
              </h3>
              <p className="text-xs text-pitch-400 font-medium">
                Corex Arena and Academy • Mirpur 12
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-stadium-800 text-stadium-400 hover:text-white hover:bg-stadium-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
          {/* Error Alert */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs sm:text-sm flex items-start gap-3 animate-shake">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Booking Notice</p>
                <p>{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Booking Summary Card */}
          <div className="p-4 rounded-xl bg-stadium-850/80 border border-stadium-700/80 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stadium-700/60">
              <div className="flex items-center gap-2 text-sm text-white font-bold">
                <Calendar className="w-4 h-4 text-pitch-400" />
                <span>{formatDisplayDate(date)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-extrabold text-pitch-400">
                <Clock className="w-4 h-4" />
                <span>{slot.label}</span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-pitch-950 text-pitch-300 border border-pitch-500/30">
                  {slot.slotType}
                </span>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div>
                <span className="text-stadium-400">Regular Fee:</span>
                <p className="font-semibold text-stadium-300 line-through">
                  ৳{regularPrice.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-stadium-400">Discount:</span>
                <p className="font-bold text-pitch-400">-৳{discount.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-stadium-400">Final Fee:</span>
                <p className="font-display font-extrabold text-white text-sm">
                  ৳{finalPrice.toLocaleString()}
                </p>
              </div>
              <div className="bg-pitch-500/10 p-2 rounded-lg border border-pitch-500/30">
                <span className="text-pitch-300 font-bold">bKash Advance:</span>
                <p className="font-display font-black text-pitch-400 text-sm">৳500</p>
              </div>
            </div>
            <p className="text-[11px] text-stadium-400 text-right">
              Remaining Due at Venue: <strong className="text-white">৳{duePayment.toLocaleString()}</strong>
            </p>
          </div>

          {/* Customer Information Inputs */}
          <div className="space-y-4">
            <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-pitch-500/20 text-pitch-400 text-xs flex items-center justify-center font-black">
                1
              </span>
              Customer Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stadium-300 mb-1.5">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-stadium-850 border border-stadium-700 text-stadium-100 placeholder-stadium-500 text-sm focus:outline-none focus:border-pitch-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stadium-300 mb-1.5">
                  Mobile Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="01xxxxxxxxx"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-stadium-850 border border-stadium-700 text-stadium-100 placeholder-stadium-500 text-sm focus:outline-none focus:border-pitch-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stadium-300 mb-1.5">
                  Email Address <span className="text-stadium-500">(Optional)</span>
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-stadium-850 border border-stadium-700 text-stadium-100 placeholder-stadium-500 text-sm focus:outline-none focus:border-pitch-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stadium-300 mb-1.5">
                  Area / Address <span className="text-stadium-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mirpur 12, Dhaka"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-stadium-850 border border-stadium-700 text-stadium-100 placeholder-stadium-500 text-sm focus:outline-none focus:border-pitch-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* bKash Payment Box */}
          <div className="space-y-4">
            <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-400 text-xs flex items-center justify-center font-black">
                2
              </span>
              bKash Advance Payment (৳500 Required)
            </h4>

            <div className="p-4 rounded-xl bg-gradient-to-br from-pink-950/30 to-stadium-850 border border-pink-500/30 space-y-4">
              {/* Instructions banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-pink-500/20">
                <div>
                  <p className="text-xs font-bold text-pink-300 uppercase tracking-wide">
                    bKash Personal / Send Money Number
                  </p>
                  <p className="font-display font-mono font-black text-xl text-white mt-0.5">
                    {bkashNumber}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyBkash}
                  className="px-3.5 py-2 rounded-lg bg-pink-600/30 hover:bg-pink-600/40 text-pink-200 text-xs font-bold border border-pink-500/40 flex items-center gap-1.5 transition-all shadow-sm"
                >
                  {copiedNumber ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Number</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-2 text-xs text-stadium-300">
                <p className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-stadium-800 text-pink-400 font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span>
                    Please send <strong>৳500</strong> via bKash to{" "}
                    <strong className="text-pink-300">{bkashNumber}</strong>.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-stadium-800 text-pink-400 font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span>Take a screenshot of the completed bKash payment.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-stadium-800 text-pink-400 font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <span>Upload the screenshot below and enter Transaction ID (optional).</span>
                </p>
              </div>

              {/* Transaction ID & Screenshot Uploader */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-stadium-300 mb-1.5">
                    bKash Transaction ID (TrxID)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BL92KJ19X"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-stadium-900 border border-stadium-700 text-stadium-100 placeholder-stadium-500 font-mono text-sm focus:outline-none focus:border-pink-500 transition-colors uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stadium-300 mb-1.5">
                    Payment Screenshot <span className="text-red-400">*</span>
                  </label>

                  <div className="relative">
                    <input
                      type="file"
                      id="payment-screenshot-upload"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="payment-screenshot-upload"
                      className={`w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg border text-xs font-bold cursor-pointer transition-all ${screenshotBase64
                        ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
                        : "bg-stadium-900 hover:bg-stadium-850 border-stadium-700 text-stadium-300 hover:text-white"
                        }`}
                    >
                      {screenshotBase64 ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="truncate">{screenshotName || "Screenshot Attached"}</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-pink-400 shrink-0" />
                          <span>Upload Screenshot (JPG/PNG)</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {/* Screenshot Preview */}
              {screenshotBase64 && (
                <div className="relative mt-2 p-2 rounded-lg bg-stadium-950 border border-stadium-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileImage className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-stadium-300 truncate max-w-[200px] sm:max-w-xs">
                      {screenshotName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setScreenshotBase64("");
                      setScreenshotName("");
                    }}
                    className="text-xs text-red-400 hover:text-red-300 font-semibold"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submission Notice & Submit Button */}
          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-lg bg-stadium-850 border border-stadium-800 text-[11px] text-stadium-400 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
              <span>
                Your booking will be placed in <strong>PENDING</strong> status and temporarily hold the slot. Our admin will verify your bKash payment and confirm your slot.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl text-base font-extrabold text-stadium-950 bg-pitch-500 hover:bg-pitch-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow transition-all flex items-center justify-center gap-2"
              id="btn-submit-booking-modal"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing Your Booking...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Confirm & Submit Booking Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
