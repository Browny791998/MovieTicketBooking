import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { startOfDay, endOfDay } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  const dayStart = startOfDay(today);
  const dayEnd = endOfDay(today);

  const [
    totalBookingsToday,
    revenueToday,
    totalMovies,
    totalUsers,
    upcomingShowtimes,
  ] = await Promise.all([
    prisma.booking.count({
      where: {
        status: "CONFIRMED",
        bookedAt: { gte: dayStart, lte: dayEnd },
      },
    }),
    prisma.booking.aggregate({
      where: {
        status: "CONFIRMED",
        bookedAt: { gte: dayStart, lte: dayEnd },
      },
      _sum: { totalAmount: true },
    }),
    prisma.movie.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.showtime.findMany({
      where: {
        status: "SCHEDULED",
        startTime: { gte: today },
      },
      include: {
        movie: true,
        hall: true,
        bookings: {
          where: { status: { in: ["CONFIRMED", "PENDING"] } },
          include: { bookingSeats: true },
        },
      },
      orderBy: { startTime: "asc" },
      take: 10,
    }),
  ]);

  const showtimeOccupancy = upcomingShowtimes.map((s) => {
    const bookedSeats = s.bookings.reduce(
      (sum, b) => sum + b.bookingSeats.length,
      0
    );
    return {
      showtimeId: s.id,
      movieTitle: s.movie.title,
      startTime: s.startTime,
      totalSeats: s.hall.totalSeats,
      bookedSeats,
      occupancyRate:
        s.hall.totalSeats > 0
          ? Math.round((bookedSeats / s.hall.totalSeats) * 100)
          : 0,
    };
  });

  return NextResponse.json({
    totalBookingsToday,
    revenueToday: revenueToday._sum.totalAmount ?? 0,
    totalMovies,
    totalUsers,
    showtimeOccupancy,
  });
}
