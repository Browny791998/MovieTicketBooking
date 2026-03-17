import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api-helpers";
import { searchMovie, getMovieDetails, buildImageUrl } from "@/lib/tmdb";
import { apiError, apiSuccess } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  await requireAdmin();

  const { searchParams } = req.nextUrl;
  const title = searchParams.get("title");
  const year = searchParams.get("year");

  if (!title) return apiError("title is required", 400);

  const result = await searchMovie(title, year ? Number(year) : undefined);
  if (!result) return apiError("Movie not found on TMDB", 404);

  const details = await getMovieDetails(result.id);

  return apiSuccess({
    tmdbId: result.id,
    posterUrl: result.poster_path
      ? buildImageUrl(result.poster_path, "w500")
      : null,
    description: details?.overview ?? result.overview ?? null,
    durationMins: details?.runtime ?? null,
    tagline: details?.tagline ?? null,
    imdbId: details?.imdb_id ?? null,
  });
}
