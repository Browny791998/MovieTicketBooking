"use client";

import { Star } from "lucide-react";

interface RatingsBarProps {
  tmdbRating?: number | null;
  imdbRating?: number | null;
  rottenTomatoes?: number | null;
  metacritic?: number | null;
}

function TmdbBadge({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      <span className="text-sm font-semibold text-white">
        {rating.toFixed(1)}
        <span className="text-zinc-400 font-normal">/10</span>
      </span>
      <span className="text-xs text-zinc-500">TMDB</span>
    </div>
  );
}

function ImdbBadge({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="rounded bg-yellow-400 px-1.5 py-0.5 text-xs font-black text-black">
        IMDb
      </span>
      <span className="text-sm font-semibold text-white">
        {rating.toFixed(1)}
        <span className="text-zinc-400 font-normal">/10</span>
      </span>
    </div>
  );
}

function RottenTomatoesBadge({ score }: { score: number }) {
  const fresh = score >= 60;
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-base leading-none">{fresh ? "🍅" : "💩"}</span>
      <span
        className={`text-sm font-semibold ${fresh ? "text-red-400" : "text-zinc-400"}`}
      >
        {score}%
      </span>
      <span className="text-xs text-zinc-500">RT</span>
    </div>
  );
}

function MetacriticBadge({ score }: { score: number }) {
  const color =
    score >= 61
      ? "bg-green-600"
      : score >= 40
        ? "bg-yellow-600"
        : "bg-red-700";
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`${color} flex h-7 w-7 items-center justify-center rounded text-xs font-black text-white`}
      >
        {score}
      </span>
      <span className="text-xs text-zinc-500">Metacritic</span>
    </div>
  );
}

export function RatingsBar({
  tmdbRating,
  imdbRating,
  rottenTomatoes,
  metacritic,
}: RatingsBarProps) {
  const hasAny = tmdbRating || imdbRating || rottenTomatoes || metacritic;
  if (!hasAny) return null;

  return (
    <div className="flex flex-wrap items-center gap-4">
      {tmdbRating && <TmdbBadge rating={tmdbRating} />}
      {imdbRating && <ImdbBadge rating={imdbRating} />}
      {rottenTomatoes != null && <RottenTomatoesBadge score={rottenTomatoes} />}
      {metacritic != null && <MetacriticBadge score={metacritic} />}
    </div>
  );
}
