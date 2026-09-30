"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Phone, MessageCircle, Calendar, Search, Menu, X, Shield } from "lucide-react";

interface NavbarProps {
  onOpenManageBookings: () => void;
  onScrollToBooking: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenManageBookings,
  onScrollToBooking,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass-card border-b border-stadium-800/80 bg-stadium-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden ring-2 ring-pitch-500/40 group-hover:ring-pitch-400 transition-all shadow-glow">
              <Image
                src="/assets/logo.jpg"
                alt="Corex Arena and Academy Logo"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-xl sm:text-2xl tracking-wider text-white">
                  COREX<span className="text-pitch-400">ARENA</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-pitch-500/20 text-pitch-300 rounded border border-pitch-500/30">
                  & ACADEMY
                </span>
              </div>
              <p className="text-xs text-stadium-400 font-medium hidden sm:block">
                Shagufta Playground, Mirpur 12, Dhaka
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
            <a
              href="#schedule"
              className="text-stadium-300 hover:text-pitch-400 transition-colors"
            >
              Live Schedule
            </a>
            <a
              href="#pricing"
              className="text-stadium-300 hover:text-pitch-400 transition-colors"
            >
              Pricing
            </a>
            <a
              href="#facilities"
              className="text-stadium-300 hover:text-pitch-400 transition-colors"
            >
              Facilities
            </a>
            <a
              href="#location"
              className="text-stadium-300 hover:text-pitch-400 transition-colors"
            >
              Location & Map
            </a>
          </nav>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={onOpenManageBookings}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-stadium-200 bg-stadium-850 hover:bg-stadium-800 border border-stadium-700/60 hover:border-pitch-500/40 transition-all shadow-sm"
              id="btn-manage-booking-nav"
            >
              <Search className="w-3.5 h-3.5 text-pitch-400" />
              Manage My Booking
            </button>

            <a
              href="https://wa.me/8801701275099"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-700/40 hover:bg-emerald-600/50 border border-emerald-500/30 transition-all"
              title="Chat on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              WhatsApp
            </a>

            <button
              onClick={onScrollToBooking}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-stadium-950 bg-pitch-500 hover:bg-pitch-400 transition-all shadow-glow hover:scale-[1.02] active:scale-[0.98]"
              id="btn-book-now-nav"
            >
              <Calendar className="w-4 h-4" />
              Book Now
            </button>
          </div>

          {/* Mobile Hamburger */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={onOpenManageBookings}
              className="p-2 rounded-lg bg-stadium-850 border border-stadium-700/60 text-pitch-400 text-xs font-semibold flex items-center gap-1"
              id="btn-manage-booking-mobile-top"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-stadium-850 border border-stadium-700 text-stadium-200 hover:text-white"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stadium-800 bg-stadium-900/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-2 text-sm font-medium">
            <a
              href="#schedule"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-stadium-800 text-stadium-200"
            >
              ⚽ Live Schedule & Slots
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-stadium-800 text-stadium-200"
            >
              🏷️ Pricing & Discounts
            </a>
            <a
              href="#facilities"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-stadium-800 text-stadium-200"
            >
              🏟️ Facilities & Academy
            </a>
            <a
              href="#location"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-stadium-800 text-stadium-200"
            >
              📍 Location & Directions
            </a>
          </nav>

          <div className="pt-2 border-t border-stadium-800 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenManageBookings();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-stadium-800 text-stadium-100 font-semibold text-sm border border-stadium-700"
            >
              <Search className="w-4 h-4 text-pitch-400" />
              Manage My Booking
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onScrollToBooking();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-pitch-500 hover:bg-pitch-400 text-stadium-950 font-bold text-sm shadow-glow"
            >
              <Calendar className="w-4 h-4" />
              Book Slot Now
            </button>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href="tel:01701275099"
                className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-stadium-850 text-stadium-300 text-xs font-semibold border border-stadium-800"
              >
                <Phone className="w-3.5 h-3.5 text-pitch-400" />
                01701-275099
              </a>
              <a
                href="https://wa.me/8801701275099"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-900/40 text-emerald-300 text-xs font-semibold border border-emerald-700/50"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                WhatsApp
              </a>
            </div>

            <Link
              href="/admin/login"
              className="flex items-center justify-center gap-1 text-[11px] text-stadium-500 hover:text-stadium-400 pt-2"
            >
              <Shield className="w-3 h-3" /> Admin Portal Access
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
