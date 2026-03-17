"use client";

import Image from "next/image";
import { useState } from "react";
import { Clock, Calendar, Globe, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatDuration } from "@/lib/utils";
import { RatingsBar } from "@/components/movies/RatingsBar";
import { CastScroll } from "@/components/movies/CastScroll";
import { MovieInfoGrid } from "@/components/movies/MovieInfoGrid";
import { TrailerModal } from "@/components/movies/TrailerModal";
import type { EnrichedMovie } from "@/types";

interface MovieHeroProps {
  movie: EnrichedMovie;
}

export function MovieHero({ movie }: MovieHeroProps) {
  const [trailerOpen, setTrailerOpen] = useState(false);
  const backdropSrc = movie.backdropUrl || movie.posterUrl || "/placeholder-poster.jpg";

  const directors = movie.castMembers
    .filter((c) => c.department === "Directing" && c.job === "Director")
    .map((c) => c.name)
    .join(", ") || null;

  const writers = movie.castMembers
    .filter((c) => c.department === "Writing")
    .map((c) => c.name)
    .join(", ") || null;

  return (
    <>
      {/* Backdrop hero */}
      <div className="relative min-h-[520px] overflow-hidden">
        {/* Backdrop image */}
        <div className="absolute inset-0">
          <Image
            src={backdropSrc}
            alt={movie.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-zinc-950/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative mx-auto flex max-w-7xl gap-8 px-4 pb-12 pt-16 sm:px-6 lg:px-8">
          {/* Poster */}
          <div className="hidden flex-shrink-0 sm:block">
            <div className="relative aspect-[2/3] w-44 overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10 md:w-52">
              <Image
                src={movie.posterUrl || "/placeholder-poster.jpg"}
                alt={movie.title}
                fill
                className="object-cover"
                sizes="208px"
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-1 flex-col justify-end gap-4">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">{movie.rating}</Badge>
              <Badge variant="secondary">{movie.genre}</Badge>
              <Badge variant="outline">{movie.language}</Badge>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold leading-tight text-white md:text-5xl">
              {movie.title}
            </h1>

            {/* Tagline */}
            {movie.tagline && (
              <p className="text-base italic text-zinc-400">{movie.tagline}</p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {formatDuration(movie.durationMins)}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDate(movie.releaseDate)}
              </span>
              <span className="flex items-center gap-1.5">
                <Globe className="h-4 w-4" />
                {movie.language}
              </span>
            </div>

            {/* Ratings */}
            <RatingsBar
              tmdbRating={movie.tmdbRating}
              imdbRating={movie.imdbRating}
              rottenTomatoes={movie.rottenTomatoes}
              metacritic={movie.metacritic}
            />

            {/* Description */}
            <p className="max-w-2xl text-sm leading-relaxed text-zinc-300 line-clamp-3">
              {movie.description}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 pt-1">
              <Button size="lg" asChild>
                <a href="#showtimes">Book Tickets</a>
              </Button>
              {movie.trailerKey && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setTrailerOpen(true)}
                  className="gap-2 border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Watch Trailer
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Below backdrop: info + cast */}
      <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        {/* Movie info grid */}
        <MovieInfoGrid
          director={directors}
          writer={writers}
          language={movie.language}
          releaseDate={movie.releaseDate}
          boxOffice={movie.boxOffice}
          awards={movie.awards}
        />

        {/* Cast & Crew */}
        {movie.castMembers && movie.castMembers.length > 0 && (
          <CastScroll cast={movie.castMembers} />
        )}
      </div>

      {/* Trailer modal */}
      {movie.trailerKey && (
        <TrailerModal
          trailerKey={movie.trailerKey}
          title={movie.title}
          open={trailerOpen}
          onOpenChange={setTrailerOpen}
        />
      )}
    </>
  );
}
