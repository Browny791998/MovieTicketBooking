import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  startOfDay, endOfDay,
  startOfMonth, endOfMonth,
  startOfYear, endOfYear,
  subMonths, format,
} from "date-fns";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Date ranges
  const ranges = {
    today:   { gte: startOfDay(now),   lte: endOfDay(now) },
    month:   { gte: startOfMonth(now), lte: endOfMonth(now) },
    year:    { gte: startOfYear(now),  lte: endOfYear(now) },
    overall: undefined,
  };

  // --- Top-level revenue summaries ---
  const [todayAgg, monthAgg, yearAgg, overallAgg] = await Promise.all([
    prisma.booking.aggregate({ where: { status: "CONFIRMED", bookedAt: ranges.today   }, _sum: { totalAmount: true }, _count: true }),
    prisma.booking.aggregate({ where: { status: "CONFIRMED", bookedAt: ranges.month   }, _sum: { totalAmount: true }, _count: true }),
    prisma.booking.aggregate({ where: { status: "CONFIRMED", bookedAt: ranges.year    }, _sum: { totalAmount: true }, _count: true }),
    prisma.booking.aggregate({ where: { status: "CONFIRMED" },                           _sum: { totalAmount: true }, _count: true }),
  ]);

  // --- Monthly trend: last 12 months ---
  const monthlyTrend = await Promise.all(
    Array.from({ length: 12 }, (_, i) => {
      const d = subMonths(now, 11 - i);
      return prisma.booking.aggregate({
        where: {
          status: "CONFIRMED",
          bookedAt: { gte: startOfMonth(d), lte: endOfMonth(d) },
        },
        _sum: { totalAmount: true },
        _count: true,
      }).then((r) => ({
        month: format(d, "MMM yyyy"),
        revenue: r._sum.totalAmount ?? 0,
        bookings: r._count,
      }));
    })
  );

  // --- Revenue by movie ---
  const bookingsByMovie = await prisma.booking.groupBy({
    by: ["showtimeId"],
    where: { status: "CONFIRMED" },
    _sum: { totalAmount: true },
    _count: true,
  });

  const showtimeIds = bookingsByMovie.map((b) => b.showtimeId);
  const showtimes = await prisma.showtime.findMany({
    where: { id: { in: showtimeIds } },
    include: { movie: { select: { id: true, title: true, genre: true } } },
  });

  const movieMap = new Map<string, { id: string; title: string; genre: string }>();
  showtimes.forEach((s) => movieMap.set(s.id, s.movie));

  const revenueByMovie = new Map<string, { id: string; title: string; genre: string; revenue: number; bookings: number }>();
  for (const b of bookingsByMovie) {
    const movie = movieMap.get(b.showtimeId);
    if (!movie) continue;
    const existing = revenueByMovie.get(movie.id);
    if (existing) {
      existing.revenue += b._sum.totalAmount ?? 0;
      existing.bookings += b._count;
    } else {
      revenueByMovie.set(movie.id, {
        id: movie.id,
        title: movie.title,
        genre: movie.genre,
        revenue: b._sum.totalAmount ?? 0,
        bookings: b._count,
      });
    }
  }
  const topMovies = Array.from(revenueByMovie.values())
    .sort((a, b) => b.revenue - a.revenue);

  // --- Revenue by theater ---
  const allBookings = await prisma.booking.findMany({
    where: { status: "CONFIRMED" },
    select: {
      totalAmount: true,
      showtime: {
        select: {
          hall: { select: { theater: { select: { id: true, name: true, city: true } } } },
        },
      },
    },
  });

  const theaterMap = new Map<string, { id: string; name: string; city: string; revenue: number; bookings: number }>();
  for (const b of allBookings) {
    const t = b.showtime.hall.theater;
    const existing = theaterMap.get(t.id);
    if (existing) {
      existing.revenue += b.totalAmount;
      existing.bookings++;
    } else {
      theaterMap.set(t.id, { id: t.id, name: t.name, city: t.city ?? "", revenue: b.totalAmount, bookings: 1 });
    }
  }
  const revenueByTheater = Array.from(theaterMap.values()).sort((a, b) => b.revenue - a.revenue);

  // --- Revenue by genre ---
  const genreMap = new Map<string, { revenue: number; bookings: number }>();
  for (const m of topMovies) {
    const g = m.genre || "Unknown";
    const ex = genreMap.get(g);
    if (ex) { ex.revenue += m.revenue; ex.bookings += m.bookings; }
    else genreMap.set(g, { revenue: m.revenue, bookings: m.bookings });
  }
  const revenueByGenre = Array.from(genreMap.entries())
    .map(([genre, v]) => ({ genre, ...v }))
    .sort((a, b) => b.revenue - a.revenue);

  return NextResponse.json({
    summary: {
      today:   { revenue: todayAgg._sum.totalAmount ?? 0,   bookings: todayAgg._count },
      month:   { revenue: monthAgg._sum.totalAmount ?? 0,   bookings: monthAgg._count },
      year:    { revenue: yearAgg._sum.totalAmount ?? 0,    bookings: yearAgg._count },
      overall: { revenue: overallAgg._sum.totalAmount ?? 0, bookings: overallAgg._count },
    },
    monthlyTrend,
    topMovies,
    revenueByTheater,
    revenueByGenre,
  });
}
