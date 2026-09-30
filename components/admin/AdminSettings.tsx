"use client";

import React, { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Save,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  MapPin,
  Phone,
  Mail,
  Facebook,
  DollarSign,
  Clock,
  Eye,
} from "lucide-react";

interface AdminSettingsProps {
  adminRole?: string;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  adminRole = "superadmin",
}) => {
  const isReadOnly = adminRole === "viewadmin";
  const [settings, setSettings] = useState<any>({
    turfName: "Corex Arena and Academy",
    tagline: "Mirpur's Premier Football Turf & Academy",
    address: "Plot no 217, Block no B, Rd No. 4, Shagufta, Mirpur 12, Dhaka, Bangladesh, 1216",
    email: "corexarena.academy@gmail.com",
    contactNumber: "01701-275099",
    whatsappNumber: "01701-275099",
    facebookUrl: "https://www.facebook.com/profile.php?id=61591476123056",
    latitude: 23.83148397838252,
    longitude: 90.37969133511696,
    bkashNumber: "01675906833",
    requiredAdvancePayment: 500,
    scheduleChangeHoursLimit: 48,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (field: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update settings.");
      }

      setSuccessMsg("Turf settings updated successfully.");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-stadium-400">
        <Loader2 className="w-6 h-6 animate-spin text-pitch-400 mx-auto mb-2" />
        Loading settings...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 sm:p-6 rounded-2xl glass-card border border-stadium-750 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-extrabold text-lg text-white flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-pitch-400" />
            General Turf & Booking Configuration
          </h3>
          <p className="text-xs text-stadium-400 mt-1">
            Manage contact info, bKash payment details, map coordinates, and booking policies.
          </p>
        </div>

        {!isReadOnly && (
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-pitch-500 hover:bg-pitch-400 text-stadium-950 font-extrabold text-xs shadow-glow flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Changes</span>
          </button>
        )}
      </div>

      {isReadOnly && (
        <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/40 text-blue-200 text-xs flex items-center gap-2.5">
          <Eye className="w-4 h-4 text-blue-400 shrink-0" />
          <span>
            <strong>View-Only Mode:</strong> You are logged in as a <strong>viewadmin</strong>. Turf contact details, pricing policies, and payment settings can only be edited by Superadmin.
          </span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <fieldset disabled={isReadOnly} className="contents disabled:opacity-85">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Turf Info Card */}
        <div className="p-5 rounded-2xl bg-stadium-900 border border-stadium-750 space-y-4">
          <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-stadium-800">
            <MapPin className="w-4 h-4 text-pitch-400" />
            Turf Information & Address
          </h4>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-stadium-400 mb-1">Turf Name</label>
              <input
                type="text"
                value={settings.turfName}
                onChange={(e) => handleChange("turfName", e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stadium-850 border border-stadium-700 text-white focus:outline-none focus:border-pitch-500"
              />
            </div>

            <div>
              <label className="block text-stadium-400 mb-1">Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => handleChange("tagline", e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stadium-850 border border-stadium-700 text-white focus:outline-none focus:border-pitch-500"
              />
            </div>

            <div>
              <label className="block text-stadium-400 mb-1">Full Physical Address</label>
              <textarea
                rows={2}
                value={settings.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stadium-850 border border-stadium-700 text-white focus:outline-none focus:border-pitch-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stadium-400 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={settings.latitude}
                  onChange={(e) => handleChange("latitude", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stadium-850 border border-stadium-700 text-white focus:outline-none focus:border-pitch-500 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-stadium-400 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={settings.longitude}
                  onChange={(e) => handleChange("longitude", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stadium-850 border border-stadium-700 text-white focus:outline-none focus:border-pitch-500 font-mono text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Social Card */}
        <div className="p-5 rounded-2xl bg-stadium-900 border border-stadium-750 space-y-4">
          <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-stadium-800">
            <Phone className="w-4 h-4 text-emerald-400" />
            Contact & Social Channels
          </h4>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-stadium-400 mb-1">Contact Phone</label>
              <input
                type="text"
                value={settings.contactNumber}
                onChange={(e) => handleChange("contactNumber", e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stadium-850 border border-stadium-700 text-white focus:outline-none focus:border-pitch-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-stadium-400 mb-1">WhatsApp Number</label>
              <input
                type="text"
                value={settings.whatsappNumber}
                onChange={(e) => handleChange("whatsappNumber", e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stadium-850 border border-stadium-700 text-white focus:outline-none focus:border-pitch-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-stadium-400 mb-1">Email Address</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stadium-850 border border-stadium-700 text-white focus:outline-none focus:border-pitch-500"
              />
            </div>

            <div>
              <label className="block text-stadium-400 mb-1">Facebook Page URL</label>
              <input
                type="url"
                value={settings.facebookUrl}
                onChange={(e) => handleChange("facebookUrl", e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stadium-850 border border-stadium-700 text-white focus:outline-none focus:border-pitch-500"
              />
            </div>
          </div>
        </div>

        {/* bKash & Advance Rules Card */}
        <div className="p-5 rounded-2xl bg-stadium-900 border border-stadium-750 space-y-4 md:col-span-2">
          <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-stadium-800">
            <DollarSign className="w-4 h-4 text-pink-400" />
            bKash Payment & Rescheduling Rules
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-stadium-400 mb-1">
                bKash Payment Number (Personal)
              </label>
              <input
                type="text"
                value={settings.bkashNumber}
                onChange={(e) => handleChange("bkashNumber", e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-stadium-850 border border-stadium-700 text-pink-300 font-mono font-bold focus:outline-none focus:border-pink-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-stadium-400 mb-1">
                Required Advance Payment (৳)
              </label>
              <input
                type="number"
                value={settings.requiredAdvancePayment}
                onChange={(e) =>
                  handleChange("requiredAdvancePayment", Number(e.target.value))
                }
                className="w-full px-3 py-2 rounded-xl bg-stadium-850 border border-stadium-700 text-white font-bold focus:outline-none focus:border-pitch-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-stadium-400 mb-1">
                Customer Schedule Change Cutoff (Hours)
              </label>
              <input
                type="number"
                value={settings.scheduleChangeHoursLimit}
                onChange={(e) =>
                  handleChange("scheduleChangeHoursLimit", Number(e.target.value))
                }
                className="w-full px-3 py-2 rounded-xl bg-stadium-850 border border-stadium-700 text-white font-bold focus:outline-none focus:border-pitch-500 text-sm"
              />
            </div>
          </div>
        </div>
      </div>
      </fieldset>
    </form>
  );
};

