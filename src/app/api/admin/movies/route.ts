import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const movieSchema = z.object({
  title: z.string().min(1, "Title is required"),
  genre: z.string().min(1, "Genre is required"),
  language: z.string().min(1, "Language is required"),
  durationMins: z.coerce.number().int().min(1),
  rating: z.enum(["G", "PG", "PG-13", "R", "NC-17"]),
  posterUrl: z.string().url("Must be a valid URL"),
  releaseDate: z.string().min(1, "Release date is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const movies = await prisma.movie.findMany({
    orderBy: { releaseDate: "desc" },
  });
  return NextResponse.json(movies);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = movieSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const movie = await prisma.movie.create({
    data: {
      ...parsed.data,
      releaseDate: new Date(parsed.data.releaseDate),
    },
  });
  return NextResponse.json(movie, { status: 201 });
}
