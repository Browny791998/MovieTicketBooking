import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatTime24 } from "@/lib/utils";
import { Clock } from "lucide-react";

async function getTodayShowtimes() {
  const now = new Date();
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const showtimes = await prisma.showtime.findMany({
    where: {
      status: "SCHEDULED",
      startTime: { gte: now, lte: endOfDay },
    },
    include: {
      movie: true,
      hall: { include: { theater: true } },
    },
    orderBy: { startTime: "asc" },
  });

  // Group by movie, max 6 movies
  const byMovie = new Map<string, typeof showtimes>();
  for (const st of showtimes) {
    if (!byMovie.has(st.movieId)) {
      if (byMovie.size >= 6) continue;
      byMovie.set(st.movieId, []);
    }
    byMovie.get(st.movieId)!.push(st);
  }

  return byMovie;
}

export async function TodayShowtimes() {
  const byMovie = await getTodayShowtimes();

  if (byMovie.size === 0) {
    return (
      <div className="text-center py-10 text-zinc-500">
        No showtimes scheduled for today.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px] text-sm">
        <thead>
          <tr className="border-b border-zinc-800">
            <th className="text-left py-3 px-4 text-zinc-400 font-medium w-64">Movie</th>
            <th className="text-left py-3 px-4 text-zinc-400 font-medium">Time Slots</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/60">
          {Array.from(byMovie.entries()).map(([, showtimes]) => {
            const movie = showtimes[0].movie;
            return (
              <tr key={movie.id} className="hover:bg-zinc-900/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-14 rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={movie.posterUrl}
                        alt={movie.title}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <div>
                      <Link href={`/movies/${movie.id}`} className="font-semibold text-zinc-100 hover:text-red-400 transition-colors">
                        {movie.title}
                      </Link>
                      <p className="text-xs text-zinc-500 mt-0.5">{movie.genre}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-2">
                    {showtimes.map((st) => (
                      <Link
                        key={st.id}
                        href={`/movies/${movie.id}/book/${st.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/60 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:border-red-600 hover:text-red-400 hover:bg-red-950/20 transition-all"
                      >
                        <Clock className="h-3 w-3" />
                        {formatTime24(st.startTime)}
                      </Link>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
