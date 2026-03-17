import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { enrichMovie, enrichAllMovies } from "@/lib/movie-enrichment";
import { prisma } from "@/lib/prisma";

// POST: enrich a single movie
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { movieId } = await req.json();
  if (!movieId) return NextResponse.json({ error: "movieId is required" }, { status: 400 });

  try {
    await enrichMovie(movieId);
    const updated = await prisma.movie.findUnique({
      where: { id: movieId },
      include: { castMembers: { orderBy: { order: "asc" } } },
    });
    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Enrichment failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT: enrich all unenriched movies
export async function PUT(_req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const result = await enrichAllMovies();
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Enrichment failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
