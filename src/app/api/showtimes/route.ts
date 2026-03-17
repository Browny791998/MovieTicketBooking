import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const showtimes = await prisma.showtime.findMany({
    include: {
      movie: true,
      hall: { include: { theater: true } },
    },
    orderBy: { startTime: "asc" },
  });
  return NextResponse.json(showtimes);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { movieId, hallId, startTime, basePrice } = await req.json();
  if (!movieId || !hallId || !startTime || !basePrice) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const showtime = await prisma.showtime.create({
    data: {
      movieId,
      hallId,
      startTime: new Date(startTime),
      basePrice: Number(basePrice),
    },
    include: {
      movie: true,
      hall: { include: { theater: true } },
    },
  });
  return NextResponse.json(showtime, { status: 201 });
}
