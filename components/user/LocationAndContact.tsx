"use client";

import React from "react";
import {
  MapPin,
  Navigation,
  Phone,
  MessageCircle,
  Mail,
  Facebook,
  ExternalLink,
  Clock,
  Compass,
} from "lucide-react";

export const LocationAndContact: React.FC = () => {
  const latitude = 23.83148397838252;
  const longitude = 90.37969133511696;
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  const googleMapsEmbedUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&hl=en&z=16&output=embed`;

  return (
    <section id="location" className="py-16 bg-stadium-950 border-b border-stadium-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-pitch-500/10 border border-pitch-500/30 text-pitch-400 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            Find Us Easily
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Location & Contact Details
          </h2>
          <p className="text-stadium-300 text-sm sm:text-base">
            Located conveniently in Shagufta Housing, Mirpur 12, Dhaka. Easy access from Mirpur DOHS, Uttara & Pallabi.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Contact Cards & Directions */}
          <div className="lg:col-span-5 space-y-4">
            {/* Address Box */}
            <div className="p-6 rounded-2xl glass-card border border-stadium-800 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-pitch-500/10 border border-pitch-500/30 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-pitch-400" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-lg text-white">
                    Turf Address
                  </h3>
                  <p className="text-xs sm:text-sm text-stadium-300 mt-1 leading-relaxed">
                    Plot no 217, Block no B, Rd No. 4, Shagufta, Mirpur 12, Dhaka, Bangladesh, 1216
                  </p>
                  <p className="text-[11px] font-mono text-stadium-500 mt-2">
                    Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                  </p>
                </div>
              </div>

              {/* Get Directions Button */}
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-xl bg-pitch-500 hover:bg-pitch-400 text-stadium-950 font-extrabold text-sm shadow-glow flex items-center justify-center gap-2.5 transition-all"
                id="btn-get-directions"
              >
                <Navigation className="w-4 h-4" />
                <span>Get Directions (Google Maps)</span>
                <ExternalLink className="w-4 h-4 opacity-75" />
              </a>
            </div>

            {/* Quick Contact Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Phone / Call */}
              <a
                href="tel:01701275099"
                className="p-4 rounded-xl glass-card border border-stadium-800 hover:border-pitch-500/40 transition-all flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-lg bg-stadium-850 group-hover:bg-pitch-500/20 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-pitch-400" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-stadium-400">Call Us</p>
                  <p className="text-xs font-bold text-white group-hover:text-pitch-300">01701-275099</p>
                </div>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/8801701275099"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl glass-card border border-stadium-800 hover:border-emerald-500/40 transition-all flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-lg bg-stadium-850 group-hover:bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-stadium-400">WhatsApp</p>
                  <p className="text-xs font-bold text-white group-hover:text-emerald-300">01701-275099</p>
                </div>
              </a>

              {/* Email */}
              <a
                href="mailto:corexarena.academy@gmail.com"
                className="p-4 rounded-xl glass-card border border-stadium-800 hover:border-blue-500/40 transition-all flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-lg bg-stadium-850 group-hover:bg-blue-500/20 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-stadium-400">Email Us</p>
                  <p className="text-xs font-bold text-white group-hover:text-blue-300 truncate max-w-[120px]">
                    corexarena.academy
                  </p>
                </div>
              </a>

              {/* Facebook Page */}
              <a
                href="https://www.facebook.com/profile.php?id=61591476123056"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl glass-card border border-stadium-800 hover:border-indigo-500/40 transition-all flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-lg bg-stadium-850 group-hover:bg-indigo-500/20 flex items-center justify-center shrink-0">
                  <Facebook className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-stadium-400">Facebook</p>
                  <p className="text-xs font-bold text-white group-hover:text-indigo-300">Official Page</p>
                </div>
              </a>
            </div>

            {/* Operating Hours Box */}
            <div className="p-4 rounded-xl bg-stadium-900 border border-stadium-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-stadium-300">
                <Clock className="w-4 h-4 text-pitch-400" />
                <span>Operating Hours:</span>
              </div>
              <span className="font-bold text-white">Daily 6:00 AM – 2:00 AM</span>
            </div>
          </div>

          {/* Right Column: Google Maps Interactive Embed */}
          <div className="lg:col-span-7">
            <div className="relative w-full h-[380px] sm:h-[450px] rounded-2xl overflow-hidden border border-stadium-700 shadow-2xl bg-stadium-900">
              <iframe
                title="Corex Arena Google Map"
                src={googleMapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="filter invert-[90%] hue-rotate-180 contrast-125 opacity-90 hover:opacity-100 transition-opacity"
              />

              <div className="absolute top-4 left-4 glass-card px-3.5 py-2 rounded-xl border border-stadium-700/80 shadow-lg flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-pitch-400 animate-ping" />
                <span className="text-xs font-bold text-white">Corex Arena & Academy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
