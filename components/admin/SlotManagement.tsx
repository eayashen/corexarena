"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  Sun,
  Moon,
  Save,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  PlusCircle,
  ToggleLeft,
  ToggleRight,
  Eye,
} from "lucide-react";

interface SlotManagementProps {
  adminRole?: string;
}

export const SlotManagement: React.FC<SlotManagementProps> = ({
  adminRole = "superadmin",
}) => {
  const isReadOnly = adminRole === "viewadmin";
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSlotId, setSavingSlotId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/slots");
      const data = await res.json();
      if (data.success) {
        setSlots(data.slots || []);
      }
    } catch (err) {
      console.error("Fetch slots error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleSlotFieldChange = (slotId: string, field: string, value: any) => {
    setSlots((prev) =>
      prev.map((s) => (s.slotId === slotId ? { ...s, [field]: value } : s))
    );
  };

  const handleSaveSlot = async (slot: any) => {
    setSavingSlotId(slot.slotId);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/admin/slots", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slot),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update slot.");
      }

      setSuccessMsg(`Slot ${slot.label || slot.slotId} updated successfully.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save slot.");
    } finally {
      setSavingSlotId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 sm:p-6 rounded-2xl glass-card border border-stadium-750 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-extrabold text-lg text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-pitch-400" />
            Configurable Slot Management
          </h3>
          <p className="text-xs text-stadium-400 mt-1">
            Customize slot times, regular pricing, promotional discounted fees, and active toggles.
          </p>
        </div>
      </div>

      {/* Alerts */}
      {isReadOnly && (
        <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/40 text-blue-200 text-xs flex items-center gap-2.5">
          <Eye className="w-4 h-4 text-blue-400 shrink-0" />
          <span>
            <strong>View-Only Mode:</strong> You are logged in as a <strong>viewadmin</strong>. Slot configurations, timings, prices, and status toggles can only be modified by Superadmin.
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

      {loading ? (
        <div className="py-20 text-center text-xs text-stadium-400">
          <Loader2 className="w-6 h-6 animate-spin text-pitch-400 mx-auto mb-2" />
          Loading slot configurations...
        </div>
      ) : (
        <div className="space-y-4">
          {slots.map((slot) => {
            const isSaving = savingSlotId === slot.slotId;
            return (
              <div
                key={slot.slotId}
                className="p-4 rounded-xl bg-stadium-900 border border-stadium-750 space-y-3"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-stadium-800">
                  <div className="flex items-center gap-2">
                    {slot.slotType === "DAY" ? (
                      <Sun className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Moon className="w-4 h-4 text-indigo-400" />
                    )}
                    <span className="font-mono text-xs font-bold text-pitch-400">
                      [{slot.slotId}]
                    </span>
                    <span className="text-xs font-bold text-white uppercase">
                      {slot.slotType} Slot
                    </span>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                    {/* Active toggle */}
                    <button
                      type="button"
                      disabled={isReadOnly}
                      onClick={() =>
                        !isReadOnly && handleSlotFieldChange(slot.slotId, "active", !slot.active)
                      }
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                        slot.active
                          ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/40"
                          : "bg-stadium-850 text-stadium-500 border-stadium-700"
                      } ${isReadOnly ? "cursor-not-allowed opacity-80" : ""}`}
                    >
                      {slot.active ? (
                        <>
                          <ToggleRight className="w-4 h-4 text-emerald-400" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4 text-stadium-500" />
                          <span>Inactive</span>
                        </>
                      )}
                    </button>

                    {!isReadOnly && (
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleSaveSlot(slot)}
                        className="px-4 py-1.5 rounded-lg bg-pitch-500 hover:bg-pitch-400 text-stadium-950 font-black text-xs shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {isSaving ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Save className="w-3.5 h-3.5" />
                        )}
                        <span>Save</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Slot Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] text-stadium-400 mb-1">
                      Display Label
                    </label>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={slot.label}
                      onChange={(e) =>
                        handleSlotFieldChange(slot.slotId, "label", e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-stadium-850 border border-stadium-700 text-white text-xs focus:outline-none focus:border-pitch-500 disabled:opacity-75 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-stadium-400 mb-1">
                      Start Time (24h)
                    </label>
                    <input
                      type="time"
                      disabled={isReadOnly}
                      value={slot.startTime}
                      onChange={(e) =>
                        handleSlotFieldChange(slot.slotId, "startTime", e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-stadium-850 border border-stadium-700 text-white text-xs focus:outline-none focus:border-pitch-500 disabled:opacity-75 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-stadium-400 mb-1">
                      End Time (24h)
                    </label>
                    <input
                      type="time"
                      disabled={isReadOnly}
                      value={slot.endTime}
                      onChange={(e) =>
                        handleSlotFieldChange(slot.slotId, "endTime", e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-stadium-850 border border-stadium-700 text-white text-xs focus:outline-none focus:border-pitch-500 disabled:opacity-75 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-stadium-400 mb-1">
                      Regular Fee (৳)
                    </label>
                    <input
                      type="number"
                      disabled={isReadOnly}
                      value={slot.regularPrice}
                      onChange={(e) =>
                        handleSlotFieldChange(slot.slotId, "regularPrice", e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-stadium-850 border border-stadium-700 text-white text-xs focus:outline-none focus:border-pitch-500 disabled:opacity-75 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-stadium-400 mb-1">
                      Discounted Fee (৳)
                    </label>
                    <input
                      type="number"
                      disabled={isReadOnly}
                      value={slot.discountedPrice}
                      onChange={(e) =>
                        handleSlotFieldChange(slot.slotId, "discountedPrice", e.target.value)
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-stadium-850 border border-stadium-700 text-pitch-300 font-bold text-xs focus:outline-none focus:border-pitch-500 disabled:opacity-75 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

            );
          })}
        </div>
      )}
    </div>
  );
};
