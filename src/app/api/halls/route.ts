import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const halls = await prisma.hall.findMany({
    include: { theater: true },
    orderBy: [{ theater: { name: "asc" } }, { name: "asc" }],
  });
  return NextResponse.json(halls);
}
