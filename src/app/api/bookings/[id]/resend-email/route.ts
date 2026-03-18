import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redis } from "@/lib/redis";
import { sendBookingConfirmation } from "@/lib/mail";

export const dynamic = "force-dynamic";

const MAX_RESENDS = 3;
const WINDOW_SECS = 86400; // 24h

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    select: { id: true, userId: true, status: true },
  });

  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (booking.userId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (booking.status !== "CONFIRMED") {
    return NextResponse.json({ error: "Booking is not confirmed" }, { status: 400 });
  }

  // Rate limit: max 3 resends per booking per 24h
  const rateKey = `email_resend:${booking.id}`;
  const count = await redis.incr(rateKey);
  if (count === 1) await redis.expire(rateKey, WINDOW_SECS);
  if (count > MAX_RESENDS) {
    return NextResponse.json(
      { error: "Email already sent recently. Try again tomorrow." },
      { status: 429 }
    );
  }

  try {
    await sendBookingConfirmation(booking.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Resend email failed:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
