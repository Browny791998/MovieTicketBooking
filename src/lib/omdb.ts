const OMDB_API_KEY = process.env.OMDB_API_KEY ?? "";
const OMDB_BASE_URL = process.env.OMDB_BASE_URL ?? "https://www.omdbapi.com";

export interface OMDBRating {
  Source: string;
  Value: string;
}

export interface OMDBMovie {
  Title: string;
  Year: string;
  imdbID: string;
  imdbRating: string;
  Ratings: OMDBRating[];
  Metascore: string;
  Awards: string;
  BoxOffice: string;
  Director: string;
  Writer: string;
  Actors: string;
  Language: string;
  Country: string;
  Poster: string;
  Response: string;
}

async function omdbFetch(params: Record<string, string>): Promise<OMDBMovie | null> {
  if (!OMDB_API_KEY) {
    console.warn("[omdb] OMDB_API_KEY not set — skipping OMDB enrichment");
    return null;
  }

  const url = new URL(OMDB_BASE_URL);
  url.searchParams.set("apikey", OMDB_API_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const data: OMDBMovie = await res.json();
    return data.Response === "False" ? null : data;
  } catch (err) {
    console.error("[omdb] fetch error:", err);
    return null;
  }
}

export async function getOMDBByTitle(title: string, year?: number): Promise<OMDBMovie | null> {
  const params: Record<string, string> = { t: title };
  if (year) params.y = String(year);
  return omdbFetch(params);
}

export async function getOMDBByImdbId(imdbId: string): Promise<OMDBMovie | null> {
  return omdbFetch({ i: imdbId });
}

export function extractRottenTomatoes(ratings: OMDBRating[]): number | null {
  const rt = ratings.find((r) => r.Source === "Rotten Tomatoes");
  if (!rt) return null;
  const match = rt.Value.match(/^(\d+)%$/);
  return match ? parseInt(match[1]) : null;
}

export function extractMetacritic(metascore: string): number | null {
  if (!metascore || metascore === "N/A") return null;
  const n = parseInt(metascore);
  return isNaN(n) ? null : n;
}

export function extractImdbRating(rating: string): number | null {
  if (!rating || rating === "N/A") return null;
  const n = parseFloat(rating);
  return isNaN(n) ? null : n;
}
