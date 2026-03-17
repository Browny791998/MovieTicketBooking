const TMDB_API_KEY = process.env.TMDB_API_KEY ?? "";
const TMDB_BASE_URL = process.env.TMDB_BASE_URL ?? "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = process.env.TMDB_IMAGE_BASE ?? "https://image.tmdb.org/t/p";

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genres: { id: number; name: string }[];
  tagline: string | null;
  imdb_id: string | null;
  budget: number;
  revenue: number;
}

export interface TMDBCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TMDBCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface TMDBVideo {
  key: string;
  site: string;
  type: string;
  official: boolean;
  published_at: string;
}

export interface TMDBCredits {
  cast: TMDBCastMember[];
  crew: TMDBCrewMember[];
}

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T | null> {
  if (!TMDB_API_KEY) {
    console.warn("[tmdb] TMDB_API_KEY not set — skipping enrichment");
    return null;
  }

  const url = new URL(`${TMDB_BASE_URL}${path}`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 86400 },
    });

    if (res.status === 429) {
      // Rate limited — wait 1s and retry once
      await new Promise((r) => setTimeout(r, 1000));
      const retry = await fetch(url.toString(), { next: { revalidate: 86400 } });
      if (!retry.ok) return null;
      return retry.json() as Promise<T>;
    }

    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch (err) {
    console.error(`[tmdb] fetch error for ${path}:`, err);
    return null;
  }
}

export async function searchMovie(title: string, year?: number): Promise<TMDBMovie | null> {
  const params: Record<string, string> = { query: title };
  if (year) params.year = String(year);

  const data = await tmdbFetch<{ results: TMDBMovie[] }>("/search/movie", params);
  return data?.results?.[0] ?? null;
}

export async function getMovieDetails(tmdbId: number): Promise<TMDBMovie | null> {
  return tmdbFetch<TMDBMovie>(`/movie/${tmdbId}`);
}

export async function getMovieCredits(tmdbId: number): Promise<TMDBCredits> {
  const data = await tmdbFetch<TMDBCredits>(`/movie/${tmdbId}/credits`);
  return {
    cast: (data?.cast ?? []).slice(0, 15),
    crew: (data?.crew ?? []).filter(
      (c) => (c.department === "Directing" && c.job === "Director") ||
             (c.department === "Writing" && (c.job === "Screenplay" || c.job === "Writer" || c.job === "Story"))
    ),
  };
}

export async function getMovieTrailer(tmdbId: number): Promise<string | null> {
  const data = await tmdbFetch<{ results: TMDBVideo[] }>(`/movie/${tmdbId}/videos`);
  if (!data?.results?.length) return null;

  const videos = data.results.filter((v) => v.site === "YouTube" && v.type === "Trailer");
  const official = videos.find((v) => v.official);
  return official?.key ?? videos[0]?.key ?? null;
}

export async function getMovieImages(tmdbId: number): Promise<{ backdropUrl: string | null }> {
  const data = await tmdbFetch<{ backdrops: { file_path: string; vote_average: number }[] }>(
    `/movie/${tmdbId}/images`,
    { include_image_language: "en,null" }
  );

  if (!data?.backdrops?.length) return { backdropUrl: null };

  const best = [...data.backdrops].sort((a, b) => b.vote_average - a.vote_average)[0];
  return { backdropUrl: best ? buildImageUrl(best.file_path, "original") : null };
}

export function buildImageUrl(path: string, size: "w200" | "w500" | "original" = "w500"): string {
  if (!path) return "";
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}
