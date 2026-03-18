import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  genre: z.string().min(1).optional(),
  language: z.string().min(1).optional(),
  durationMins: z.coerce.number().int().min(1).optional(),
  rating: z.enum(["G", "PG", "PG-13", "R", "NC-17"]).optional(),
  posterUrl: z.string().url().optional(),
  releaseDate: z.string().optional(),
  description: z.string().min(10).optional(),
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
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { releaseDate, ...rest } = parsed.data;
  const movie = await prisma.movie.update({
    where: { id: params.id },
    data: {
      ...rest,
      ...(releaseDate ? { releaseDate: new Date(releaseDate) } : {}),
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
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Cascade handled by Prisma schema (onDelete: Cascade on Showtime → Movie)
  await prisma.movie.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
