"use client";

import React from "react";
import {
  Sun,
  Moon,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Award,
  Users,
  Sparkles,
  PhoneCall,
} from "lucide-react";

interface FeaturesAndPricingProps {
  onBookNow: () => void;
}

export const FeaturesAndPricing: React.FC<FeaturesAndPricingProps> = ({
  onBookNow,
}) => {
  return (
    <section id="pricing" className="py-16 bg-stadium-900/60 border-b border-stadium-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Pricing Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-bold uppercase tracking-wider">
            Transparent Pricing
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Day & Night Match Pricing
          </h2>
          <p className="text-stadium-300 text-sm sm:text-base">
            Enjoy premium football turf facilities in Mirpur with flat promotional discounts on all slots.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Day Slot Pricing */}
          <div className="relative rounded-2xl glass-card p-6 sm:p-8 border border-stadium-700/80 shadow-xl flex flex-col justify-between group hover:border-pitch-500/40 transition-all">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Sun className="w-6 h-6 text-amber-400" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-pitch-500/20 text-pitch-300 border border-pitch-500/30">
                  ৳500 OFF
                </span>
              </div>

              <div>
                <h3 className="font-display font-extrabold text-2xl text-white">
                  DAY MATCH SLOTS
                </h3>
                <p className="text-xs text-stadium-400 mt-1">
                  6:00 AM – 4:30 PM (7 Available Slots)
                </p>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-sm font-semibold text-stadium-500 line-through">
                  ৳2,500
                </span>
                <span className="font-display font-black text-4xl text-pitch-400">
                  ৳2,000
                </span>
                <span className="text-xs text-stadium-400">/ 90-min session</span>
              </div>

              <ul className="space-y-2.5 text-xs sm:text-sm text-stadium-200">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-pitch-400 shrink-0" />
                  <span>FIFA Standard Artificial Grass Turf</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-pitch-400 shrink-0" />
                  <span>6 vs 6 Match Pitch</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-pitch-400 shrink-0" />
                  <span>Only ৳500 bKash Advance to Lock</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-pitch-400 shrink-0" />
                  <span>Changing Rooms & Clean Restrooms</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-pitch-400 shrink-0" />
                  <span>Free Secure Bike & Car Parking</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onBookNow}
              className="mt-8 w-full py-3.5 rounded-xl bg-stadium-850 hover:bg-pitch-500 text-stadium-100 hover:text-stadium-950 font-bold text-sm border border-stadium-700 hover:border-pitch-400 transition-all shadow-sm"
            >
              Book Day Slot
            </button>
          </div>

          {/* Night Slot Pricing */}
          <div className="relative rounded-2xl glass-card p-6 sm:p-8 border border-gold-500/40 shadow-2xl flex flex-col justify-between bg-gradient-to-b from-stadium-900 to-stadium-950 group">
            <div className="absolute -top-3.5 right-6">
              <span className="px-3.5 py-1 rounded-full text-xs font-black bg-gold-500 text-stadium-950 uppercase tracking-wider shadow-glow-gold">
                Popular Prime Slots
              </span>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <Moon className="w-6 h-6 text-indigo-400" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gold-500/20 text-gold-300 border border-gold-500/30">
                  ৳500 OFF
                </span>
              </div>

              <div>
                <h3 className="font-display font-extrabold text-2xl text-white">
                  NIGHT FLOODLIGHT SLOTS
                </h3>
                <p className="text-xs text-stadium-400 mt-1">
                  5:00 PM – 2:00 AM (6 Prime Match Slots)
                </p>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-sm font-semibold text-stadium-500 line-through">
                  ৳4,500
                </span>
                <span className="font-display font-black text-4xl text-gold-400">
                  ৳4,000
                </span>
                <span className="text-xs text-stadium-400">/ 90-min session</span>
              </div>

              <ul className="space-y-2.5 text-xs sm:text-sm text-stadium-200">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>High-Lumen HD Stadium Floodlights</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>High-Traction All-Weather Synthetic Grass</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>Only ৳500 bKash Advance to Lock</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>Dugouts, Seating & Match Refreshments</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>Midnight Slots Available until 2:00 AM</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onBookNow}
              className="mt-8 w-full py-3.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-stadium-950 font-black text-sm shadow-glow-gold transition-all"
            >
              Book Night Slot
            </button>
          </div>
        </div>

        {/* Facilities Section */}
        <div id="facilities" className="pt-10 border-t border-stadium-800 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="font-display font-extrabold text-2xl text-white">
              Why Play at Corex Arena?
            </h3>
            <p className="text-xs sm:text-sm text-stadium-400">
              Top-tier sports infrastructure designed for passionate footballers and training academies.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl glass-card border border-stadium-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-pitch-500/10 border border-pitch-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-pitch-400" />
              </div>
              <h4 className="font-bold text-white text-base">FIFA Quality Grass</h4>
              <p className="text-xs text-stadium-400 leading-relaxed">
                Shock-absorbent infill artificial turf reducing injury risk with optimal ball bounce and roll.
              </p>
            </div>

            <div className="p-5 rounded-2xl glass-card border border-stadium-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-gold-400" />
              </div>
              <h4 className="font-bold text-white text-base">Corex Football Academy</h4>
              <p className="text-xs text-stadium-400 leading-relaxed">
                Professional football training programs for kids, teens, and adults led by certified coaching staff.
              </p>
            </div>

            <div className="p-5 rounded-2xl glass-card border border-stadium-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <h4 className="font-bold text-white text-base">Free Parking</h4>
              <p className="text-xs text-stadium-400 leading-relaxed">
                24/7 security surveillance and dedicated parking space for vehicles and motorcycles.
              </p>
            </div>

            <div className="p-5 rounded-2xl glass-card border border-stadium-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-indigo-400" />
              </div>
              <h4 className="font-bold text-white text-base">Corporate Tournaments</h4>
              <p className="text-xs text-stadium-400 leading-relaxed">
                Special arrangements for corporate tournaments, weekend leagues, and friendly cups.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
