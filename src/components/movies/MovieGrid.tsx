import { MovieCard } from "@/components/movies/MovieCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Film } from "lucide-react";
import { Movie } from "@/types";

interface MovieGridProps {
  movies: Movie[];
  loading?: boolean;
  emptyMessage?: string;
  comingSoon?: boolean;
}

export function MovieGrid({
  movies,
  loading = false,
  emptyMessage = "No movies found.",
  comingSoon = false,
}: MovieGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-[2/3] w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Film className="h-12 w-12 text-zinc-700 mb-3" />
        <p className="text-zinc-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} showComingSoon={comingSoon} />
      ))}
    </div>
  );
}
