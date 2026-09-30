"use client";

import React from "react";
import Image from "next/image";
import {
  Calendar,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
  Zap,
  Flame,
  FileImage,
  ArrowRight,
} from "lucide-react";

interface HeroProps {
  onBookClick: () => void;
  onOpenSchedulePoster: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onBookClick,
  onOpenSchedulePoster,
}) => {
  return (
    <div className="relative overflow-hidden bg-stadium-950 pt-6 pb-16 md:py-20 border-b border-stadium-800">
      {/* Background Image with Dark Vignette & Gradient Overlays */}
      <div className="absolute inset-0 z-0 opacity-25 mix-blend-luminosity">
        <Image
          src="/assets/cover.jpg"
          alt="Corex Arena Turf Stadium"
          fill
          priority
          className="object-cover object-center scale-105 filter blur-[1px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stadium-950 via-stadium-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-stadium-950 via-stadium-950/60 to-stadium-950/90" />
      </div>

      {/* Decorative Radial Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-pitch-500/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-gold-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Core Branding & Call to Action */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pitch-950/80 border border-pitch-500/40 text-pitch-300 text-xs font-semibold shadow-glow animate-pulse-subtle">
              <span className="w-1.5 h-1.5 rounded-full bg-pitch-400" />
              <span>Dhaka&apos;s Premier Football Turf & Academy</span>
              <span className="w-1.5 h-1.5 rounded-full bg-pitch-400" />
              <span className="text-gold-400 font-bold">৳500 Flat Discount</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
              Elevate Your Game at{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pitch-400 via-pitch-300 to-emerald-200">
                Corex Arena
              </span>
            </h1>

            {/* Short Introduction */}
            <p className="text-stadium-300 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Experience FIFA-standard artificial turf, professional stadium floodlights,
              and dedicated training academy sessions in the heart of Mirpur. Book your match slot in seconds with bKash advance.
            </p>

            {/* Location Pill */}
            <div className="flex items-center justify-center lg:justify-start gap-2 text-xs sm:text-sm text-stadium-400 font-medium">
              <MapPin className="w-4 h-4 text-pitch-400 shrink-0" />
              <span>Plot no 217, Block B, Rd No. 4, Shagufta, Mirpur 12, Dhaka</span>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onBookClick}
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-extrabold text-stadium-950 bg-gradient-to-r from-pitch-400 via-pitch-500 to-pitch-400 hover:from-pitch-300 hover:to-pitch-400 shadow-glow transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 group"
                id="hero-btn-book-now"
              >
                <Calendar className="w-5 h-5 text-stadium-950 group-hover:rotate-6 transition-transform" />
                <span>Book Slot Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onOpenSchedulePoster}
                className="w-full sm:w-auto px-6 py-4 rounded-xl text-sm font-bold text-stadium-200 glass-card hover:bg-stadium-850 hover:text-white border border-stadium-700/80 hover:border-pitch-500/40 transition-all flex items-center justify-center gap-2.5"
                id="hero-btn-view-poster"
              >
                <FileImage className="w-4 h-4 text-gold-400" />
                <span>View Official Schedule Poster</span>
              </button>
            </div>

            {/* Key Feature Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-stadium-800/80">
              <div className="flex items-center gap-2 text-left">
                <div className="w-8 h-8 rounded-lg bg-pitch-500/10 border border-pitch-500/20 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-pitch-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Pro Turf</p>
                  <p className="text-[10px] text-stadium-400">High Traction</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-left">
                <div className="w-8 h-8 rounded-lg bg-pitch-500/10 border border-pitch-500/20 flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4 text-gold-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Floodlights</p>
                  <p className="text-[10px] text-stadium-400">HD Match View</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-left">
                <div className="w-8 h-8 rounded-lg bg-pitch-500/10 border border-pitch-500/20 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-pitch-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">6 AM – 2 AM</p>
                  <p className="text-[10px] text-stadium-400">13 Daily Slots</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-left">
                <div className="w-8 h-8 rounded-lg bg-pitch-500/10 border border-pitch-500/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">bKash Verified</p>
                  <p className="text-[10px] text-stadium-400">Instant Advance</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Pricing Feature Cards */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative glass-card rounded-2xl p-5 sm:p-6 border border-stadium-700/80 shadow-2xl bg-stadium-900/90">
              <div className="flex items-center justify-between pb-4 border-b border-stadium-800">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-pitch-400 animate-ping" />
                  <h3 className="font-display font-extrabold text-base text-white">
                    Special Slot Pricing
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-gold-400 uppercase tracking-wider bg-gold-500/10 px-2.5 py-1 rounded-full border border-gold-500/20">
                  Limited Offer
                </span>
              </div>

              <div className="space-y-3 pt-4">
                {/* Day Slot Pricing Card */}
                <div className="p-4 rounded-xl bg-stadium-850 border border-stadium-700 hover:border-pitch-500/40 transition-all flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">DAY SLOTS</span>
                      <span className="text-[10px] font-semibold text-pitch-300 bg-pitch-950 px-2 py-0.5 rounded border border-pitch-500/30">
                        7 Slots (6AM – 4:30PM)
                      </span>
                    </div>
                    <p className="text-xs text-stadium-400 pt-1">
                      Regular: <span className="line-through text-stadium-500">৳2,500</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-black text-2xl text-pitch-400">৳2,000</p>
                    <p className="text-[10px] text-stadium-400">Per 1.5 Hr Slot</p>
                  </div>
                </div>

                {/* Night Slot Pricing Card */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-stadium-850 to-stadium-800 border border-stadium-700 hover:border-gold-500/40 transition-all flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">NIGHT SLOTS</span>
                      <span className="text-[10px] font-semibold text-gold-300 bg-gold-950 px-2 py-0.5 rounded border border-gold-500/30">
                        6 Slots (5PM – 2AM)
                      </span>
                    </div>
                    <p className="text-xs text-stadium-400 pt-1">
                      Regular: <span className="line-through text-stadium-500">৳4,500</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-black text-2xl text-gold-400">৳4,000</p>
                    <p className="text-[10px] text-stadium-400">Floodlights On</p>
                  </div>
                </div>
              </div>

              {/* Advance Payment Notice */}
              <div className="mt-4 p-3 rounded-lg bg-pitch-950/60 border border-pitch-500/30 flex items-center justify-between text-xs">
                <span className="text-stadium-300 font-medium">Required Booking Advance:</span>
                <span className="font-extrabold text-pitch-300 bg-pitch-500/20 px-2.5 py-1 rounded">
                  ৳500 via bKash
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
