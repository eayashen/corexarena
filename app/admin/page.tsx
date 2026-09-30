"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Shield,
  LayoutDashboard,
  Calendar as CalendarIcon,
  Clock,
  Settings,
  Bell,
  LogOut,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Eye,
  TrendingUp,
  DollarSign,
  Users,
  AlertCircle,
  Layers,
  ChevronDown,
} from "lucide-react";
import { BookingDetailModal } from "@/components/admin/BookingDetailModal";
import { ManualBookingModal } from "@/components/admin/ManualBookingModal";
import { AdminCalendarView } from "@/components/admin/AdminCalendarView";
import { SlotManagement } from "@/components/admin/SlotManagement";
import { AdminSettings } from "@/components/admin/AdminSettings";
import { AdminRevenueView } from "@/components/admin/AdminRevenueView";
import { AdminAccountsManagement } from "@/components/admin/AdminAccountsManagement";
import { NotificationsDrawer } from "@/components/admin/NotificationsDrawer";
import { formatDisplayDate, format12Hour } from "@/lib/utils/date";

export default function AdminDashboardPage() {
  const router = useRouter();

  // Auth & Admin State
  const [adminUser, setAdminUser] = useState<any | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Tab State: "dashboard" | "calendar" | "slots" | "settings" | "revenue" | "accounts"
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "calendar" | "slots" | "settings" | "revenue" | "accounts"
  >("dashboard");

  // Analytics State
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Bookings List State
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [slotTypeFilter, setSlotTypeFilter] = useState("ALL");
  const [createdByFilter, setCreatedByFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("");

  // Modal States
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<any | null>(null);
  const [showManualBookingModal, setShowManualBookingModal] = useState(false);
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  // 1. Verify Admin Session
  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/auth");
      const data = await res.json();
      if (!res.ok || !data.success) {
        router.push("/admin/login");
        return;
      }
      setAdminUser(data.admin);
    } catch {
      router.push("/admin/login");
    } finally {
      setAuthChecking(false);
    }
  }, [router]);

  // 2. Fetch Analytics
  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // 3. Fetch Bookings with current filters
  const fetchBookings = useCallback(async () => {
    setBookingsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append("search", searchQuery.trim());
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (slotTypeFilter !== "ALL") params.append("slotType", slotTypeFilter);
      if (createdByFilter !== "ALL") params.append("createdBy", createdByFilter);
      if (dateFilter) params.append("date", dateFilter);

      const res = await fetch(`/api/admin/bookings?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings || []);
      }
    } catch (err) {
      console.error("Failed to load bookings:", err);
    } finally {
      setBookingsLoading(false);
    }
  }, [searchQuery, statusFilter, slotTypeFilter, createdByFilter, dateFilter]);

  // 4. Fetch Unread Notifications Count
  const fetchUnreadCount = async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      const data = await res.json();
      if (data.success) {
        setUnreadNotifCount(data.unreadCount || 0);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (adminUser) {
      fetchAnalytics();
      fetchBookings();
      fetchUnreadCount();
    }
  }, [adminUser, fetchBookings]);

  const isViewAdmin = adminUser?.role === "viewadmin";

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
      router.push("/admin/login");
    } catch {
      router.push("/admin/login");
    }
  };

  const handleQuickApprove = async (bookingId: string) => {
    if (isViewAdmin) return;
    try {
      await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "APPROVE" }),
      });
      fetchBookings();
      fetchAnalytics();
    } catch (err) {
      console.error("Quick approve error:", err);
    }
  };

  const handleSelectBookingById = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/admin/bookings?search=${bookingId}`);
      const data = await res.json();
      if (data.success && data.bookings?.length > 0) {
        setSelectedBookingForDetails(data.bookings[0]);
      }
    } catch {
      // ignore
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-stadium-950 flex items-center justify-center text-pitch-400">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stadium-950 text-stadium-100 flex flex-col font-sans">
      {/* Top Admin Navigation Bar */}
      <header className="sticky top-0 z-30 w-full glass-card bg-stadium-950/90 border-b border-stadium-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden ring-1 ring-pitch-500/40 relative shadow-glow">
                <Image
                  src="/assets/logo.jpg"
                  alt="Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-lg sm:text-xl text-white">
                    COREX<span className="text-pitch-400">ADMIN</span>
                  </span>
                  {isViewAdmin ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30">
                      <Eye className="w-2.5 h-2.5 text-cyan-400" />
                      View-Only Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-pitch-500/20 text-pitch-300 rounded border border-pitch-500/30">
                      <Shield className="w-2.5 h-2.5 text-pitch-400" />
                      Superadmin
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-stadium-400 hidden sm:block">
                  Logged in as <strong className="text-white">{adminUser?.name || "Administrator"}</strong>
                  {isViewAdmin && (
                    <span className="text-cyan-400 ml-1.5 font-semibold">• Read-Only Monitoring</span>
                  )}
                </p>
              </div>
            </div>

            {/* Quick Actions & User Profile */}
            <div className="flex items-center gap-2.5 sm:gap-4">
              {/* Notification Bell */}
              <button
                onClick={() => setShowNotificationsDrawer(true)}
                className="relative p-2.5 rounded-xl bg-stadium-850 hover:bg-stadium-800 border border-stadium-750 text-stadium-300 hover:text-white transition-colors"
                title="Notifications"
                id="btn-admin-notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-black animate-pulse">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {/* Add Manual Booking (Superadmin only) */}
              {!isViewAdmin && (
                <button
                  onClick={() => setShowManualBookingModal(true)}
                  className="px-3.5 py-2 sm:py-2.5 rounded-xl bg-pitch-500 hover:bg-pitch-400 text-stadium-950 font-extrabold text-xs shadow-glow flex items-center gap-1.5 transition-all"
                  id="btn-add-manual-booking"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Booking</span>
                </button>
              )}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2.5 sm:px-3 sm:py-2 rounded-xl bg-stadium-850 hover:bg-red-950/40 text-stadium-400 hover:text-red-300 border border-stadium-750 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation Menu */}
          <nav className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none border-t border-stadium-800/60 pt-2 text-xs font-bold">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${activeTab === "dashboard"
                ? "bg-pitch-500 text-stadium-950 shadow-glow font-black"
                : "text-stadium-300 hover:text-white hover:bg-stadium-850"
                }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Booking Overview</span>
            </button>

            <button
              onClick={() => setActiveTab("calendar")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${activeTab === "calendar"
                ? "bg-pitch-500 text-stadium-950 shadow-glow font-black"
                : "text-stadium-300 hover:text-white hover:bg-stadium-850"
                }`}
            >
              <CalendarIcon className="w-4 h-4 " />
              <span>Schedule Matrix</span>
            </button>

            <button
              onClick={() => setActiveTab("slots")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${activeTab === "slots"
                ? "bg-pitch-500 text-stadium-950 shadow-glow font-black"
                : "text-stadium-300 hover:text-white hover:bg-stadium-850"
                }`}
            >
              <Clock className="w-4 h-4" />
              <span>Slot Configuration</span>
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${activeTab === "settings"
                ? "bg-pitch-500 text-stadium-950 shadow-glow font-black"
                : "text-stadium-300 hover:text-white hover:bg-stadium-850"
                }`}
            >
              <Settings className="w-4 h-4" />
              <span>Turf Settings</span>
            </button>

            <button
              onClick={() => setActiveTab("revenue")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${activeTab === "revenue"
                ? "bg-pitch-500 text-stadium-950 shadow-glow font-black"
                : "text-stadium-300 hover:text-white hover:bg-stadium-850"
                }`}
              id="nav-tab-revenue"
            >
              <DollarSign className="w-4 h-4" />
              <span>Revenue</span>
            </button>

            <button
              onClick={() => setActiveTab("accounts")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${activeTab === "accounts"
                ? "bg-pitch-500 text-stadium-950 shadow-glow font-black"
                : "text-stadium-300 hover:text-white hover:bg-stadium-850"
                }`}
              id="nav-tab-accounts"
            >
              <Users className="w-4 h-4" />
              <span>Admin Accounts</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Admin View Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Tab 1: Dashboard & Bookings View */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* KPI Analytics Cards */}
            {analytics && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                {/* Today's Bookings */}
                <div className="p-4 rounded-2xl glass-card border border-stadium-750 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-stadium-400">
                    Today&apos;s Matches
                  </span>
                  <p className="font-display font-black text-2xl text-white">
                    {analytics.todayBookingsCount}
                  </p>
                  <p className="text-[10px] text-pitch-400 font-semibold">
                    {analytics.todayConfirmedCount} Confirmed • {analytics.todayPendingCount} Pending
                  </p>
                </div>

                {/* Available Slots */}
                <div className="p-4 rounded-2xl glass-card border border-stadium-750 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-stadium-400">
                    Available Today
                  </span>
                  <p className="font-display font-black text-2xl text-emerald-400">
                    {analytics.todayAvailableSlots}
                  </p>
                  <p className="text-[10px] text-stadium-400">
                    Out of {analytics.totalSlotsCount} total slots
                  </p>
                </div>

                {/* Occupancy % */}
                <div className="p-4 rounded-2xl glass-card border border-stadium-750 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-stadium-400">
                    Today Occupancy
                  </span>
                  <p className="font-display font-black text-2xl text-pitch-300">
                    {analytics.todayOccupancy}%
                  </p>
                  <p className="text-[10px] text-stadium-400">Day & Night Fill Rate</p>
                </div>

                {/* Pending Requests */}
                <div className="p-4 rounded-2xl glass-card border border-yellow-500/30 space-y-1 bg-yellow-950/20">
                  <span className="text-[10px] uppercase font-bold text-yellow-300">
                    Pending Requests
                  </span>
                  <p className="font-display font-black text-2xl text-yellow-400">
                    {analytics.pendingRequestsCount}
                  </p>
                  <p className="text-[10px] text-yellow-300 font-semibold">Needs Verification</p>
                </div>

                {/* Confirmed Bookings */}
                <div className="p-4 rounded-2xl glass-card border border-stadium-750 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-stadium-400">
                    Total Confirmed
                  </span>
                  <p className="font-display font-black text-2xl text-white">
                    {analytics.confirmedBookingsCount}
                  </p>
                  <p className="text-[10px] text-stadium-400">
                    {analytics.upcomingBookingsCount} upcoming
                  </p>
                </div>

                {/* Today Revenue */}
                <div className="p-4 rounded-2xl glass-card border border-gold-500/30 space-y-1 bg-gold-950/20">
                  <span className="text-[10px] uppercase font-bold text-gold-300">
                    Today Revenue
                  </span>
                  <p className="font-display font-black text-2xl text-gold-400">
                    ৳{analytics.todayTotalConfirmedValue.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-gold-300">
                    Advance: ৳{analytics.todayAdvanceRevenue.toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* Bookings Search & Filter Controls */}
            <div className="p-4 sm:p-5 rounded-2xl glass-card border border-stadium-750 space-y-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <Filter className="w-4 h-4 text-pitch-400" />
                  <h3 className="font-display font-extrabold text-sm text-white">
                    Bookings Management ({bookings.length})
                  </h3>
                </div>

                {/* Search input */}
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-stadium-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by ID, Name, Mobile, Email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-stadium-850 border border-stadium-700 text-stadium-100 placeholder-stadium-500 text-xs focus:outline-none focus:border-pitch-500"
                  />
                </div>
              </div>

              {/* Filter Selectors */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {/* Status Filter */}
                <div>
                  <label className="block text-[11px] font-semibold text-stadium-400 mb-1">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stadium-850 border border-stadium-700 text-stadium-100 focus:outline-none focus:border-pitch-500"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING">🟡 PENDING</option>
                    <option value="CONFIRMED">🟢 CONFIRMED</option>
                    <option value="DECLINED">🔴 DECLINED</option>
                    <option value="CANCELLED">⚪ CANCELLED</option>
                  </select>
                </div>

                {/* Slot Type Filter */}
                <div>
                  <label className="block text-[11px] font-semibold text-stadium-400 mb-1">
                    Slot Type
                  </label>
                  <select
                    value={slotTypeFilter}
                    onChange={(e) => setSlotTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stadium-850 border border-stadium-700 text-stadium-100 focus:outline-none focus:border-pitch-500"
                  >
                    <option value="ALL">All Slots (Day & Night)</option>
                    <option value="DAY">☀️ Day Slots (6AM–4:30PM)</option>
                    <option value="NIGHT">🌙 Night Slots (5PM–2AM)</option>
                  </select>
                </div>

                {/* Created By Filter */}
                <div>
                  <label className="block text-[11px] font-semibold text-stadium-400 mb-1">
                    Created By
                  </label>
                  <select
                    value={createdByFilter}
                    onChange={(e) => setCreatedByFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stadium-850 border border-stadium-700 text-stadium-100 focus:outline-none focus:border-pitch-500"
                  >
                    <option value="ALL">All Bookings</option>
                    <option value="USER">Customer Submitted</option>
                    <option value="ADMIN">Admin Manual</option>
                  </select>
                </div>

                {/* Date Filter */}
                <div>
                  <label className="block text-[11px] font-semibold text-stadium-400 mb-1">
                    Specific Date
                  </label>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stadium-850 border border-stadium-700 text-stadium-100 focus:outline-none focus:border-pitch-500"
                  />
                </div>
              </div>
            </div>

            {/* Bookings Table (Desktop) & Cards (Mobile) */}
            {bookingsLoading ? (
              <div className="py-20 text-center text-xs text-stadium-400 space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin text-pitch-400 mx-auto" />
                <p>Loading bookings...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="py-20 text-center rounded-2xl glass-card border border-stadium-750 text-stadium-400 space-y-2">
                <AlertCircle className="w-8 h-8 mx-auto text-stadium-500" />
                <p className="text-sm font-semibold">No matching bookings found.</p>
                <p className="text-xs text-stadium-500">Try adjusting your filters or search term.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-hidden rounded-2xl glass-card border border-stadium-750 shadow-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stadium-850/90 text-stadium-400 font-bold uppercase tracking-wider border-b border-stadium-750">
                      <tr>
                        <th className="py-3.5 px-4">Booking ID</th>
                        <th className="py-3.5 px-4">Date & Time</th>
                        <th className="py-3.5 px-4">Customer</th>
                        <th className="py-3.5 px-4">Contact</th>
                        <th className="py-3.5 px-4">Type</th>
                        <th className="py-3.5 px-4">Payment</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stadium-800/80">
                      {bookings.map((b) => (
                        <tr
                          key={b._id}
                          className="hover:bg-stadium-850/60 transition-colors group cursor-pointer"
                          onClick={() => setSelectedBookingForDetails(b)}
                        >
                          <td className="py-3.5 px-4 font-mono font-bold text-pitch-400">
                            #{b.bookingId}
                            {b.createdBy === "ADMIN" && (
                              <span className="block text-[9px] font-sans text-stadium-500 font-semibold">
                                Admin Created
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-white">{formatDisplayDate(b.date)}</p>
                            <p className="text-pitch-300 font-medium text-[11px]">
                              {format12Hour(b.startTime)} – {format12Hour(b.endTime)}
                            </p>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-white">
                            {b.customerName}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-stadium-300">
                            {b.mobile}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stadium-800 text-stadium-300 border border-stadium-700">
                              {b.slotType}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-emerald-400">
                              Paid: ৳{b.paymentAmount || 0}
                            </p>
                            <p className="text-[10px] text-stadium-400">
                              Due: ৳{b.finalPrice - (b.paymentAmount || 0)}
                            </p>
                          </td>
                          <td className="py-3.5 px-4">
                            {b.status === "PENDING" && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                                🟡 PENDING
                              </span>
                            )}
                            {b.status === "CONFIRMED" && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                🟢 CONFIRMED
                              </span>
                            )}
                            {b.status === "DECLINED" && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-red-500/20 text-red-300 border border-red-500/30">
                                🔴 DECLINED
                              </span>
                            )}
                            {b.status === "CANCELLED" && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-stadium-800 text-stadium-400 border border-stadium-700">
                                ⚪ CANCELLED
                              </span>
                            )}
                          </td>
                          <td
                            className="py-3.5 px-4 text-right space-x-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {!isViewAdmin && b.status === "PENDING" && (
                              <button
                                onClick={() => handleQuickApprove(b._id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm transition-all"
                              >
                                Approve
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedBookingForDetails(b)}
                              className="px-2.5 py-1 rounded-lg bg-stadium-800 hover:bg-stadium-750 text-stadium-200 text-[11px] font-semibold border border-stadium-700"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards View */}
                <div className="lg:hidden space-y-3">
                  {bookings.map((b) => (
                    <div
                      key={b._id}
                      onClick={() => setSelectedBookingForDetails(b)}
                      className="p-4 rounded-xl glass-card border border-stadium-750 space-y-3 cursor-pointer hover:border-pitch-500/50 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2 pb-2 border-b border-stadium-800">
                        <div>
                          <span className="font-mono font-bold text-xs text-pitch-400">
                            #{b.bookingId}
                          </span>
                          <h4 className="font-bold text-white text-sm mt-0.5">
                            {b.customerName}
                          </h4>
                          <p className="text-xs text-stadium-400 font-mono">{b.mobile}</p>
                        </div>

                        <div>
                          {b.status === "PENDING" && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                              PENDING
                            </span>
                          )}
                          {b.status === "CONFIRMED" && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              CONFIRMED
                            </span>
                          )}
                          {b.status === "DECLINED" && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-500/20 text-red-300 border border-red-500/30">
                              DECLINED
                            </span>
                          )}
                          {b.status === "CANCELLED" && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stadium-800 text-stadium-400">
                              CANCELLED
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-stadium-500">Date:</span>
                          <p className="font-semibold text-white">{formatDisplayDate(b.date)}</p>
                        </div>
                        <div>
                          <span className="text-stadium-500">Time:</span>
                          <p className="font-semibold text-pitch-300">
                            {format12Hour(b.startTime)} – {format12Hour(b.endTime)}
                          </p>
                        </div>
                        <div>
                          <span className="text-stadium-500">Paid / Due:</span>
                          <p className="font-semibold text-emerald-400">
                            ৳{b.paymentAmount || 0} / ৳{b.finalPrice - (b.paymentAmount || 0)}
                          </p>
                        </div>
                        <div>
                          <span className="text-stadium-500">Slot Type:</span>
                          <p className="font-semibold text-stadium-300">{b.slotType}</p>
                        </div>
                      </div>

                      <div
                        className="pt-2 border-t border-stadium-800 flex items-center justify-end gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {!isViewAdmin && b.status === "PENDING" && (
                          <button
                            onClick={() => handleQuickApprove(b._id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedBookingForDetails(b)}
                          className="px-3 py-1.5 rounded-lg bg-stadium-800 text-stadium-200 text-xs font-semibold border border-stadium-700"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Calendar Schedule Matrix View */}
        {activeTab === "calendar" && (
          <AdminCalendarView
            adminRole={adminUser?.role}
            onSelectBooking={(b) => setSelectedBookingForDetails(b)}
            onAddBooking={() => !isViewAdmin && setShowManualBookingModal(true)}
          />
        )}

        {/* Tab 3: Configurable Slot Management */}
        {activeTab === "slots" && <SlotManagement adminRole={adminUser?.role} />}

        {/* Tab 4: Turf Settings */}
        {activeTab === "settings" && <AdminSettings adminRole={adminUser?.role} />}

        {/* Tab 5: Revenue Reports */}
        {activeTab === "revenue" && (
          <AdminRevenueView onSelectBooking={handleSelectBookingById} />
        )}

        {/* Tab 6: Admin Accounts Management */}
        {activeTab === "accounts" && (
          <AdminAccountsManagement
            adminRole={adminUser?.role}
            currentAdminEmail={adminUser?.email}
          />
        )}
      </main>

      {/* Modals & Drawers */}
      {/* 1. Booking Details & Actions Modal */}
      {selectedBookingForDetails && (
        <BookingDetailModal
          booking={selectedBookingForDetails}
          adminRole={adminUser?.role}
          onClose={() => setSelectedBookingForDetails(null)}
          onUpdate={() => {
            fetchBookings();
            fetchAnalytics();
          }}
        />
      )}

      {/* 2. Add Manual Booking Modal */}
      {showManualBookingModal && !isViewAdmin && (
        <ManualBookingModal
          onClose={() => setShowManualBookingModal(false)}
          onSuccess={() => {
            fetchBookings();
            fetchAnalytics();
          }}
        />
      )}

      {/* 3. Notifications Drawer */}
      <NotificationsDrawer
        isOpen={showNotificationsDrawer}
        adminRole={adminUser?.role}
        onClose={() => {
          setShowNotificationsDrawer(false);
          fetchUnreadCount();
        }}
        onSelectBookingId={handleSelectBookingById}
      />
    </div>
  );
}

