import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redis, seatLockKey } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bookingId, promoCode } = await req.json();
  if (!bookingId) {
    return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId, userId: session.user.id },
    include: {
      payment: true,
      bookingSeats: { include: { seat: true } },
      showtime: { include: { movie: true, hall: { include: { theater: true } } } },
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (booking.status === "CANCELLED") {
    return NextResponse.json({ error: "Booking is cancelled" }, { status: 400 });
  }

  // Re-validate Redis locks are still held
  const lockChecks = await Promise.all(
    booking.bookingSeats.map(async (bs) => {
      const key = seatLockKey(booking.showtimeId, bs.seatId);
      const owner = await redis.get(key);
      return owner === session.user.id;
    })
  );
  if (lockChecks.some((ok) => !ok)) {
    return NextResponse.json(
      { error: "Seat lock expired. Please reselect your seats.", code: "LOCK_EXPIRED" },
      { status: 409 }
    );
  }

  // Return existing intent if still usable
  if (booking.payment?.stripeIntentId) {
    const existing = await stripe.paymentIntents.retrieve(booking.payment.stripeIntentId);
    if (
      existing.status === "requires_payment_method" ||
      existing.status === "requires_confirmation"
    ) {
      return NextResponse.json({
        clientSecret: existing.client_secret,
        totalAmount: booking.totalAmount,
        discountAmount: 0,
        finalAmount: booking.totalAmount,
      });
    }
  }

  // Apply promo code from DB
  let discountAmount = 0;
  const baseTotal = booking.totalAmount;

  if (promoCode) {
    const code = (promoCode as string).toUpperCase().trim();
    const promo = await prisma.promoCode.findUnique({ where: { code } });

    if (
      promo &&
      promo.active &&
      (!promo.expiresAt || promo.expiresAt >= new Date()) &&
      (promo.maxUses === null || promo.usedCount < promo.maxUses) &&
      (promo.scope === "ALL" || promo.scope === booking.showtime.hall.hallType) &&
      baseTotal >= promo.minAmount
    ) {
      if (promo.type === "PERCENTAGE") {
        discountAmount = Math.round(baseTotal * (promo.value / 100) * 100) / 100;
      } else {
        discountAmount = Math.min(promo.value, baseTotal);
      }
    }
  }

  const finalAmount = Math.max(baseTotal - discountAmount, 0);

  // USD — amount in cents
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(finalAmount * 100),
    currency: "usd",
    metadata: {
      bookingId: booking.id,
      userId: session.user.id,
      promoCode: promoCode ?? "",
      discountAmount: String(discountAmount),
    },
    description: `Dat Shin Cinema — ${booking.showtime.movie.title}`,
  });

  await prisma.payment.upsert({
    where: { bookingId: booking.id },
    create: {
      bookingId: booking.id,
      stripeIntentId: paymentIntent.id,
      amount: finalAmount,
      status: "PENDING",
    },
    update: {
      stripeIntentId: paymentIntent.id,
      amount: finalAmount,
      status: "PENDING",
    },
  });

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    totalAmount: baseTotal,
    discountAmount,
    finalAmount,
  });
}
