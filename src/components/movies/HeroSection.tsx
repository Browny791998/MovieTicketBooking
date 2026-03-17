import Image from "next/image";
import Link from "next/link";
import { Clock, Star, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/utils";
import { Movie } from "@/types";

const GENRE_COLORS: Record<string, string> = {
  "Sci-Fi": "bg-blue-600/20 text-blue-300 border-blue-700/50",
  Action: "bg-red-600/20 text-red-300 border-red-700/50",
  Drama: "bg-purple-600/20 text-purple-300 border-purple-700/50",
  Romance: "bg-pink-600/20 text-pink-300 border-pink-700/50",
  Thriller: "bg-amber-600/20 text-amber-300 border-amber-700/50",
  Animation: "bg-green-600/20 text-green-300 border-green-700/50",
  Horror: "bg-zinc-700/60 text-zinc-300 border-zinc-600/50",
  Sports: "bg-orange-600/20 text-orange-300 border-orange-700/50",
};

interface HeroSectionProps {
  movie: Movie;
}

export function HeroSection({ movie }: HeroSectionProps) {
  const genreClass = GENRE_COLORS[movie.genre] ?? "bg-zinc-700/60 text-zinc-300 border-zinc-600/50";

  return (
    <section className="relative min-h-[70vh] flex items-end overflow-hidden">
      {/* Background poster */}
      <div className="absolute inset-0">
        <Image
          src={movie.posterUrl}
          alt={movie.title}
          fill
          className="object-cover object-center scale-105"
          priority
          sizes="100vw"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/70 to-zinc-950/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-14 pt-32">
        <div className="max-w-2xl">
          {/* Featured tag */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-red-600/20 border border-red-700/40 px-3 py-1 text-xs font-semibold text-red-300 uppercase tracking-widest mb-4">
            <Star className="h-3 w-3 fill-red-400 text-red-400" />
            Featured
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold ${genreClass}`}>
              {movie.genre}
            </span>
            <Badge variant="secondary">{movie.rating}</Badge>
            <span className="inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-800/60 px-3 py-0.5 text-xs text-zinc-300">
              <Clock className="h-3 w-3" />
              {formatDuration(movie.durationMins)}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight mb-4 drop-shadow-2xl">
            {movie.title}
          </h1>

          {/* Description */}
          <p className="text-zinc-300 text-base sm:text-lg leading-relaxed mb-8 line-clamp-2 max-w-xl">
            {movie.description}
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-3">
            <Link href={`/movies/${movie.id}#showtimes`}>
              <Button size="lg" className="gap-2 shadow-lg shadow-red-900/40">
                Book Now
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href={`/movies/${movie.id}`}>
              <Button size="lg" variant="outline" className="gap-2 bg-black/30 backdrop-blur-sm border-white/20 text-white hover:bg-white/10">
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
