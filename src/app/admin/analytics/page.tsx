"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { formatCurrency } from "@/lib/utils";
import { StatsCard } from "@/components/admin/StatsCard";
import {
  DollarSign, TrendingUp, Ticket, Film, MapPin, Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Period = "today" | "month" | "year" | "overall";

interface AnalyticsData {
  summary: {
    today:   { revenue: number; bookings: number };
    month:   { revenue: number; bookings: number };
    year:    { revenue: number; bookings: number };
    overall: { revenue: number; bookings: number };
  };
  monthlyTrend: { month: string; revenue: number; bookings: number }[];
  topMovies: { id: string; title: string; genre: string; revenue: number; bookings: number }[];
  revenueByTheater: { id: string; name: string; city: string; revenue: number; bookings: number }[];
  revenueByGenre: { genre: string; revenue: number; bookings: number }[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("month");

  useEffect(() => {
    axios.get("/api/admin/analytics")
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-zinc-400 text-sm mt-1">Loading...</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-zinc-900/60 animate-pulse border border-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const PERIODS: { id: Period; label: string }[] = [
    { id: "today",   label: "Today" },
    { id: "month",   label: "This Month" },
    { id: "year",    label: "This Year" },
    { id: "overall", label: "All Time" },
  ];

  const maxRevenue = Math.max(...data.monthlyTrend.map((m) => m.revenue), 1);
  const maxBookings = Math.max(...data.monthlyTrend.map((m) => m.bookings), 1);
  const totalMovieRevenue = Math.max(...data.topMovies.map((m) => m.revenue), 1);
  const totalTheaterRevenue = Math.max(...data.revenueByTheater.map((t) => t.revenue), 1);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-zinc-400 text-sm mt-1">Revenue, bookings & performance insights</p>
        </div>
        {/* Period selector */}
        <div className="flex gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                period === p.id
                  ? "bg-red-600 text-white shadow"
                  : "text-zinc-400 hover:text-white"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Revenue Today"
          value={formatCurrency(data.summary.today.revenue)}
          icon={DollarSign}
          color="emerald"
          description={`${data.summary.today.bookings} bookings`}
        />
        <StatsCard
          title="This Month"
          value={formatCurrency(data.summary.month.revenue)}
          icon={TrendingUp}
          color="violet"
          description={`${data.summary.month.bookings} bookings`}
        />
        <StatsCard
          title="This Year"
          value={formatCurrency(data.summary.year.revenue)}
          icon={DollarSign}
          color="blue"
          description={`${data.summary.year.bookings} bookings`}
        />
        <StatsCard
          title="All Time"
          value={formatCurrency(data.summary.overall.revenue)}
          icon={Ticket}
          color="amber"
          description={`${data.summary.overall.bookings} total bookings`}
        />
      </div>

      {/* Monthly trend */}
      <div className="glass-card rounded-2xl border border-white/5 p-6">
        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6">
          Monthly Revenue — Last 12 Months
        </h2>
        <div className="flex items-end gap-1.5 h-40">
          {data.monthlyTrend.map((m) => (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group">
              <div className="w-full flex flex-col justify-end h-32 relative">
                {/* Revenue bar */}
                <div
                  className="w-full bg-red-600/80 rounded-t-sm hover:bg-red-500 transition-colors cursor-default"
                  style={{ height: `${(m.revenue / maxRevenue) * 100}%`, minHeight: m.revenue > 0 ? "4px" : "0" }}
                  title={`${m.month}: ${formatCurrency(m.revenue)}`}
                />
              </div>
              <span className="text-[9px] text-zinc-600 font-medium rotate-45 origin-left translate-x-2 whitespace-nowrap">
                {m.month.split(" ")[0]}
              </span>
            </div>
          ))}
        </div>
        {/* Booking count mini bars */}
        <div className="flex items-end gap-1.5 h-8 mt-4 border-t border-zinc-800/50 pt-2">
          {data.monthlyTrend.map((m) => (
            <div key={m.month} className="flex-1 flex flex-col justify-end h-6">
              <div
                className="w-full bg-zinc-700 rounded-sm"
                style={{ height: `${(m.bookings / maxBookings) * 100}%`, minHeight: m.bookings > 0 ? "2px" : "0" }}
                title={`${m.month}: ${m.bookings} bookings`}
              />
            </div>
          ))}
        </div>
        <p className="text-[10px] text-zinc-600 mt-1">Bookings count (gray)</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue by movie */}
        <div className="glass-card rounded-2xl border border-white/5 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Film className="h-4 w-4 text-red-400" />
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Top Movies by Revenue</h2>
          </div>
          <div className="space-y-3">
            {data.topMovies.slice(0, 10).map((movie, i) => (
              <div key={movie.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-zinc-600 font-mono w-4 shrink-0">{i + 1}</span>
                    <span className="text-sm text-zinc-200 font-medium truncate">{movie.title}</span>
                    <span className="text-xs text-zinc-600 shrink-0">{movie.genre}</span>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-sm font-bold text-red-400">{formatCurrency(movie.revenue)}</p>
                    <p className="text-[10px] text-zinc-600">{movie.bookings} bookings</p>
                  </div>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-700 to-red-500 rounded-full"
                    style={{ width: `${(movie.revenue / totalMovieRevenue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {data.topMovies.length === 0 && (
              <p className="text-zinc-600 text-sm text-center py-8">No data yet</p>
            )}
          </div>
        </div>

        {/* Revenue by theater */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl border border-white/5 p-6">
            <div className="flex items-center gap-2 mb-5">
              <MapPin className="h-4 w-4 text-red-400" />
              <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Revenue by Theater</h2>
            </div>
            <div className="space-y-4">
              {data.revenueByTheater.map((theater) => (
                <div key={theater.id}>
                  <div className="flex justify-between items-center mb-1.5">
                    <div>
                      <p className="text-sm font-semibold text-zinc-200">{theater.name}</p>
                      <p className="text-xs text-zinc-500">{theater.city} · {theater.bookings} bookings</p>
                    </div>
                    <p className="text-sm font-bold text-emerald-400">{formatCurrency(theater.revenue)}</p>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-700 to-emerald-500 rounded-full"
                      style={{ width: `${(theater.revenue / totalTheaterRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {data.revenueByTheater.length === 0 && (
                <p className="text-zinc-600 text-sm text-center py-4">No data yet</p>
              )}
            </div>
          </div>

          {/* Revenue by genre */}
          <div className="glass-card rounded-2xl border border-white/5 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Tag className="h-4 w-4 text-red-400" />
              <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Revenue by Genre</h2>
            </div>
            <div className="space-y-2">
              {data.revenueByGenre.slice(0, 6).map((g) => {
                const maxG = data.revenueByGenre[0]?.revenue ?? 1;
                return (
                  <div key={g.genre} className="flex items-center gap-3">
                    <span className="text-xs text-zinc-400 w-20 truncate">{g.genre}</span>
                    <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-500 rounded-full"
                        style={{ width: `${(g.revenue / maxG) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-zinc-400 w-16 text-right">{formatCurrency(g.revenue)}</span>
                  </div>
                );
              })}
              {data.revenueByGenre.length === 0 && (
                <p className="text-zinc-600 text-sm text-center py-4">No data yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
