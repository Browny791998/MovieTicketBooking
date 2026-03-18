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
        today: { revenue: number; bookings: number };
        month: { revenue: number; bookings: number };
        year: { revenue: number; bookings: number };
        overall: { revenue: number; bookings: number };
    };
    monthlyTrend: { month: string; revenue: number; bookings: number }[];
    topMovies: { id: string; title: string; genre: string; revenue: number; bookings: number }[];
    revenueByTheater: { id: string; name: string; city: string; revenue: number; bookings: number }[];
    revenueByGenre: { genre: string; revenue: number; bookings: number }[];
}

export default function AnalyticsClient() {
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
                    <h1 className="text-2xl font-bold text-white uppercase italic tracking-tighter">Analytics</h1>
                    <p className="text-zinc-600 font-bold uppercase tracking-widest text-[10px] opacity-70 mt-1">Real-time performance metrics</p>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-32 rounded-[24px] bg-white/[0.02] animate-pulse border border-white/5" />
                    ))}
                </div>
            </div>
        );
    }

    if (!data) return null;

    const PERIODS: { id: Period; label: string }[] = [
        { id: "today", label: "Today" },
        { id: "month", label: "This Month" },
        { id: "year", label: "This Year" },
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
                    <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">Analytics</h1>
                    <p className="text-zinc-600 font-bold uppercase tracking-widest text-[10px] opacity-70 mt-1">Real-time performance metrics</p>
                </div>
                {/* Period selector */}
                <div className="flex gap-1 p-1 rounded-2xl bg-white/[0.03] border border-white/5 shadow-2xl">
                    {PERIODS.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => setPeriod(p.id)}
                            className={cn(
                                "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                period === p.id
                                    ? "bg-red-600 text-white shadow-[0_4px_12px_rgba(220,38,38,0.4)]"
                                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
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
            <div className="glass-card rounded-[32px] border border-white/5 p-8 shadow-2xl">
                <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-8">
                    Revenue Trend — Last 12 Months
                </h2>
                <div className="flex items-end gap-2 h-48">
                    {data.monthlyTrend.map((m) => (
                        <div key={m.month} className="flex-1 flex flex-col items-center gap-2 group">
                            <div className="w-full flex flex-col justify-end h-40 relative">
                                {/* Revenue bar */}
                                <div
                                    className="w-full bg-gradient-to-t from-red-700/80 to-red-500/80 rounded-t-lg hover:from-white/20 hover:to-white/10 transition-all duration-300 cursor-default relative group"
                                    style={{ height: `${(m.revenue / maxRevenue) * 100}%`, minHeight: m.revenue > 0 ? "8px" : "1px" }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                        {formatCurrency(m.revenue)}
                                    </div>
                                </div>
                            </div>
                            <span className="text-[9px] text-zinc-600 font-black uppercase tracking-tighter rotate-0 whitespace-nowrap opacity-60">
                                {m.month.split(" ")[0]}
                            </span>
                        </div>
                    ))}
                </div>
                {/* Booking count mini bars */}
                <div className="flex items-end gap-2 h-10 mt-6 border-t border-white/5 pt-4">
                    {data.monthlyTrend.map((m) => (
                        <div key={m.month} className="flex-1 flex flex-col justify-end h-6">
                            <div
                                className="w-full bg-zinc-800 rounded-sm opacity-40 group-hover:opacity-100 transition-opacity"
                                style={{ height: `${(m.bookings / maxBookings) * 100}%`, minHeight: m.bookings > 0 ? "2px" : "0" }}
                                title={`${m.month}: ${m.bookings} bookings`}
                            />
                        </div>
                    ))}
                </div>
                <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest mt-2">Bookings Volume (Relative)</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Revenue by movie */}
                <div className="glass-card rounded-[32px] border border-white/5 p-8 shadow-2xl">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 rounded-xl bg-red-600/10 border border-red-500/20">
                            <Film className="h-4 w-4 text-red-400" />
                        </div>
                        <h2 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Top Performers</h2>
                    </div>
                    <div className="space-y-6">
                        {data.topMovies.slice(0, 8).map((movie, i) => (
                            <div key={movie.id} className="group">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className="text-[10px] text-zinc-700 font-black w-4 shrink-0 transition-colors group-hover:text-red-500">{(i + 1).toString().padStart(2, '0')}</span>
                                        <span className="text-sm text-zinc-200 font-bold truncate tracking-tight">{movie.title}</span>
                                    </div>
                                    <div className="text-right shrink-0 ml-2">
                                        <p className="text-sm font-black text-red-500 italic">{formatCurrency(movie.revenue)}</p>
                                    </div>
                                </div>
                                <div className="h-1.5 bg-white/[0.03] rounded-full overflow-hidden border border-white/5">
                                    <div
                                        className="h-full bg-gradient-to-r from-red-800 to-red-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${(movie.revenue / totalMovieRevenue) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                        {data.topMovies.length === 0 && (
                            <div className="text-center py-12 opacity-30">
                                <Film className="h-8 w-8 mx-auto mb-2" />
                                <p className="text-xs font-bold uppercase tracking-widest">No data collected</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right column */}
                <div className="space-y-6">
                    <div className="glass-card rounded-[32px] border border-white/5 p-8 shadow-2xl">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 rounded-xl bg-emerald-600/10 border border-emerald-500/20">
                                <MapPin className="h-4 w-4 text-emerald-400" />
                            </div>
                            <h2 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Theater Ranking</h2>
                        </div>
                        <div className="space-y-6">
                            {data.revenueByTheater.map((theater) => (
                                <div key={theater.id}>
                                    <div className="flex justify-between items-center mb-2">
                                        <div>
                                            <p className="text-sm font-bold text-zinc-200 tracking-tight">{theater.name}</p>
                                            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{theater.city}</p>
                                        </div>
                                        <p className="text-sm font-black text-emerald-500 italic ">{formatCurrency(theater.revenue)}</p>
                                    </div>
                                    <div className="h-1.5 bg-white/[0.03] rounded-full overflow-hidden border border-white/5">
                                        <div
                                            className="h-full bg-gradient-to-r from-emerald-800 to-emerald-500 rounded-full"
                                            style={{ width: `${(theater.revenue / totalTheaterRevenue) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                            {data.revenueByTheater.length === 0 && (
                                <p className="text-zinc-600 text-sm font-bold text-center py-8">— Empty —</p>
                            )}
                        </div>
                    </div>

                    {/* Revenue by genre */}
                    <div className="glass-card rounded-[32px] border border-white/5 p-8 shadow-2xl">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 rounded-xl bg-violet-600/10 border border-violet-500/20">
                                <Tag className="h-4 w-4 text-violet-400" />
                            </div>
                            <h2 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Genre Performance</h2>
                        </div>
                        <div className="space-y-4">
                            {data.revenueByGenre.slice(0, 6).map((g) => {
                                const maxG = data.revenueByGenre[0]?.revenue ?? 1;
                                return (
                                    <div key={g.genre} className="flex items-center gap-4">
                                        <span className="text-[10px] font-black text-zinc-500 uppercase w-20 truncate tracking-widest leading-none">{g.genre}</span>
                                        <div className="flex-1 h-1.5 bg-white/[0.03] rounded-full overflow-hidden border border-white/5 shadow-inner">
                                            <div
                                                className="h-full bg-gradient-to-r from-violet-700 to-violet-500 rounded-full"
                                                style={{ width: `${(g.revenue / maxG) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-black text-zinc-300 w-16 text-right italic">{formatCurrency(g.revenue)}</span>
                                    </div>
                                );
                            })}
                            {data.revenueByGenre.length === 0 && (
                                <p className="text-zinc-600 text-[10px] font-black text-center py-4 uppercase">No data</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
