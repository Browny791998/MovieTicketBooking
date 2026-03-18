import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  status: z.enum(["CANCELLED", "COMPLETED"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const showtime = await prisma.showtime.update({
    where: { id: params.id },
    data: { status: parsed.data.status },
  });
  return NextResponse.json(showtime);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Only allow deletion if no confirmed bookings exist
  const confirmedCount = await prisma.booking.count({
    where: { showtimeId: params.id, status: "CONFIRMED" },
  });

  if (confirmedCount > 0) {
    return NextResponse.json(
      { error: "Cannot delete showtime with confirmed bookings" },
      { status: 409 }
    );
  }

  await prisma.showtime.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
