import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  movieId: z.string().min(1, "Movie is required"),
  hallId: z.string().min(1, "Hall is required"),
  startTime: z.string().min(1, "Start time is required"),
  basePrice: z.coerce.number().min(1, "Base price must be at least 1"),
});

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const showtimes = await prisma.showtime.findMany({
    include: {
      movie: true,
      hall: { include: { theater: true } },
      _count: { select: { bookings: true } },
    },
    orderBy: { startTime: "asc" },
  });
  return NextResponse.json(showtimes);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const startTime = new Date(parsed.data.startTime);

  // Check for scheduling conflict in the same hall
  const conflict = await prisma.showtime.findFirst({
    where: {
      hallId: parsed.data.hallId,
      status: "SCHEDULED",
      startTime: {
        gte: new Date(startTime.getTime() - 3 * 60 * 60 * 1000), // 3h before
        lte: new Date(startTime.getTime() + 3 * 60 * 60 * 1000), // 3h after
      },
    },
    include: { movie: true },
  });

  if (conflict) {
    return NextResponse.json(
      { error: `Hall is already booked for "${conflict.movie.title}" at that time` },
      { status: 409 }
    );
  }

  const showtime = await prisma.showtime.create({
    data: {
      movieId: parsed.data.movieId,
      hallId: parsed.data.hallId,
      startTime,
      basePrice: parsed.data.basePrice,
      status: "SCHEDULED",
    },
    include: {
      movie: true,
      hall: { include: { theater: true } },
    },
  });
  return NextResponse.json(showtime, { status: 201 });
}
