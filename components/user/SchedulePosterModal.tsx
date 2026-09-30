"use client";

import React from "react";
import Image from "next/image";
import { X, Download, FileImage } from "lucide-react";

interface SchedulePosterModalProps {
  onClose: () => void;
}

export const SchedulePosterModal: React.FC<SchedulePosterModalProps> = ({
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stadium-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-stadium-900 border border-stadium-700 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-stadium-850 to-stadium-900 border-b border-stadium-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileImage className="w-5 h-5 text-gold-400" />
            <h3 className="font-display font-extrabold text-base sm:text-lg text-white">
              Official Schedule Poster
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/assets/shedule.jpg"
              download="Corex-Arena-Schedule.jpg"
              className="p-2 rounded-lg bg-stadium-800 hover:bg-stadium-700 text-stadium-300 hover:text-white transition-colors"
              title="Download Schedule"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-stadium-800 hover:bg-stadium-700 text-stadium-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Poster Image Content */}
        <div className="p-4 sm:p-6 flex items-center justify-center bg-stadium-950">
          <div className="relative w-full max-w-2xl aspect-[4/5] rounded-xl overflow-hidden shadow-2xl border border-stadium-800">
            <Image
              src="/assets/shedule.jpg"
              alt="Corex Arena Official Schedule"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
};
