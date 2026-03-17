import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserLocksForShowtime, unlockSeat } from "@/lib/redis";

// GET — get current user's locked seats for a showtime
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const showtimeId = req.nextUrl.searchParams.get("showtimeId");
  if (!showtimeId) {
    return NextResponse.json({ error: "showtimeId required" }, { status: 400 });
  }

  const userId = session.user.id;
  const lockedSeats = await getUserLocksForShowtime(showtimeId, userId);

  return NextResponse.json({ lockedSeats });
}

// DELETE — release ALL locks for current user + showtime
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { showtimeId } = await req.json();
  if (!showtimeId) {
    return NextResponse.json({ error: "showtimeId required" }, { status: 400 });
  }

  const userId = session.user.id;

  // Get all seats locked by this user for this showtime
  const userLocks = await getUserLocksForShowtime(showtimeId, userId);

  if (userLocks.length === 0) {
    return NextResponse.json({ released: 0 });
  }

  // Release each lock (atomic Lua check-and-delete + SREM from index)
  await Promise.all(
    userLocks.map(({ seatId }) => unlockSeat(showtimeId, seatId, userId))
  );

  return NextResponse.json({ released: userLocks.length });
}
