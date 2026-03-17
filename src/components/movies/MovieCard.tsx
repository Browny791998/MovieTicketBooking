import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/utils";
import { Movie } from "@/types";
import { cn } from "@/lib/utils";

const GENRE_COLORS: Record<string, string> = {
  "Sci-Fi": "bg-blue-600/20 text-blue-300 border-blue-800/40",
  Action: "bg-red-600/20 text-red-300 border-red-800/40",
  Drama: "bg-purple-600/20 text-purple-300 border-purple-800/40",
  Romance: "bg-pink-600/20 text-pink-300 border-pink-800/40",
  Thriller: "bg-amber-600/20 text-amber-300 border-amber-800/40",
  Animation: "bg-green-600/20 text-green-300 border-green-800/40",
  Horror: "bg-zinc-700/60 text-zinc-300 border-zinc-600/40",
  Sports: "bg-orange-600/20 text-orange-300 border-orange-800/40",
};

interface MovieCardProps {
  movie: Movie;
  showComingSoon?: boolean;
}

export function MovieCard({ movie, showComingSoon = false }: MovieCardProps) {
  const genreClass = GENRE_COLORS[movie.genre] ?? "bg-zinc-700/60 text-zinc-300 border-zinc-600/40";

  return (
    <Link href={`/movies/${movie.id}`} className="group block">
      <div className="relative overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800 transition-all duration-300 group-hover:border-red-700/60 group-hover:shadow-xl group-hover:shadow-red-950/30">
        <div className="relative aspect-[2/3] overflow-hidden">
          <Image
            src={movie.posterUrl || "/placeholder-poster.jpg"}
            alt={movie.title}
            fill
            className={cn(
              "object-cover transition-transform duration-500 group-hover:scale-105",
              showComingSoon && "grayscale group-hover:grayscale-0"
            )}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 gap-2">
            <span className={cn("self-start inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", genreClass)}>
              {movie.genre}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-zinc-300">
              <Clock className="h-3 w-3" />
              {formatDuration(movie.durationMins)}
            </div>
          </div>
          {/* Rating badge */}
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="text-xs">
              {movie.rating}
            </Badge>
          </div>
          {/* Coming soon ribbon */}
          {showComingSoon && (
            <div className="absolute top-3 right-0 bg-zinc-800 text-zinc-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-l-full shadow">
              Coming Soon
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-zinc-100 text-sm leading-tight line-clamp-2 group-hover:text-red-300 transition-colors">
            {movie.title}
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">{movie.genre}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(movie.durationMins)}
            </span>
            <span>{movie.language}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
