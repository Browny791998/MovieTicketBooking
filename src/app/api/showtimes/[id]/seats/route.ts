import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getShowtimeLockMap } from "@/lib/redis";
import { auth } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const showtimeId = params.id;

  const showtime = await prisma.showtime.findUnique({
    where: { id: showtimeId },
    include: {
      hall: {
        include: {
          seats: { orderBy: [{ rowLabel: "asc" }, { seatNumber: "asc" }] },
        },
      },
      bookings: {
        where: { status: "CONFIRMED" },
        include: { bookingSeats: true },
      },
    },
  });

  if (!showtime) {
    return NextResponse.json({ error: "Showtime not found" }, { status: 404 });
  }

  const session = await auth();
  const currentUserId = session?.user?.id ?? null;

  // STEP 2: Confirmed booked seat IDs
  const bookedSeatIds = new Set(
    showtime.bookings.flatMap((b) => b.bookingSeats.map((bs) => bs.seatId))
  );

  const allSeats = showtime.hall.seats;

  // STEP 3: Fetch all Redis locks for this showtime (index-based, no KEYS scan)
  const lockMap = await getShowtimeLockMap(showtimeId);

  // STEP 5: Build response
  const seats = allSeats.map((seat) => {
    const price = Math.round(showtime.basePrice * seat.priceModifier * 100) / 100;

    if (bookedSeatIds.has(seat.id)) {
      return {
        id: seat.id,
        rowLabel: seat.rowLabel,
        seatNumber: seat.seatNumber,
        seatType: seat.seatType,
        priceModifier: seat.priceModifier,
        price,
        status: "BOOKED" as const,
        lockedByMe: false,
      };
    }

    if (lockMap[seat.id]) {
      const lockedByMe = lockMap[seat.id] === currentUserId;
      return {
        id: seat.id,
        rowLabel: seat.rowLabel,
        seatNumber: seat.seatNumber,
        seatType: seat.seatType,
        priceModifier: seat.priceModifier,
        price,
        status: "LOCKED" as const,
        lockedByMe,
      };
    }

    return {
      id: seat.id,
      rowLabel: seat.rowLabel,
      seatNumber: seat.seatNumber,
      seatType: seat.seatType,
      priceModifier: seat.priceModifier,
      price,
      status: "AVAILABLE" as const,
      lockedByMe: false,
    };
  });

  const total = seats.length;
  const booked = seats.filter((s) => s.status === "BOOKED").length;
  const locked = seats.filter((s) => s.status === "LOCKED").length;
  const available = total - booked - locked;

  return NextResponse.json({
    seats,
    showtime: {
      basePrice: showtime.basePrice,
      hallType: showtime.hall.hallType,
    },
    summary: { total, available, booked, locked },
  });
}
