import { prisma } from "@/lib/prisma";
import {
  searchMovie,
  getMovieDetails,
  getMovieCredits,
  getMovieTrailer,
  getMovieImages,
  buildImageUrl,
} from "@/lib/tmdb";
import {
  getOMDBByImdbId,
  getOMDBByTitle,
  extractRottenTomatoes,
  extractMetacritic,
  extractImdbRating,
} from "@/lib/omdb";
import { CastMember } from "@prisma/client";

export function getDirectors(castMembers: CastMember[]): CastMember[] {
  return castMembers.filter((c) => c.department === "Directing" && c.job === "Director");
}

export function getActors(castMembers: CastMember[]): CastMember[] {
  return castMembers
    .filter((c) => c.department === "Acting")
    .sort((a, b) => a.order - b.order);
}

export function getWriters(castMembers: CastMember[]): CastMember[] {
  return castMembers.filter((c) => c.department === "Writing");
}

export async function enrichMovie(movieId: string): Promise<void> {
  const movie = await prisma.movie.findUnique({ where: { id: movieId } });
  if (!movie) throw new Error(`Movie ${movieId} not found`);

  const releaseYear = new Date(movie.releaseDate).getFullYear();

  console.log(`[enrich] Searching TMDB for: "${movie.title}" (${releaseYear})`);

  // Search TMDB
  const tmdbResult = movie.tmdbId
    ? await getMovieDetails(movie.tmdbId)
    : await searchMovie(movie.title, releaseYear);

  if (!tmdbResult) {
    console.warn(`[enrich] TMDB: no results for "${movie.title}"`);
    return;
  }

  const tmdbId = tmdbResult.id;

  // Fetch all TMDB data in parallel
  const [details, credits, trailerKey, images] = await Promise.all([
    getMovieDetails(tmdbId),
    getMovieCredits(tmdbId),
    getMovieTrailer(tmdbId),
    getMovieImages(tmdbId),
  ]);

  if (!details) {
    console.warn(`[enrich] TMDB details not found for id ${tmdbId}`);
    return;
  }

  // Fetch OMDB data
  const omdb = details.imdb_id
    ? await getOMDBByImdbId(details.imdb_id)
    : await getOMDBByTitle(movie.title, releaseYear);

  // Determine backdrop
  const backdropUrl =
    images.backdropUrl ??
    (details.backdrop_path ? buildImageUrl(details.backdrop_path, "original") : null);

  // Box office: prefer OMDB, fallback to TMDB revenue
  const boxOffice =
    omdb?.BoxOffice && omdb.BoxOffice !== "N/A"
      ? omdb.BoxOffice
      : details.revenue > 0
      ? `$${new Intl.NumberFormat("en-US").format(details.revenue)}`
      : null;

  // Awards: trim if too long
  const awards = omdb?.Awards && omdb.Awards !== "N/A" ? omdb.Awards : null;

  // Update movie record
  await prisma.movie.update({
    where: { id: movieId },
    data: {
      tmdbId,
      imdbId: details.imdb_id ?? undefined,
      trailerKey: trailerKey ?? undefined,
      backdropUrl: backdropUrl ?? undefined,
      tagline: details.tagline ?? undefined,
      tmdbRating: details.vote_average > 0 ? details.vote_average : undefined,
      imdbRating: omdb ? extractImdbRating(omdb.imdbRating) ?? undefined : undefined,
      rottenTomatoes: omdb ? extractRottenTomatoes(omdb.Ratings) ?? undefined : undefined,
      metacritic: omdb ? extractMetacritic(omdb.Metascore) ?? undefined : undefined,
      boxOffice: boxOffice ?? undefined,
      awards: awards ?? undefined,
      tmdbPopularity: details.popularity,
      enrichedAt: new Date(),
    },
  });

  // Upsert cast members — delete old ones first, then create
  await prisma.castMember.deleteMany({ where: { movieId } });

  const castData: {
    movieId: string;
    tmdbId: number;
    name: string;
    character: string | null;
    profileUrl: string | null;
    order: number;
    department: string;
    job: string | null;
  }[] = [];

  // Top 10 actors
  credits.cast.slice(0, 10).forEach((c) => {
    castData.push({
      movieId,
      tmdbId: c.id,
      name: c.name,
      character: c.character || null,
      profileUrl: c.profile_path ? buildImageUrl(c.profile_path, "w200") : null,
      order: c.order,
      department: "Acting",
      job: "Actor",
    });
  });

  // Directors + writers
  credits.crew.forEach((c, i) => {
    castData.push({
      movieId,
      tmdbId: c.id,
      name: c.name,
      character: null,
      profileUrl: c.profile_path ? buildImageUrl(c.profile_path, "w200") : null,
      order: 100 + i,
      department: c.department,
      job: c.job,
    });
  });

  if (castData.length > 0) {
    await prisma.castMember.createMany({ data: castData });
  }

  console.log(
    `[enrich] ✓ "${movie.title}" — TMDB:${tmdbId}, RT:${omdb ? extractRottenTomatoes(omdb.Ratings) : "N/A"}, cast:${castData.length}`
  );
}

export async function enrichAllMovies(): Promise<{ enriched: number; failed: string[] }> {
  const movies = await prisma.movie.findMany({
    where: { enrichedAt: null },
    orderBy: { createdAt: "asc" },
  });

  console.log(`[enrich] ${movies.length} movies need enrichment`);

  let enriched = 0;
  const failed: string[] = [];

  for (const movie of movies) {
    try {
      await enrichMovie(movie.id);
      enriched++;
    } catch (err) {
      console.error(`[enrich] Failed for "${movie.title}":`, err);
      failed.push(movie.title);
    }
    // Throttle: 500ms between requests to avoid TMDB rate limiting
    if (enriched < movies.length) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  console.log(`[enrich] Complete: ${enriched} enriched, ${failed.length} failed`);
  return { enriched, failed };
}
