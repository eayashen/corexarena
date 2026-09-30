"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  Facebook,
  Shield,
  Heart,
  ExternalLink,
} from "lucide-react";

interface FooterProps {
  onOpenManageBookings: () => void;
  onScrollToBooking: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenManageBookings,
  onScrollToBooking,
}) => {
  return (
    <footer className="bg-stadium-950 border-t border-stadium-800 text-stadium-300 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1 & 2: Brand & About */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden ring-1 ring-pitch-500/40 relative">
                <Image
                  src="/assets/logo.jpg"
                  alt="Corex Arena Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <span className="font-display font-black text-xl text-white tracking-wider">
                  COREX<span className="text-pitch-400">ARENA</span>
                </span>
                <p className="text-[11px] text-pitch-400 font-bold uppercase tracking-widest">
                  & Football Academy
                </p>
              </div>
            </div>

            <p className="text-stadium-400 text-xs max-w-sm leading-relaxed">
              Corex Arena and Academy is Dhaka&apos;s premier football destination in Mirpur 12.
              Providing world-class FIFA-standard artificial grass, professional floodlights, and youth training programs.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.facebook.com/profile.php?id=61591476123056"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-stadium-850 hover:bg-pitch-500 hover:text-stadium-950 border border-stadium-700 flex items-center justify-center transition-colors"
                title="Facebook Page"
              >
                <Facebook className="w-4 h-4" />
              </a>

              <a
                href="https://wa.me/8801701275099"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-stadium-850 hover:bg-emerald-500 hover:text-stadium-950 border border-stadium-700 flex items-center justify-center transition-colors"
                title="WhatsApp Direct"
              >
                <MessageCircle className="w-4 h-4" />
              </a>

              <a
                href="mailto:corexarena.academy@gmail.com"
                className="w-8 h-8 rounded-lg bg-stadium-850 hover:bg-blue-500 hover:text-stadium-950 border border-stadium-700 flex items-center justify-center transition-colors"
                title="Email Us"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 3: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={onScrollToBooking}
                  className="hover:text-pitch-400 transition-colors"
                >
                  Book a Match Slot
                </button>
              </li>
              <li>
                <a href="#schedule" className="hover:text-pitch-400 transition-colors">
                  Live Slot Schedule
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-pitch-400 transition-colors">
                  Day & Night Rates
                </a>
              </li>
              <li>
                <a href="#facilities" className="hover:text-pitch-400 transition-colors">
                  Turf Facilities
                </a>
              </li>
              <li>
                <a href="#location" className="hover:text-pitch-400 transition-colors">
                  Google Map Location
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Booking & Policy */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">
              Booking Services
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={onOpenManageBookings}
                  className="text-pitch-400 hover:text-pitch-300 font-semibold transition-colors flex items-center gap-1.5"
                >
                  <span>Manage My Booking</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </li>
              <li>
                <span className="text-stadium-400">bKash Advance: ৳500 / slot</span>
              </li>
              <li>
                <span className="text-stadium-400">Reschedule Rule: 72 Hours Before</span>
              </li>
              <li>
                <span className="text-stadium-400">Slots: 6:00 AM – 2:00 AM Daily</span>
              </li>
            </ul>
          </div>

          {/* Col 5: Contact Info */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">
              Turf Contact
            </h4>
            <div className="space-y-2 text-stadium-400">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-pitch-400 shrink-0 mt-0.5" />
                <span>Shagufta, Mirpur 12, Dhaka-1216</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-pitch-400 shrink-0" />
                <a href="tel:01701275099" className="hover:text-white">
                  01701-275099
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-pitch-400 shrink-0" />
                <a href="mailto:corexarena.academy@gmail.com" className="hover:text-white truncate">
                  corexarena.academy
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-stadium-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-stadium-500 text-[11px]">
          <p>© {new Date().getFullYear()} Corex Arena and Academy. All rights reserved.</p>

          <div className="flex items-center gap-4">
            <Link
              href="/admin/login"
              className="flex items-center gap-1 text-stadium-400 hover:text-pitch-400 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Portal Login</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
