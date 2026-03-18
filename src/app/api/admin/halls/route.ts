import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

const VALID_HALL_TYPES = ["STANDARD", "IMAX", "FOURDX"] as const;
const VALID_SEAT_TYPES = ["STANDARD", "PREMIUM", "RECLINER"] as const;
type SeatType = typeof VALID_SEAT_TYPES[number];

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

// POST /api/admin/halls — create a hall with auto-generated seats
export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { theaterId, name, hallType, rows } = await req.json();

  if (!theaterId || !name?.trim() || !hallType) {
    return NextResponse.json({ error: "theaterId, name, and hallType are required" }, { status: 400 });
  }
  if (!VALID_HALL_TYPES.includes(hallType)) {
    return NextResponse.json({ error: "Invalid hallType" }, { status: 400 });
  }
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "At least one row of seats is required" }, { status: 400 });
  }

  const seatData: { rowLabel: string; seatNumber: number; seatType: SeatType; priceModifier: number }[] = [];
  for (const row of rows) {
    const label: string = row.label?.toUpperCase();
    if (!label) continue;
    const seats: { seatType?: string; priceModifier?: number }[] = row.seats ?? [];
    seats.forEach((s, idx) => {
      const st = VALID_SEAT_TYPES.includes(s.seatType as SeatType) ? (s.seatType as SeatType) : "STANDARD";
      seatData.push({
        rowLabel: label,
        seatNumber: idx + 1,
        seatType: st,
        priceModifier: typeof s.priceModifier === "number" ? s.priceModifier : 1.0,
      });
    });
  }

  if (seatData.length === 0) {
    return NextResponse.json({ error: "No valid seats defined" }, { status: 400 });
  }

  const hall = await prisma.hall.create({
    data: {
      theaterId,
      name: name.trim(),
      hallType,
      totalSeats: seatData.length,
      seats: { create: seatData },
    },
    include: {
      theater: true,
      _count: { select: { seats: true } },
    },
  });

  return NextResponse.json(hall, { status: 201 });
}
