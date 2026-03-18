import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const movieId = searchParams.get("movieId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const bookings = await prisma.booking.findMany({
    where: {
      ...(status ? { status: status as "PENDING" | "CONFIRMED" | "CANCELLED" } : {}),
      ...(movieId ? { showtime: { movieId } } : {}),
      ...(from || to
        ? {
            bookedAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      showtime: {
        include: {
          movie: true,
          hall: { include: { theater: true } },
        },
      },
      bookingSeats: { include: { seat: true } },
      payment: true,
    },
    orderBy: { bookedAt: "desc" },
  });

  return NextResponse.json(bookings);
}
