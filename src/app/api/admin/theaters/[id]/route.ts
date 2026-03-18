import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, city, address } = await req.json();

  const theater = await prisma.theater.update({
    where: { id: params.id },
    data: {
      ...(name && { name: name.trim() }),
      ...(city && { city: city.trim() }),
      ...(address && { address: address.trim() }),
    },
    include: { halls: true },
  });

  return NextResponse.json(theater);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check for upcoming scheduled showtimes
  const upcoming = await prisma.showtime.count({
    where: {
      hall: { theaterId: params.id },
      status: "SCHEDULED",
      startTime: { gte: new Date() },
    },
  });

  if (upcoming > 0) {
    return NextResponse.json(
      { error: `Cannot delete: ${upcoming} upcoming showtime(s) exist` },
      { status: 409 }
    );
  }

  await prisma.theater.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
