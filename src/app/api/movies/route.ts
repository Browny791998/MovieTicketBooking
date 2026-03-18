import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const createMovieSchema = z.object({
  title: z.string().min(1),
  genre: z.string().min(1),
  language: z.string().min(1),
  durationMins: z.number().min(1),
  rating: z.string().min(1),
  posterUrl: z.string().url(),
  releaseDate: z.string(),
  description: z.string().min(1),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const genre = searchParams.get("genre");
  const language = searchParams.get("language");
  const rating = searchParams.get("rating");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") ?? "newest";
  const limit = searchParams.get("limit");

  const where: Prisma.MovieWhereInput = {
    ...(genre ? { genre } : {}),
    ...(language ? { language } : {}),
    ...(rating ? { rating } : {}),
    ...(search
      ? { title: { contains: search, mode: Prisma.QueryMode.insensitive } }
      : {}),
  };

  const orderBy: Prisma.MovieOrderByWithRelationInput =
    sort === "oldest"
      ? { releaseDate: "asc" }
      : sort === "a-z"
      ? { title: "asc" }
      : sort === "duration"
      ? { durationMins: "desc" }
      : { releaseDate: "desc" };

  const movies = await prisma.movie.findMany({
    where,
    orderBy,
    ...(limit ? { take: parseInt(limit) } : {}),
    include: {
      _count: { select: { showtimes: { where: { status: "SCHEDULED", startTime: { gte: new Date() } } } } },
    },
  });
  return NextResponse.json(movies);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createMovieSchema.safeParse(body);
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
