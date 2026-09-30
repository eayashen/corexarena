"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import {
  CheckCircle2,
  Clock,
  Calendar,
  Phone,
  MessageCircle,
  Copy,
  Check,
  Search,
  PlusCircle,
  AlertCircle,
} from "lucide-react";
import { formatDisplayDate, format12Hour } from "@/lib/utils/date";

interface BookingSuccessModalProps {
  booking: any;
  onClose: () => void;
  onOpenManage: () => void;
  onBookAnother: () => void;
}

export const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({
  booking,
  onClose,
  onOpenManage,
  onBookAnother,
}) => {
  const [copiedId, setCopiedId] = React.useState(false);

  useEffect(() => {
    // Trigger confetti celebration on mount
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10b958", "#34d399", "#f59e0b", "#38bdf8"],
      });
    } catch {
      // ignore
    }
  }, []);

  if (!booking) return null;

  const handleCopyId = () => {
    if (booking?.bookingId) {
      navigator.clipboard.writeText(booking.bookingId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const dueAmount = booking.dueAmount ?? (booking.finalPrice - (booking.paymentAmount || 500));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stadium-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-stadium-900 border border-stadium-700 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Top Celebration Banner */}
        <div className="p-6 bg-gradient-to-b from-pitch-950/80 via-stadium-900 to-stadium-900 text-center space-y-3 border-b border-stadium-800">
          <div className="w-16 h-16 rounded-full bg-pitch-500/20 border-2 border-pitch-400 text-pitch-400 flex items-center justify-center mx-auto shadow-glow">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h3 className="font-display font-black text-2xl text-white">
            Booking Request Submitted!
          </h3>

          <p className="text-xs sm:text-sm text-stadium-300 max-w-sm mx-auto">
            Your booking request has been submitted successfully and is currently under verification.
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="p-6 space-y-5">
          {/* Booking ID with Copy */}
          <div className="p-3.5 rounded-xl bg-stadium-850 border border-stadium-700 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold text-stadium-400 tracking-wider">
                Your Booking ID
              </p>
              <p className="font-mono font-extrabold text-base sm:text-lg text-pitch-400">
                {booking.bookingId}
              </p>
            </div>
            <button
              onClick={handleCopyId}
              className="p-2 rounded-lg bg-stadium-800 hover:bg-stadium-750 text-stadium-300 hover:text-white transition-colors"
              title="Copy Booking ID"
            >
              {copiedId ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Details Table */}
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1.5 border-b border-stadium-800 text-stadium-300">
              <span className="text-stadium-400">Customer Name:</span>
              <strong className="text-white">{booking.customerName}</strong>
            </div>

            <div className="flex justify-between py-1.5 border-b border-stadium-800 text-stadium-300">
              <span className="text-stadium-400">Match Date:</span>
              <strong className="text-white">{formatDisplayDate(booking.date)}</strong>
            </div>

            <div className="flex justify-between py-1.5 border-b border-stadium-800 text-stadium-300">
              <span className="text-stadium-400">Time Slot:</span>
              <strong className="text-pitch-300">
                {booking.label || `${format12Hour(booking.startTime)} – ${format12Hour(booking.endTime)}`}
              </strong>
            </div>

            <div className="flex justify-between py-1.5 border-b border-stadium-800 text-stadium-300">
              <span className="text-stadium-400">Booking Status:</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                PENDING (Verification in progress)
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-stadium-800 text-stadium-300">
              <span className="text-stadium-400">Total Slot Fee:</span>
              <strong className="text-white">৳{booking.finalPrice?.toLocaleString()}</strong>
            </div>

            <div className="flex justify-between py-1.5 border-b border-stadium-800 text-stadium-300">
              <span className="text-stadium-400">bKash Advance Paid:</span>
              <strong className="text-emerald-400">৳{booking.paymentAmount?.toLocaleString() || "500"}</strong>
            </div>

            <div className="flex justify-between py-1.5 text-stadium-300">
              <span className="text-stadium-400">Due at Venue:</span>
              <strong className="text-white font-extrabold text-sm">৳{dueAmount.toLocaleString()}</strong>
            </div>
          </div>

          {/* Admin Verification Notice */}
          <div className="p-3.5 rounded-xl bg-stadium-850/90 border border-yellow-500/30 text-xs text-stadium-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
            <p>
              <strong>Notice:</strong> Your booking will be confirmed after admin verification of your payment. You can check the status anytime using your mobile number & email in <strong>&ldquo;Manage My Booking&rdquo;</strong>.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => {
                onClose();
                onOpenManage();
              }}
              className="w-full py-3 rounded-xl bg-stadium-800 hover:bg-stadium-750 text-white font-bold text-xs sm:text-sm border border-stadium-700 flex items-center justify-center gap-2 transition-colors"
            >
              <Search className="w-4 h-4 text-pitch-400" />
              Manage / Check My Booking
            </button>

            <a
              href={`https://wa.me/8801701275099?text=Hello%20Corex%20Arena,%20I%20have%20submitted%20a%20booking%20with%20ID%20${booking.bookingId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-xl bg-emerald-700/40 hover:bg-emerald-600/50 text-emerald-200 font-bold text-xs sm:text-sm border border-emerald-500/30 flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              Notify Admin on WhatsApp
            </a>

            <button
              onClick={() => {
                onClose();
                onBookAnother();
              }}
              className="w-full py-3 rounded-xl bg-pitch-500 hover:bg-pitch-400 text-stadium-950 font-extrabold text-xs sm:text-sm shadow-glow flex items-center justify-center gap-2 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Book Another Slot
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
