"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  X,
  CheckCircle2,
  Clock,
  CheckCheck,
  Calendar,
  User,
  ArrowRight,
} from "lucide-react";
import { formatDisplayDate } from "@/lib/utils/date";

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBookingId: (bookingId: string) => void;
  adminRole?: string;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  onSelectBookingId,
  adminRole = "superadmin",
}) => {
  const isReadOnly = adminRole === "viewadmin";
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    if (isReadOnly) return;
    try {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      fetchNotifications();
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  const handleNotificationClick = async (notif: any) => {
    if (!isReadOnly && notif.status === "UNREAD") {
      try {
        await fetch("/api/admin/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: notif._id }),
        });
      } catch {
        // ignore
      }
    }
    onClose();
    onSelectBookingId(notif.bookingId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stadium-950/70 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div className="relative w-full max-w-md bg-stadium-900 border-l border-stadium-750 shadow-2xl h-full flex flex-col">
        {/* Top bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-stadium-850 to-stadium-900 border-b border-stadium-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-pitch-500/20 text-pitch-400 flex items-center justify-center relative">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-stadium-900" />
              )}
            </div>
            <div>
              <h3 className="font-display font-extrabold text-base text-white">
                Booking Alerts
              </h3>
              <p className="text-[11px] text-pitch-400 font-semibold">
                {unreadCount} unread request{unreadCount === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isReadOnly && unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] text-stadium-400 hover:text-white flex items-center gap-1 font-semibold px-2 py-1 rounded bg-stadium-800"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5 text-pitch-400" />
                <span>Mark Read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-stadium-800 text-stadium-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>


        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-xs text-stadium-400">Loading alerts...</div>
          ) : notifications.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-stadium-600 mx-auto" />
              <p className="text-xs text-stadium-400">No notifications yet.</p>
            </div>
          ) : (
            notifications.map((n) => {
              const isUnread = n.status === "UNREAD";
              return (
                <div
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isUnread
                      ? "bg-pitch-950/40 border-pitch-500/40 shadow-sm hover:border-pitch-400"
                      : "bg-stadium-850 hover:bg-stadium-800 border-stadium-750 text-stadium-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono font-bold text-xs text-pitch-400">
                      #{n.bookingId}
                    </span>
                    <span className="text-[10px] text-stadium-500">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-white leading-relaxed">
                    {n.message}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-stadium-400 pt-1 border-t border-stadium-800">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-pitch-400" />
                      {formatDisplayDate(n.date)}
                    </span>
                    <span className="text-pitch-300 font-semibold flex items-center gap-1">
                      Review Booking <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
