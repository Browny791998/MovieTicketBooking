import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  redis,
  seatLockKey,
  lockSeat,
  unlockSeat,
  refreshSeatLock,
  getUserLocksForShowtime,
  SEAT_LOCK_TTL,
} from "@/lib/redis";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// POST — lock a seat (atomic NX)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { showtimeId, seatId } = await req.json();
  if (!showtimeId || !seatId) {
    return NextResponse.json({ error: "showtimeId and seatId required" }, { status: 400 });
  }

  const userId = session.user.id;

  // Validate seat belongs to showtime's hall
  const showtime = await prisma.showtime.findUnique({
    where: { id: showtimeId },
    include: { hall: { include: { seats: { where: { id: seatId } } } } },
  });
  if (!showtime) {
    return NextResponse.json({ error: "Showtime not found" }, { status: 404 });
  }
  if (showtime.hall.seats.length === 0) {
    return NextResponse.json({ error: "Seat does not belong to this showtime" }, { status: 400 });
  }

  // Check seat not already CONFIRMED booked
  const existingBooking = await prisma.bookingSeat.findFirst({
    where: { seatId, booking: { showtimeId, status: "CONFIRMED" } },
  });
  if (existingBooking) {
    return NextResponse.json({ error: "Seat is already booked", code: "SEAT_BOOKED" }, { status: 409 });
  }

  // Count user's current locks for this showtime (index-based, no KEYS scan)
  const userLocks = await getUserLocksForShowtime(showtimeId, userId);
  if (userLocks.length >= 8) {
    return NextResponse.json({ error: "Max 8 seats per booking" }, { status: 400 });
  }

  const key = seatLockKey(showtimeId, seatId);

  // Try to acquire the lock via helper (SET NX EX + index SADD)
  const acquired = await lockSeat(showtimeId, seatId, userId);

  if (!acquired) {
    // Key already exists — check if owned by current user
    const existingUserId = await redis.get(key);
    if (existingUserId === userId) {
      // Refresh TTL for current user's re-selection
      await refreshSeatLock(showtimeId, seatId, userId);
      return NextResponse.json({ success: true, expiresIn: SEAT_LOCK_TTL });
    }
    return NextResponse.json(
      { error: "Seat just taken", code: "SEAT_TAKEN" },
      { status: 409 }
    );
  }

  return NextResponse.json({ success: true, expiresIn: SEAT_LOCK_TTL });
}

// DELETE — unlock a single seat
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { showtimeId, seatId } = await req.json();
  if (!showtimeId || !seatId) {
    return NextResponse.json({ error: "showtimeId and seatId required" }, { status: 400 });
  }

  const userId = session.user.id;
  const released = await unlockSeat(showtimeId, seatId, userId);

  if (!released) {
    return NextResponse.json({ error: "You do not own this lock" }, { status: 403 });
  }

  return NextResponse.json({ success: true });
}
