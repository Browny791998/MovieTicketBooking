import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      showtime: {
        include: {
          movie: true,
          hall: { include: { theater: true } },
        },
      },
      bookingSeats: { include: { seat: true } },
      payment: true,
    },
  });

  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only allow own bookings unless admin
  if (booking.userId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(booking);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: { payment: true, bookingSeats: true, showtime: true },
  });

  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (booking.userId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (booking.status === "CANCELLED") {
    return NextResponse.json({ error: "Already cancelled" }, { status: 400 });
  }

  // Block cancellation within 30 min of showtime (only for confirmed bookings)
  if (booking.status === "CONFIRMED") {
    const minutesUntilShow = (booking.showtime.startTime.getTime() - Date.now()) / 60000;
    if (minutesUntilShow < 30 && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Cannot cancel within 30 minutes of showtime" },
        { status: 400 }
      );
    }
  }

  // Issue Stripe refund if payment succeeded
  if (booking.payment?.stripeIntentId && booking.payment.status === "SUCCESS") {
    const { stripe } = await import("@/lib/stripe");
    try {
      const intent = await stripe.paymentIntents.retrieve(booking.payment.stripeIntentId);
      if (intent.latest_charge) {
        await stripe.refunds.create({ charge: intent.latest_charge as string });
      }
      await prisma.payment.update({
        where: { bookingId: booking.id },
        data: { status: "REFUNDED" },
      });
    } catch (err) {
      console.error("Refund failed:", err);
    }
  }

  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: "CANCELLED" },
  });

  return NextResponse.json({ success: true });
}
