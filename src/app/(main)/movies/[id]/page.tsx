import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { cache } from "react";
import type { Metadata } from "next";
import { MovieHero } from "@/components/movies/MovieHero";
import { MovieCard } from "@/components/movies/MovieCard";
import { ShowtimeDateTabs } from "@/components/movies/ShowtimeDateTabs";
import { CalendarDays } from "lucide-react";

interface Props {
  params: { id: string };
}

const getMovie = cache(async (id: string) => {
  return prisma.movie.findUnique({
    where: { id },
    include: {
      showtimes: {
        where: { status: "SCHEDULED", startTime: { gte: new Date() } },
        include: { hall: { include: { theater: true } } },
        orderBy: { startTime: "asc" },
      },
      castMembers: {
        orderBy: { order: "asc" },
        take: 20,
      },
    },
  });
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const movie = await getMovie(params.id);
  if (!movie) return { title: "Movie Not Found" };
  return {
    title: `${movie.title} | Dat Shin`,
    description: movie.description,
    openGraph: {
      title: movie.title,
      description: movie.description,
      images: [{ url: movie.posterUrl }],
    },
  };
}

export default async function MovieDetailPage({ params }: Props) {
  const movie = await getMovie(params.id);
  if (!movie) notFound();

  // Similar movies (same genre, excluding current)
  const similar = await prisma.movie.findMany({
    where: { genre: movie.genre, id: { not: movie.id } },
    take: 4,
    orderBy: { releaseDate: "desc" },
  });

  return (
    <div className="min-h-screen">
      <MovieHero movie={movie} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Showtimes */}
        <section id="showtimes">
          <div className="flex items-center gap-2 mb-6">
            <CalendarDays className="h-5 w-5 text-red-400" />
            <h2 className="text-2xl font-bold text-white">Select Showtime</h2>
          </div>

          {movie.showtimes.length === 0 ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 py-12 text-center">
              <CalendarDays className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-400 font-medium">No upcoming showtimes</p>
              <p className="text-zinc-600 text-sm mt-1">
                Check back soon for new schedule
              </p>
            </div>
          ) : (
            <ShowtimeDateTabs movieId={movie.id} showtimes={movie.showtimes} />
          )}
        </section>

        {/* Similar movies */}
        {similar.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-6">
              More {movie.genre} Movies
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {similar.map((m) => (
                <MovieCard key={m.id} movie={m} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
