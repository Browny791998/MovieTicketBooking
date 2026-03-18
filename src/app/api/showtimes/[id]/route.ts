import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const showtime = await prisma.showtime.findUnique({
    where: { id: params.id },
    include: {
      movie: true,
      hall: { include: { theater: true } },
    },
  });
  if (!showtime) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(showtime);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const showtime = await prisma.showtime.update({
    where: { id: params.id },
    data: body,
  });
  return NextResponse.json(showtime);
}
