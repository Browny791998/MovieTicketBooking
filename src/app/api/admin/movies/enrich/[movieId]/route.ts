import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { enrichMovie } from "@/lib/movie-enrichment";
import { prisma } from "@/lib/prisma";

// GET: enrichment status for a movie
export async function GET(
  _req: NextRequest,
  { params }: { params: { movieId: string } }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const movie = await prisma.movie.findUnique({
    where: { id: params.movieId },
    select: {
      id: true,
      title: true,
      tmdbId: true,
      imdbId: true,
      enrichedAt: true,
      _count: { select: { castMembers: true } },
    },
  });

  if (!movie) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    enriched: movie.enrichedAt !== null,
    enrichedAt: movie.enrichedAt,
    tmdbId: movie.tmdbId,
    imdbId: movie.imdbId,
    castCount: movie._count.castMembers,
  });
}

// POST: trigger enrichment for specific movie
export async function POST(
  _req: NextRequest,
  { params }: { params: { movieId: string } }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await enrichMovie(params.movieId);
    const updated = await prisma.movie.findUnique({
      where: { id: params.movieId },
      include: { castMembers: { orderBy: { order: "asc" } } },
    });
    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Enrichment failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
