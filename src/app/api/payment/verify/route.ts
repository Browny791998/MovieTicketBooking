import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateQRCode } from "@/lib/qr";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bookingId, paymentIntentId, generateQR } = await req.json();

  if (generateQR && bookingId) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const qrCode = await generateQRCode({
      bookingId: booking.id,
      userId: booking.userId,
      showtimeId: booking.showtimeId,
    });
    return NextResponse.json({ qrCode });
  }

  if (!paymentIntentId) {
    return NextResponse.json({ error: "paymentIntentId required" }, { status: 400 });
  }

  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);

  const booking = await prisma.booking.findFirst({
    where: { payment: { stripeIntentId: paymentIntentId } },
    include: {
      showtime: { include: { movie: true, hall: { include: { theater: true } } } },
      bookingSeats: { include: { seat: true } },
      payment: true,
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json({
    booking,
    paymentStatus: intent.status,
    confirmed: booking.status === "CONFIRMED",
  });
}
