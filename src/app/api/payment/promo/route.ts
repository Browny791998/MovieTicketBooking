import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code, bookingId } = await req.json();
  if (!code || !bookingId) {
    return NextResponse.json({ error: "code and bookingId required" }, { status: 400 });
  }

  const promo = await prisma.promoCode.findUnique({
    where: { code: code.toUpperCase().trim() },
  });

  if (!promo || !promo.active) {
    return NextResponse.json({ error: "Invalid promo code" }, { status: 404 });
  }

  // Expiry check
  if (promo.expiresAt && promo.expiresAt < new Date()) {
    return NextResponse.json({ error: "Promo code has expired" }, { status: 400 });
  }

  // Max uses check
  if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
    return NextResponse.json({ error: "Promo code usage limit reached" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId, userId: session.user.id },
    include: { showtime: { include: { hall: true } } },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  // Hall type scope restriction
  if (promo.scope !== "ALL" && booking.showtime.hall.hallType !== promo.scope) {
    return NextResponse.json(
      { error: `This code is only valid for ${promo.scope} screenings` },
      { status: 400 }
    );
  }

  // Min amount check
  if (booking.totalAmount < promo.minAmount) {
    return NextResponse.json(
      { error: `Minimum order of $${promo.minAmount.toFixed(2)} required` },
      { status: 400 }
    );
  }

  const baseTotal = booking.totalAmount;
  let discountAmount = 0;

  if (promo.type === "PERCENTAGE") {
    discountAmount = Math.round(baseTotal * (promo.value / 100) * 100) / 100;
  } else {
    discountAmount = Math.min(promo.value, baseTotal);
  }

  const finalAmount = Math.max(baseTotal - discountAmount, 0);

  return NextResponse.json({
    valid: true,
    description: promo.description,
    discountAmount,
    finalAmount,
  });
}
