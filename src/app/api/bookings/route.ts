import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getSeatLocks } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = session.user.role === "ADMIN";
  const meOnly = req.nextUrl.searchParams.get("me") === "1";

  const bookings = await prisma.booking.findMany({
    where: isAdmin && !meOnly ? {} : { userId: session.user.id },
    include: {
      showtime: {
        include: {
          movie: true,
          hall: { include: { theater: true } },
        },
      },
      bookingSeats: { include: { seat: true } },
      payment: true,
      user: isAdmin,
    },
    orderBy: { bookedAt: "desc" },
  });

  return NextResponse.json(bookings);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { showtimeId, seatIds } = await req.json();

  if (!showtimeId || !Array.isArray(seatIds) || seatIds.length === 0) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (seatIds.length > 8) {
    return NextResponse.json({ error: "Max 8 seats per booking" }, { status: 400 });
  }

  const userId = session.user.id;

  // Fetch showtime
  const showtime = await prisma.showtime.findUnique({
    where: { id: showtimeId },
    include: { hall: { include: { seats: { where: { id: { in: seatIds } } } } } },
  });

  if (!showtime) {
    return NextResponse.json({ error: "Showtime not found" }, { status: 404 });
  }
  if (showtime.status !== "SCHEDULED") {
    return NextResponse.json({ error: "Showtime is not available" }, { status: 400 });
  }

  // Validate all seatIds belong to this showtime's hall
  if (showtime.hall.seats.length !== seatIds.length) {
    return NextResponse.json(
      { error: "One or more seats do not belong to this showtime" },
      { status: 400 }
    );
  }

  // Validate all seats have Redis lock owned by current user (single MGET)
  const lockOwners = await getSeatLocks(showtimeId, seatIds);
  const lockChecks = seatIds.map((seatId: string) => ({
    seatId,
    lockOwner: lockOwners[seatId],
  }));

  const unlockedSeats = lockChecks.filter((c) => c.lockOwner !== userId);
  if (unlockedSeats.length > 0) {
    return NextResponse.json(
      { error: "Seat lock expired, please reselect", code: "LOCK_EXPIRED" },
      { status: 409 }
    );
  }

  // Validate none of the seats are CONFIRMED booked
  const alreadyBooked = await prisma.bookingSeat.findFirst({
    where: {
      seatId: { in: seatIds },
      booking: { showtimeId, status: "CONFIRMED" },
    },
  });
  if (alreadyBooked) {
    return NextResponse.json(
      { error: "One or more seats are already booked" },
      { status: 409 }
    );
  }

  const seats = showtime.hall.seats;

  // Calculate total: sum of (basePrice × priceModifier) rounded to cents + $2 booking fee
  const seatsTotal = seats.reduce(
    (sum, seat) => sum + Math.round(showtime.basePrice * seat.priceModifier * 100) / 100,
    0
  );
  const bookingFee = 2;
  const totalAmount = seatsTotal + bookingFee;

  // Prisma transaction: create booking + booking seats
  const booking = await prisma.booking.create({
    data: {
      userId,
      showtimeId,
      totalAmount,
      bookingSeats: {
        create: seats.map((seat) => ({
          seatId: seat.id,
          price: Math.round(showtime.basePrice * seat.priceModifier * 100) / 100,
        })),
      },
    },
    include: {
      bookingSeats: { include: { seat: true } },
      showtime: { include: { movie: true, hall: { include: { theater: true } } } },
    },
  });

  return NextResponse.json(
    {
      bookingId: booking.id,
      totalAmount: booking.totalAmount,
      seats: booking.bookingSeats.map((bs) => ({
        seatId: bs.seatId,
        rowLabel: bs.seat.rowLabel,
        seatNumber: bs.seat.seatNumber,
        seatType: bs.seat.seatType,
        price: bs.price,
      })),
    },
    { status: 201 }
  );
}
