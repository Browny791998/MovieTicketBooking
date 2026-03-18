import { prisma } from "@/lib/prisma";
import { StatsCard } from "@/components/admin/StatsCard";
import { formatCurrency, formatTime, formatDate } from "@/lib/utils";
import { Ticket, DollarSign, Film, Users, TrendingUp, CalendarDays, BarChart3 } from "lucide-react";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const today = new Date();
  const dayStart = startOfDay(today);
  const dayEnd = endOfDay(today);
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const yearStart = startOfYear(today);
  const yearEnd = endOfYear(today);

  const [
    bookingsToday, revenueToday,
    bookingsMonth, revenueMonth,
    bookingsYear, revenueYear,
    revenueOverall, bookingsOverall,
    totalMovies, totalUsers, showtimes,
  ] = await Promise.all([
    prisma.booking.count({
      where: { status: "CONFIRMED", bookedAt: { gte: dayStart, lte: dayEnd } },
    }),
    prisma.booking.aggregate({
      where: { status: "CONFIRMED", bookedAt: { gte: dayStart, lte: dayEnd } },
      _sum: { totalAmount: true },
    }),
    prisma.booking.count({
      where: { status: "CONFIRMED", bookedAt: { gte: monthStart, lte: monthEnd } },
    }),
    prisma.booking.aggregate({
      where: { status: "CONFIRMED", bookedAt: { gte: monthStart, lte: monthEnd } },
      _sum: { totalAmount: true },
    }),
    prisma.booking.count({
      where: { status: "CONFIRMED", bookedAt: { gte: yearStart, lte: yearEnd } },
    }),
    prisma.booking.aggregate({
      where: { status: "CONFIRMED", bookedAt: { gte: yearStart, lte: yearEnd } },
      _sum: { totalAmount: true },
    }),
    prisma.booking.aggregate({
      where: { status: "CONFIRMED" },
      _sum: { totalAmount: true },
    }),
    prisma.booking.count({ where: { status: "CONFIRMED" } }),
    prisma.movie.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.showtime.findMany({
      where: { status: "SCHEDULED", startTime: { gte: today } },
      include: {
        movie: true,
        hall: true,
        bookings: {
          where: { status: { in: ["CONFIRMED", "PENDING"] } },
          include: { bookingSeats: true },
        },
      },
      orderBy: { startTime: "asc" },
      take: 8,
    }),
  ]);

  return {
    bookingsToday, revenueToday,
    bookingsMonth, revenueMonth,
    bookingsYear, revenueYear,
    revenueOverall, bookingsOverall,
    totalMovies, totalUsers, showtimes,
  };
}

export default async function AdminDashboard() {
  const {
    bookingsToday, revenueToday,
    bookingsMonth, revenueMonth,
    bookingsYear, revenueYear,
    revenueOverall, bookingsOverall,
    totalMovies, totalUsers, showtimes,
  } = await getDashboardData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-400 text-sm mt-1">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Today Stats */}
      <div>
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Today</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Bookings Today"
            value={bookingsToday}
            icon={Ticket}
            color="violet"
          />
          <StatsCard
            title="Revenue Today"
            value={formatCurrency(revenueToday._sum.totalAmount ?? 0)}
            icon={DollarSign}
            color="emerald"
          />
          <StatsCard
            title="Total Movies"
            value={totalMovies}
            icon={Film}
            color="blue"
          />
          <StatsCard
            title="Registered Users"
            value={totalUsers}
            icon={Users}
            color="amber"
          />
        </div>
      </div>

      {/* Monthly Stats */}
      <div>
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">
          This Month — {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Monthly Bookings"
            value={bookingsMonth}
            icon={CalendarDays}
            color="violet"
          />
          <StatsCard
            title="Monthly Revenue"
            value={formatCurrency(revenueMonth._sum.totalAmount ?? 0)}
            icon={TrendingUp}
            color="emerald"
          />
          <StatsCard
            title="Yearly Bookings"
            value={bookingsYear}
            icon={BarChart3}
            color="blue"
          />
          <StatsCard
            title="Yearly Revenue"
            value={formatCurrency(revenueYear._sum.totalAmount ?? 0)}
            icon={DollarSign}
            color="amber"
          />
        </div>
      </div>

      {/* All-time Stats */}
      <div>
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">All Time</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatsCard
            title="Total Confirmed Bookings"
            value={bookingsOverall}
            icon={Ticket}
            color="violet"
            description="All-time confirmed bookings"
          />
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(revenueOverall._sum.totalAmount ?? 0)}
            icon={DollarSign}
            color="emerald"
            description="All-time revenue from confirmed bookings"
          />
        </div>
      </div>

      {/* Upcoming showtimes occupancy */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">
          Upcoming Occupancy
        </h2>
        <div className="glass-card overflow-hidden rounded-[24px] border border-white/5 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-4 text-left font-bold text-zinc-400 uppercase tracking-widest text-[10px]">Movie</th>
                  <th className="px-6 py-4 text-left font-bold text-zinc-400 uppercase tracking-widest text-[10px]">Date & Time</th>
                  <th className="px-6 py-4 text-left font-bold text-zinc-400 uppercase tracking-widest text-[10px]">Hall</th>
                  <th className="px-6 py-4 text-left font-bold text-zinc-400 uppercase tracking-widest text-[10px]">Occupancy Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {showtimes.map((st) => {
                  const bookedSeats = st.bookings.reduce(
                    (sum, b) => sum + b.bookingSeats.length,
                    0
                  );
                  const rate = st.hall.totalSeats > 0
                    ? Math.round((bookedSeats / st.hall.totalSeats) * 100)
                    : 0;
                  return (
                    <tr key={st.id} className="premium-table-row group">
                      <td className="px-6 py-4">
                        <span className="font-bold text-zinc-100 group-hover:text-white transition-colors uppercase tracking-tight">{st.movie.title}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs">
                          <p className="text-zinc-300 font-bold">{formatDate(st.startTime)}</p>
                          <p className="text-zinc-500">{formatTime(st.startTime)}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-400 font-medium">
                        {st.hall.name}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="flex-1 h-2 bg-zinc-800/50 rounded-full max-w-[140px] overflow-hidden border border-white/5">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-1000",
                                rate > 80 ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" :
                                  rate > 50 ? "bg-amber-500" : "bg-emerald-500"
                              )}
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-white font-black text-xs leading-none">
                              {rate}%
                            </span>
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">
                              {bookedSeats}/{st.hall.totalSeats}
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {showtimes.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-zinc-500 italic">
                      No upcoming showtimes scheduled
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
