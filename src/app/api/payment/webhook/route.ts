import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { unlockAllSeats } from "@/lib/redis";
import { sendBookingConfirmation } from "@/lib/mail";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const bookingId = intent.metadata.bookingId;

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "CONFIRMED",
        payment: {
          update: {
            status: "SUCCESS",
            stripeChargeId: intent.latest_charge as string | undefined,
            paidAt: new Date(),
          },
        },
      },
      include: {
        user: true,
        showtime: {
          include: {
            movie: true,
            hall: { include: { theater: true } },
          },
        },
        bookingSeats: { include: { seat: true } },
      },
    });

    // Release Redis locks
    const seatIds = booking.bookingSeats.map((bs) => bs.seatId);
    await unlockAllSeats(booking.showtimeId, seatIds);

    // Increment promo code usage if one was applied
    const promoCode = intent.metadata.promoCode;
    if (promoCode) {
      await prisma.promoCode.updateMany({
        where: { code: promoCode },
        data: { usedCount: { increment: 1 } },
      });
    }

    // Send confirmation email
    try {
      await sendBookingConfirmation(bookingId);
    } catch (err) {
      console.error("Failed to send confirmation email:", err);
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const intent = event.data.object as Stripe.PaymentIntent;
    const bookingId = intent.metadata.bookingId;

    if (bookingId) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: "CANCELLED",
          payment: {
            update: { status: "FAILED" },
          },
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
