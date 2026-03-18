import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const theaters = await prisma.theater.findMany({
    include: {
      halls: {
        include: { _count: { select: { seats: true } } },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(theaters);
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, city, address } = await req.json();
  if (!name?.trim() || !city?.trim() || !address?.trim()) {
    return NextResponse.json({ error: "Name, city, and address are required" }, { status: 400 });
  }

  const theater = await prisma.theater.create({
    data: { name: name.trim(), city: city.trim(), address: address.trim() },
    include: { halls: true },
  });

  return NextResponse.json(theater, { status: 201 });
}
