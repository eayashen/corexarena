"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/user/Navbar";
import { Hero } from "@/components/user/Hero";
import { SchedulePicker, SlotAvailability } from "@/components/user/SchedulePicker";
import { FeaturesAndPricing } from "@/components/user/FeaturesAndPricing";
import { LocationAndContact } from "@/components/user/LocationAndContact";
import { Footer } from "@/components/user/Footer";
import { BookingModal } from "@/components/user/BookingModal";
import { BookingSuccessModal } from "@/components/user/BookingSuccessModal";
import { ManageBookingModal } from "@/components/user/ManageBookingModal";
import { SchedulePosterModal } from "@/components/user/SchedulePosterModal";
import { MessageCircle, Calendar, Sparkles } from "lucide-react";

export default function HomePage() {
  // Modal states
  const [selectedSlotForBooking, setSelectedSlotForBooking] = useState<{
    slot: SlotAvailability;
    date: string;
  } | null>(null);

  const [lastSubmittedBooking, setLastSubmittedBooking] = useState<any | null>(null);
  const [showManageBookingModal, setShowManageBookingModal] = useState<boolean>(false);
  const [showSchedulePosterModal, setShowSchedulePosterModal] = useState<boolean>(false);

  const scrollToSchedule = () => {
    const el = document.getElementById("schedule");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSelectSlot = (slot: SlotAvailability, date: string) => {
    setSelectedSlotForBooking({ slot, date });
  };

  const handleBookingSuccess = (booking: any) => {
    setSelectedSlotForBooking(null);
    setLastSubmittedBooking(booking);
  };

  return (
    <div className="flex flex-col min-h-screen bg-stadium-950">
      {/* Top Navbar */}
      <Navbar
        onOpenManageBookings={() => setShowManageBookingModal(true)}
        onScrollToBooking={scrollToSchedule}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          onBookClick={scrollToSchedule}
          onOpenSchedulePoster={() => setShowSchedulePosterModal(true)}
        />

        {/* Live Slot Schedule & Availability */}
        <SchedulePicker onSelectSlot={handleSelectSlot} />

        {/* Pricing, Discounts & Facilities */}
        <FeaturesAndPricing onBookNow={scrollToSchedule} />

        {/* Location, Google Map & Contact */}
        <LocationAndContact />
      </main>

      {/* Footer */}
      <Footer
        onOpenManageBookings={() => setShowManageBookingModal(true)}
        onScrollToBooking={scrollToSchedule}
      />

      {/* Modals */}
      {/* 1. Booking Checkout Form Modal */}
      {selectedSlotForBooking && (
        <BookingModal
          slot={selectedSlotForBooking.slot}
          date={selectedSlotForBooking.date}
          onClose={() => setSelectedSlotForBooking(null)}
          onSuccess={handleBookingSuccess}
        />
      )}

      {/* 2. Booking Success Confirmation Modal */}
      {lastSubmittedBooking && (
        <BookingSuccessModal
          booking={lastSubmittedBooking}
          onClose={() => setLastSubmittedBooking(null)}
          onOpenManage={() => {
            setLastSubmittedBooking(null);
            setShowManageBookingModal(true);
          }}
          onBookAnother={() => {
            setLastSubmittedBooking(null);
            scrollToSchedule();
          }}
        />
      )}

      {/* 3. Manage My Booking Modal */}
      {showManageBookingModal && (
        <ManageBookingModal onClose={() => setShowManageBookingModal(false)} />
      )}

      {/* 4. Schedule Poster Lightbox Modal */}
      {showSchedulePosterModal && (
        <SchedulePosterModal onClose={() => setShowSchedulePosterModal(false)} />
      )}

      {/* Floating WhatsApp Quick Button */}
      <a
        href="https://wa.me/8801701275099?text=Hello%20Corex%20Arena,%20I%20have%20an%20inquiry%20regarding%20turf%20booking."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-stadium-950 font-bold shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center ring-4 ring-emerald-500/20"
        title="Chat on WhatsApp"
        id="btn-floating-whatsapp"
      >
        <MessageCircle className="w-6 h-6 fill-current" />
      </a>
    </div>
  );
}
