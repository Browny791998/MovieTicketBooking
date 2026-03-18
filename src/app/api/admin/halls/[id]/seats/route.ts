import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

const VALID_SEAT_TYPES = ["STANDARD", "PREMIUM", "RECLINER"] as const;
type SeatType = typeof VALID_SEAT_TYPES[number];

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

// PUT /api/admin/halls/[id]/seats — replace all seats (rebuild layout)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const hall = await prisma.hall.findUnique({ where: { id: params.id } });
  if (!hall) return NextResponse.json({ error: "Hall not found" }, { status: 404 });

  const activeBookings = await prisma.booking.count({
    where: {
      showtime: { hallId: params.id },
      status: { in: ["CONFIRMED", "PENDING"] },
    },
  });
  if (activeBookings > 0) {
    return NextResponse.json(
      { error: "Cannot modify seats: active bookings exist for this hall" },
      { status: 409 }
    );
  }

  const { rows } = await req.json();
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "rows array is required" }, { status: 400 });
  }

  const seatData: { rowLabel: string; seatNumber: number; seatType: SeatType; priceModifier: number }[] = [];
  for (const row of rows) {
    const label: string = row.label?.toUpperCase();
    if (!label) continue;
    (row.seats ?? []).forEach((s: { seatType?: string; priceModifier?: number }, idx: number) => {
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

  await prisma.$transaction([
    prisma.seat.deleteMany({ where: { hallId: params.id } }),
    prisma.seat.createMany({ data: seatData.map((s) => ({ ...s, hallId: params.id })) }),
    prisma.hall.update({ where: { id: params.id }, data: { totalSeats: seatData.length } }),
  ]);

  const updated = await prisma.hall.findUnique({
    where: { id: params.id },
    include: {
      seats: { orderBy: [{ rowLabel: "asc" }, { seatNumber: "asc" }] },
      theater: true,
    },
  });

  return NextResponse.json(updated);
}
