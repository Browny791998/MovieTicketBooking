import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { MovieGrid } from "@/components/movies/MovieGrid";
import { FilterBar } from "@/components/movies/FilterBar";
import { Skeleton } from "@/components/ui/skeleton";
import { Film } from "lucide-react";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: {
    genre?: string;
    language?: string;
    rating?: string;
    search?: string;
    sort?: string;
  };
}

async function getFilteredMovies(searchParams: PageProps["searchParams"]) {
  const { genre, language, rating, search, sort = "newest" } = searchParams;

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

  return prisma.movie.findMany({ where, orderBy });
}

async function MovieResults({ searchParams }: PageProps) {
  const movies = await getFilteredMovies(searchParams);
  return (
    <>
      <p className="text-sm text-zinc-500 mb-6">
        Showing <span className="text-zinc-300 font-medium">{movies.length}</span> movies
      </p>
      <MovieGrid movies={movies} emptyMessage="No movies match your filters." />
    </>
  );
}

export default function MoviesPage({ searchParams }: PageProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Film className="h-5 w-5 text-red-400" />
          <span className="text-sm font-semibold text-red-400 uppercase tracking-widest">Browse</span>
        </div>
        <h1 className="text-3xl font-bold text-white">All Movies</h1>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <Suspense>
          <FilterBar />
        </Suspense>
      </div>

      {/* Results */}
      <Suspense
        fallback={
          <>
            <Skeleton className="h-4 w-32 mb-6" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-[2/3] w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          </>
        }
      >
        <MovieResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
