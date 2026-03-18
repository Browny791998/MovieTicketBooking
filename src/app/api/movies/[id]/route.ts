import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const movie = await prisma.movie.findUnique({
    where: { id: params.id },
    include: {
      showtimes: {
        where: { status: "SCHEDULED", startTime: { gte: new Date() } },
        include: { hall: { include: { theater: true } } },
        orderBy: { startTime: "asc" },
      },
      castMembers: {
        orderBy: { order: "asc" },
        take: 20,
      },
    },
  });
  if (!movie) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(movie);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const movie = await prisma.movie.update({
    where: { id: params.id },
    data: {
      ...body,
      releaseDate: body.releaseDate ? new Date(body.releaseDate) : undefined,
    },
  });
  return NextResponse.json(movie);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.movie.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
