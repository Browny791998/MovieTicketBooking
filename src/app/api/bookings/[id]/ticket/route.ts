import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { buildQRPayload, generateQRBuffer } from "@/lib/qr";
import type { BookingWithDetails } from "@/types";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      showtime: { include: { movie: true, hall: { include: { theater: true } } } },
      bookingSeats: { include: { seat: true } },
      payment: true,
    },
  });

  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (booking.userId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (booking.status !== "CONFIRMED") {
    return NextResponse.json({ error: "Booking is not confirmed" }, { status: 400 });
  }

  const format = req.nextUrl.searchParams.get("format") ?? "qr";
  const payload = buildQRPayload(booking as unknown as BookingWithDetails);

  if (format === "json") {
    return NextResponse.json(payload);
  }

  // format=qr (default) — return PNG image
  const buffer = await generateQRBuffer(payload);
  const ref = payload.ref;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="ticket-${ref}.png"`,
      "Cache-Control": "no-store",
    },
  });
}
