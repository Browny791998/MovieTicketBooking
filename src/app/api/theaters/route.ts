import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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
