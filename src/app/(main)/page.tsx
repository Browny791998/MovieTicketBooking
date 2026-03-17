import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { cache } from "react";
import { MovieGrid } from "@/components/movies/MovieGrid";
import { HeroSection } from "@/components/movies/HeroSection";
import { TodayShowtimes } from "@/components/movies/TodayShowtimes";
import { TheaterCard } from "@/components/movies/TheaterCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, CalendarDays, Building2 } from "lucide-react";

const getNowShowingMovies = cache(async () => {
  return prisma.movie.findMany({
    where: {
      releaseDate: { lte: new Date() },
      showtimes: { some: { status: "SCHEDULED", startTime: { gte: new Date() } } },
    },
    orderBy: { releaseDate: "desc" },
    take: 8,
  });
});

const getComingSoonMovies = cache(async () => {
  return prisma.movie.findMany({
    where: { releaseDate: { gt: new Date() } },
    orderBy: { releaseDate: "asc" },
    take: 4,
  });
});

const getTheaters = cache(async () => {
  return prisma.theater.findMany({
    include: {
      halls: true,
      _count: { select: { halls: true } },
    },
    orderBy: { name: "asc" },
  });
});

const getFeaturedMovie = cache(async () => {
  return prisma.movie.findFirst({
    where: {
      showtimes: { some: { status: "SCHEDULED", startTime: { gte: new Date() } } },
    },
    orderBy: { releaseDate: "desc" },
  });
});

export default async function HomePage() {
  const [featured, nowShowing, comingSoon, theaters] = await Promise.all([
    getFeaturedMovie(),
    getNowShowingMovies(),
    getComingSoonMovies(),
    getTheaters(),
  ]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      {featured && <HeroSection movie={featured} />}

      {/* Now Showing */}
      <section className="py-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm font-semibold text-red-400 uppercase tracking-widest mb-1">Now Showing</p>
            <h2 className="text-2xl font-bold text-white">Latest Movies</h2>
          </div>
          <Link href="/movies">
            <Button variant="outline" size="sm" className="gap-2">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
        <MovieGrid movies={nowShowing} />
      </section>

      {/* Today's Showtimes */}
      <section className="py-12 border-y border-zinc-800/60 bg-zinc-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600/10 border border-red-800/30">
                <CalendarDays className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-red-400 uppercase tracking-widest">Today</p>
                <h2 className="text-xl font-bold text-white">Showtimes</h2>
              </div>
            </div>
            <Link href="/movies">
              <Button variant="ghost" size="sm" className="gap-2 text-zinc-400 hover:text-white">
                All movies <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          <TodayShowtimes />
        </div>
      </section>

      {/* Coming Soon */}
      {comingSoon.length > 0 && (
        <section className="py-16 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-1">Coming Soon</p>
              <h2 className="text-2xl font-bold text-white">Upcoming Releases</h2>
            </div>
          </div>
          <MovieGrid movies={comingSoon} comingSoon />
        </section>
      )}

      {/* Theaters */}
      {theaters.length > 0 && (
        <section className="py-12 border-t border-zinc-800/60 bg-zinc-900/20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 border border-zinc-700">
                <Building2 className="h-5 w-5 text-zinc-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Our Venues</p>
                <h2 className="text-xl font-bold text-white">Theaters</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {theaters.map((theater) => (
                <TheaterCard key={theater.id} theater={theater} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
