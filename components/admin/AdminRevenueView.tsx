"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Sun,
  Moon,
  Filter,
  RefreshCw,
  Eye,
  Layers,
  ChevronDown,
  RotateCcw,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { formatDisplayDate } from "@/lib/utils/date";

interface AdminRevenueViewProps {
  onSelectBooking: (bookingId: string) => void;
}

export const AdminRevenueView: React.FC<AdminRevenueViewProps> = ({ onSelectBooking }) => {
  // View mode: "daily" | "monthly" | "yearly"
  const [view, setView] = useState<"daily" | "monthly" | "yearly">("daily");

  // Filters State
  const [yearFilter, setYearFilter] = useState<string>("");
  const [monthFilter, setMonthFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [bookingSource, setBookingSource] = useState<string>("ALL");
  const [slotType, setSlotType] = useState<string>("ALL");
  const [status, setStatus] = useState<string>("CONFIRMED");

  // Data State
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalBookings: 0,
    dayBookings: 0,
    nightBookings: 0,
    dayIncome: 0,
    nightIncome: 0,
    netIncome: 0,
  });
  const [reportData, setReportData] = useState<any[]>([]);
  const [detailBookings, setDetailBookings] = useState<any[]>([]);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);

  // Chart tooltip state
  const [hoveredChartIndex, setHoveredChartIndex] = useState<number | null>(null);

  const fetchRevenueData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("view", view);
      if (yearFilter) params.append("year", yearFilter);
      if (monthFilter) params.append("month", monthFilter);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (bookingSource !== "ALL") params.append("bookingSource", bookingSource);
      if (slotType !== "ALL") params.append("slotType", slotType);
      if (status) params.append("status", status);

      const res = await fetch(`/api/admin/revenue?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setSummary(
          data.summary || {
            totalBookings: 0,
            dayBookings: 0,
            nightBookings: 0,
            dayIncome: 0,
            nightIncome: 0,
            netIncome: 0,
          }
        );
        setReportData(data.reportData || []);
        setDetailBookings(data.detailBookings || []);
        if (data.filterOptions) {
          if (data.filterOptions.availableYears?.length > 0) {
            setAvailableYears(data.filterOptions.availableYears);
          }
          if (data.filterOptions.availableMonths?.length > 0) {
            setAvailableMonths(data.filterOptions.availableMonths);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load revenue data:", err);
    } finally {
      setLoading(false);
    }
  }, [view, yearFilter, monthFilter, startDate, endDate, bookingSource, slotType, status]);

  useEffect(() => {
    fetchRevenueData();
  }, [fetchRevenueData]);

  const handleResetFilters = () => {
    setYearFilter("");
    setMonthFilter("");
    setStartDate("");
    setEndDate("");
    setBookingSource("ALL");
    setSlotType("ALL");
    setStatus("CONFIRMED");
  };

  // Chart data preparation (reverse chronological to chronological for chart from left to right)
  const chartItems = [...reportData].reverse().slice(-14); // show last 14 entries for clean display
  const maxNetIncome = Math.max(...chartItems.map((item) => item.netIncome || 0), 1000);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header & View Navigation Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-stadium-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display font-black text-xl sm:text-2xl text-white tracking-tight flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-pitch-400" />
              Revenue & Financial Reports
            </h2>
          </div>
          <p className="text-xs text-stadium-400 mt-1">
            Confirmed booking income with Day/Night breakdown — Daily, Monthly & Yearly.
          </p>
        </div>

        {/* View Switcher: Daily | Monthly | Yearly */}
        <div className="inline-flex p-1 rounded-xl bg-stadium-900 border border-stadium-750 self-stretch sm:self-auto">
          <button
            onClick={() => setView("daily")}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === "daily"
              ? "bg-pitch-500 text-stadium-950 shadow-glow font-black"
              : "text-stadium-400 hover:text-white"
              }`}
            id="tab-revenue-daily"
          >
            Daily
          </button>
          <button
            onClick={() => setView("monthly")}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === "monthly"
              ? "bg-pitch-500 text-stadium-950 shadow-glow font-black"
              : "text-stadium-400 hover:text-white"
              }`}
            id="tab-revenue-monthly"
          >
            Monthly
          </button>
          <button
            onClick={() => setView("yearly")}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === "yearly"
              ? "bg-pitch-500 text-stadium-950 shadow-glow font-black"
              : "text-stadium-400 hover:text-white"
              }`}
            id="tab-revenue-yearly"
          >
            Yearly
          </button>
        </div>
      </div>

      {/* 1. Summary Cards (Top) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Bookings */}
        <div className="p-4 rounded-2xl glass-card border border-stadium-750 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-stadium-400">Total Bookings</span>
            <Layers className="w-3.5 h-3.5 text-stadium-500" />
          </div>
          <p className="font-display font-black text-2xl text-white">
            {summary.totalBookings.toLocaleString()}
          </p>
          <p className="text-[10px] text-stadium-400">Confirmed reservations</p>
        </div>

        {/* Day Bookings */}
        <div className="p-4 rounded-2xl glass-card border border-stadium-750 space-y-1 bg-amber-950/10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-amber-400/90">Day Bookings</span>
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <p className="font-display font-black text-2xl text-amber-300">
            {summary.dayBookings.toLocaleString()}
          </p>
          <p className="text-[10px] text-stadium-400">Daytime matches</p>
        </div>

        {/* Night Bookings */}
        <div className="p-4 rounded-2xl glass-card border border-stadium-750 space-y-1 bg-indigo-950/15">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-indigo-300">Night Bookings</span>
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <p className="font-display font-black text-2xl text-indigo-300">
            {summary.nightBookings.toLocaleString()}
          </p>
          <p className="text-[10px] text-stadium-400">Floodlit matches</p>
        </div>

        {/* Day Income */}
        <div className="p-4 rounded-2xl glass-card border border-stadium-750 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-amber-400">Day Income</span>
            <span className="text-[10px] font-bold text-amber-500">৳</span>
          </div>
          <p className="font-display font-black text-xl sm:text-2xl text-amber-400 truncate">
            ৳{summary.dayIncome.toLocaleString()}
          </p>
          <p className="text-[10px] text-stadium-400">After special discounts</p>
        </div>

        {/* Night Income */}
        <div className="p-4 rounded-xl glass-card border border-stadium-750 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-indigo-300">Night Income</span>
            <span className="text-[10px] font-bold text-indigo-400">৳</span>
          </div>
          <p className="font-display font-black text-xl sm:text-2xl text-indigo-300 truncate">
            ৳{summary.nightIncome.toLocaleString()}
          </p>
          <p className="text-[10px] text-stadium-400">After special discounts</p>
        </div>

        {/* Net Income */}
        <div className="p-4 rounded-2xl glass-card border-2 border-pitch-500/50 space-y-1 bg-pitch-950/30 shadow-glow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-extrabold text-pitch-300">Net Income</span>
            <span className="text-[10px] font-bold text-pitch-400">৳</span>
          </div>
          <p className="font-display font-black text-xl sm:text-2xl text-pitch-300 truncate">
            ৳{summary.netIncome.toLocaleString()}
          </p>
          <p className="text-[10px] text-pitch-400/80 font-semibold">Day + Night Final</p>
        </div>
      </div>

      {/* 2. Filter Controls Card */}
      <div className="p-4 rounded-2xl glass-card border border-stadium-750 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-stadium-800">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-pitch-400" />
            <span className="font-display font-bold text-xs uppercase tracking-wider text-white">
              Revenue Filters
            </span>
          </div>

          <button
            onClick={handleResetFilters}
            className="px-2.5 py-1 rounded-lg bg-stadium-800 hover:bg-stadium-750 text-stadium-400 hover:text-white text-[11px] font-medium flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Year filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stadium-400 mb-1">
              Select Year
            </label>
            <select
              value={yearFilter}
              onChange={(e) => {
                setYearFilter(e.target.value);
                setStartDate("");
                setEndDate("");
              }}
              className="w-full px-3 py-2 rounded-xl bg-stadium-900 border border-stadium-750 text-white text-xs focus:outline-none focus:border-pitch-500 font-medium"
            >
              <option value="">All Years</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Month filter (for daily & monthly view) */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stadium-400 mb-1">
              Select Month
            </label>
            <input
              type="month"
              value={monthFilter}
              onChange={(e) => {
                setMonthFilter(e.target.value);
                setStartDate("");
                setEndDate("");
              }}
              className="w-full px-3 py-2 rounded-xl bg-stadium-900 border border-stadium-750 text-white text-xs focus:outline-none focus:border-pitch-500"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stadium-400 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setMonthFilter("");
              }}
              className="w-full px-3 py-2 rounded-xl bg-stadium-900 border border-stadium-750 text-white text-xs focus:outline-none focus:border-pitch-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stadium-400 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setMonthFilter("");
              }}
              className="w-full px-3 py-2 rounded-xl bg-stadium-900 border border-stadium-750 text-white text-xs focus:outline-none focus:border-pitch-500"
            />
          </div>

          {/* Booking Source Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stadium-400 mb-1">
              Booking Source
            </label>
            <select
              value={bookingSource}
              onChange={(e) => setBookingSource(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stadium-900 border border-stadium-750 text-white text-xs focus:outline-none focus:border-pitch-500 font-medium"
            >
              <option value="ALL">All Sources (User & Admin)</option>
              <option value="USER">User Online Bookings</option>
              <option value="ADMIN">Admin Manual Bookings</option>
            </select>
          </div>

          {/* Slot Type Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-stadium-400 mb-1">
              Slot Type
            </label>
            <select
              value={slotType}
              onChange={(e) => setSlotType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-stadium-900 border border-stadium-750 text-white text-xs focus:outline-none focus:border-pitch-500 font-medium"
            >
              <option value="ALL">All Slots (Day & Night)</option>
              <option value="DAY">Day Slots Only</option>
              <option value="NIGHT">Night Slots Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Responsive Revenue Chart */}
      <div className="p-5 rounded-2xl glass-card border border-stadium-750 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-display font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-pitch-400" />
              {view === "daily" && "Daily Revenue Trend (Day, Night & Net Income)"}
              {view === "monthly" && "Monthly Revenue Breakdown (Day, Night & Net Income)"}
              {view === "yearly" && "Yearly Revenue Comparison (Day, Night & Net Income)"}
            </h3>
            <p className="text-[11px] text-stadium-400">
              Interactive chart displaying revenue.
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-amber-400" />
              <span className="text-stadium-300">Day Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-indigo-400" />
              <span className="text-stadium-300">Night Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-pitch-400" />
              <span className="text-stadium-200">Net Income</span>
            </div>
          </div>
        </div>

        {/* Visual Chart Graphic */}
        {loading ? (
          <div className="h-56 flex items-center justify-center text-stadium-400">
            <RefreshCw className="w-6 h-6 animate-spin text-pitch-400" />
          </div>
        ) : chartItems.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-stadium-500 space-y-1">
            <DollarSign className="w-8 h-8 text-stadium-600" />
            <p className="text-xs">No confirmed revenue records match current filters.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="h-64 sm:h-72 w-full flex items-end gap-2 sm:gap-4 pt-6 pb-2 px-2 border-b border-stadium-800 overflow-x-auto scrollbar-none">
              {chartItems.map((item, idx) => {
                const dayHeight = Math.max(4, Math.round(((item.dayIncome || 0) / maxNetIncome) * 100));
                const nightHeight = Math.max(4, Math.round(((item.nightIncome || 0) / maxNetIncome) * 100));
                const netHeight = Math.max(6, Math.round(((item.netIncome || 0) / maxNetIncome) * 100));

                const label =
                  view === "daily"
                    ? item.date?.slice(5) // MM-DD
                    : view === "monthly"
                      ? item.monthKey || item.month?.slice(0, 3)
                      : item.year;

                const isHovered = hoveredChartIndex === idx;

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredChartIndex(idx)}
                    onMouseLeave={() => setHoveredChartIndex(null)}
                    className="flex-1 min-w-[42px] max-w-[70px] h-full flex flex-col justify-end items-center group relative cursor-pointer"
                  >
                    {/* Tooltip */}
                    {isHovered && (
                      <div className="absolute -top-24 z-30 px-3 py-2 rounded-xl bg-stadium-950 border border-pitch-500/40 shadow-2xl text-[10px] text-left min-w-[130px] pointer-events-none animate-fadeIn">
                        <p className="font-bold text-white mb-1">
                          {view === "daily" ? formatDisplayDate(item.date) : item.month || item.year}
                        </p>
                        <p className="text-amber-400 flex justify-between">
                          <span>Day:</span>
                          <strong>৳{(item.dayIncome || 0).toLocaleString()}</strong>
                        </p>
                        <p className="text-indigo-300 flex justify-between">
                          <span>Night:</span>
                          <strong>৳{(item.nightIncome || 0).toLocaleString()}</strong>
                        </p>
                        <p className="text-pitch-300 font-bold border-t border-stadium-800 pt-1 mt-1 flex justify-between">
                          <span>Net:</span>
                          <strong>৳{(item.netIncome || 0).toLocaleString()}</strong>
                        </p>
                      </div>
                    )}

                    {/* Bars Container */}
                    <div className="w-full flex items-end justify-center gap-1 h-full pb-1">
                      {/* Day Bar */}
                      <div
                        style={{ height: `${dayHeight}%` }}
                        className="w-2.5 sm:w-3.5 rounded-t-sm bg-gradient-to-t from-amber-600 to-amber-400 group-hover:brightness-125 transition-all"
                      />
                      {/* Night Bar */}
                      <div
                        style={{ height: `${nightHeight}%` }}
                        className="w-2.5 sm:w-3.5 rounded-t-sm bg-gradient-to-t from-indigo-700 to-indigo-400 group-hover:brightness-125 transition-all"
                      />
                      {/* Net Indicator Line/Bar */}
                      <div
                        style={{ height: `${netHeight}%` }}
                        className="w-1 sm:w-1.5 rounded-t-full bg-pitch-400 group-hover:bg-pitch-300 transition-all opacity-80"
                      />
                    </div>

                    {/* X-axis Label */}
                    <span className="text-[10px] font-mono text-stadium-400 group-hover:text-white mt-1">
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. Tabulated Revenue Report Table (Daily / Monthly / Yearly) */}
      <div className="p-5 rounded-2xl glass-card border border-stadium-750 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-display font-extrabold text-sm sm:text-base text-white">
              {view === "daily" && "Daily Revenue Table"}
              {view === "monthly" && "Monthly Revenue Table"}
              {view === "yearly" && "Yearly Revenue Table"}
            </h3>
            <p className="text-[11px] text-stadium-400">
              {view === "daily" && "Breakdown by date showing confirmed bookings count and net revenue."}
              {view === "monthly" && "Breakdown by month showing Day/Night bookings and net income."}
              {view === "yearly" && "Annual revenue progression by calendar year."}
            </p>
          </div>

          <span className="text-xs text-stadium-400">
            Showing <strong className="text-white">{reportData.length}</strong> record
            {reportData.length === 1 ? "" : "s"}
          </span>
        </div>

        {/* Responsive Table Container */}
        <div className="overflow-x-auto rounded-xl border border-stadium-800">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-stadium-900 border-b border-stadium-800 text-stadium-400 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-3 px-4">
                  {view === "daily" ? "Date" : view === "monthly" ? "Month" : "Year"}
                </th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-right">Day</th>
                <th className="py-3 px-4 text-right">Night</th>
                <th className="py-3 px-4 text-right text-amber-400">Day Income</th>
                <th className="py-3 px-4 text-right text-indigo-300">Night Income</th>
                <th className="py-3 px-4 text-right text-pitch-300">Net Income</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stadium-800/80">
              {reportData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stadium-500">
                    No confirmed revenue records found for this period.
                  </td>
                </tr>
              ) : (
                reportData.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-stadium-850/50 transition-colors font-medium text-stadium-200"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {view === "daily"
                        ? formatDisplayDate(row.date)
                        : view === "monthly"
                          ? row.month || row.monthKey
                          : row.year}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-white">
                      {row.total?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-amber-300/90 font-mono">
                      {row.day?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-indigo-300/90 font-mono">
                      {row.night?.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-amber-400 font-mono font-semibold">
                      ৳{(row.dayIncome || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-indigo-300 font-mono font-semibold">
                      ৳{(row.nightIncome || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-pitch-300 bg-pitch-950/20">
                      ৳{(row.netIncome || 0).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {/* Table Footer Totals */}
            {reportData.length > 0 && (
              <tfoot>
                <tr className="bg-stadium-900 border-t-2 border-stadium-750 text-xs font-black text-white">
                  <td className="py-3.5 px-4 uppercase text-[10px] tracking-wider text-pitch-400">
                    Total Period Summary
                  </td>
                  <td className="py-3.5 px-4 text-right">{summary.totalBookings.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-right text-amber-300">
                    {summary.dayBookings.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right text-indigo-300">
                    {summary.nightBookings.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right text-amber-400">
                    ৳{summary.dayIncome.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right text-indigo-300">
                    ৳{summary.nightIncome.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right text-pitch-300 bg-pitch-950/40">
                    ৳{summary.netIncome.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* 5. Revenue Detail Table (Individual Bookings) */}
      <div className="p-5 rounded-2xl glass-card border border-stadium-750 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-display font-extrabold text-sm sm:text-base text-white">
              Revenue Detail Table
            </h3>
            <p className="text-[11px] text-stadium-400">
              Individual confirmed booking records included in this revenue period. Click any booking to view
              details.
            </p>
          </div>
          <span className="text-xs text-stadium-400">
            Showing <strong className="text-white">{detailBookings.length}</strong> bookings
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-stadium-800">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-stadium-900 border-b border-stadium-800 text-stadium-400 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-3 px-4">Booking ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Slot Type</th>
                <th className="py-3 px-4 text-right">Final Price</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stadium-800/80">
              {detailBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stadium-500">
                    No confirmed bookings found.
                  </td>
                </tr>
              ) : (
                detailBookings.map((b) => (
                  <tr
                    key={b._id}
                    onClick={() => onSelectBooking(b.bookingId)}
                    className="hover:bg-stadium-850/60 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-pitch-400 group-hover:underline">
                      #{b.bookingId}
                    </td>
                    <td className="py-3 px-4 text-stadium-300">{formatDisplayDate(b.date)}</td>
                    <td className="py-3 px-4 font-semibold text-white">{b.customerName}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${b.source === "ADMIN"
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          }`}
                      >
                        {b.source}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${b.slotType === "NIGHT"
                          ? "bg-indigo-500/20 text-indigo-300"
                          : "bg-amber-500/20 text-amber-300"
                          }`}
                      >
                        {b.slotType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-white">
                      ৳{b.finalPrice.toLocaleString()}
                      {b.specialDiscount > 0 && (
                        <span className="block text-[9px] font-semibold text-amber-400">
                          (৳{b.specialDiscount.toLocaleString()} off)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectBooking(b.bookingId);
                        }}
                        className="p-1.5 rounded-lg bg-stadium-800 group-hover:bg-pitch-500 group-hover:text-stadium-950 text-stadium-400 transition-colors"
                        title="View & Edit Booking"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
