import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const theaters = await prisma.theater.findMany({
    include: {
      halls: true,
      _count: { select: { halls: true } },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(theaters);
}
