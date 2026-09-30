"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Shield, Eye, Lock, Mail, ArrowRight, Loader2, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid login credentials.");
      }

      router.push("/admin");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to login. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stadium-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow & branding */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pitch-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-md bg-stadium-900 border border-stadium-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Logo & Title */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-pitch-500/40 relative mx-auto shadow-glow">
            <Image
              src="/assets/logo.jpg"
              alt="Corex Arena Logo"
              fill
              className="object-cover"
              priority
            />
          </div>

          <h1 className="font-display font-black text-2xl text-white tracking-wide">
            Admin Portal Login
          </h1>
          <p className="text-xs text-stadium-400">
            Corex Arena and Academy Turf Management
          </p>
        </div>

        {/* Error Notice */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stadium-300 mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stadium-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin email"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-stadium-850 border border-stadium-700 text-stadium-100 placeholder-stadium-500 text-sm focus:outline-none focus:border-pitch-500 transition-colors"
                id="admin-email-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stadium-300 mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stadium-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-stadium-850 border border-stadium-700 text-stadium-100 placeholder-stadium-500 text-sm focus:outline-none focus:border-pitch-500 transition-colors"
                id="admin-password-input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-pitch-500 hover:bg-pitch-400 text-stadium-950 font-extrabold text-sm shadow-glow transition-all flex items-center justify-center gap-2 mt-2"
            id="btn-admin-login"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Enter Admin Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <a
            href="/"
            className="text-xs text-stadium-400 hover:text-pitch-400 transition-colors"
          >
            ← Back to Public Booking Site
          </a>
        </div>
      </div>
    </div>
  );
}

