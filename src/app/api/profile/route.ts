import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const [user, bookings] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, createdAt: true, image: true },
    }),
    prisma.booking.findMany({
      where: { userId },
      include: {
        showtime: { include: { movie: true } },
        payment: { select: { amount: true, status: true } },
      },
    }),
  ]);

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const confirmed = bookings.filter((b) => b.status === "CONFIRMED");
  const upcoming = confirmed.filter((b) => new Date(b.showtime.startTime) >= new Date());
  const totalSpent = bookings
    .filter((b) => b.payment?.status === "SUCCESS")
    .reduce((sum, b) => sum + (b.payment?.amount ?? 0), 0);

  // Favorite genre: most common genre from confirmed bookings
  const genreCounts: Record<string, number> = {};
  for (const b of confirmed) {
    const genre = b.showtime.movie.genre;
    genreCounts[genre] = (genreCounts[genre] ?? 0) + 1;
  }
  const favoriteGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return NextResponse.json({
    user,
    stats: {
      totalBookings: confirmed.length,
      totalSpent,
      upcomingCount: upcoming.length,
      favoriteGenre,
    },
  });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await req.json();

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 50) {
    return NextResponse.json({ error: "Name must be 2–50 characters" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: { name: trimmed },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  return NextResponse.json(updated);
}
