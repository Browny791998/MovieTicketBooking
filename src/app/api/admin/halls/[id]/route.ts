import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const hall = await prisma.hall.findUnique({
    where: { id: params.id },
    include: {
      theater: true,
      seats: { orderBy: [{ rowLabel: "asc" }, { seatNumber: "asc" }] },
    },
  });

  if (!hall) return NextResponse.json({ error: "Hall not found" }, { status: 404 });
  return NextResponse.json(hall);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, hallType } = await req.json();

  const hall = await prisma.hall.update({
    where: { id: params.id },
    data: {
      ...(name && { name: name.trim() }),
      ...(hallType && { hallType }),
    },
    include: { theater: true, _count: { select: { seats: true } } },
  });

  return NextResponse.json(hall);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const upcoming = await prisma.showtime.count({
    where: { hallId: params.id, status: "SCHEDULED", startTime: { gte: new Date() } },
  });

  if (upcoming > 0) {
    return NextResponse.json(
      { error: `Cannot delete: ${upcoming} upcoming showtime(s) exist` },
      { status: 409 }
    );
  }

  await prisma.hall.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
