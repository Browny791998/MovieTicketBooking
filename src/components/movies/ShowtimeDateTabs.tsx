"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn, getDateTabs, formatTime24, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock } from "lucide-react";
import { format } from "date-fns";
import { Showtime, Hall, Theater } from "@/types";

type ShowtimeWithHall = Showtime & {
  hall: Hall & { theater: Theater };
};

interface ShowtimeDateTabsProps {
  movieId: string;
  showtimes: ShowtimeWithHall[];
}

const HALL_TYPE_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  IMAX: { label: "IMAX", variant: "default" },
  FOURDX: { label: "4DX", variant: "destructive" as "default" },
  STANDARD: { label: "Standard", variant: "secondary" },
};

export function ShowtimeDateTabs({ movieId, showtimes }: ShowtimeDateTabsProps) {
  const router = useRouter();
  const tabs = getDateTabs(7);
  const [activeDate, setActiveDate] = useState(tabs[0].dateKey);

  const filtered = showtimes.filter(
    (st) => format(new Date(st.startTime), "yyyy-MM-dd") === activeDate
  );

  // Group filtered by theater
  const byTheater = new Map<string, { theaterName: string; city: string; halls: Map<string, { hallName: string; hallType: string; showtimes: ShowtimeWithHall[] }> }>();

  for (const st of filtered) {
    const tid = st.hall.theater.id ?? st.hall.theaterId;
    if (!byTheater.has(tid)) {
      byTheater.set(tid, {
        theaterName: st.hall.theater.name,
        city: st.hall.theater.city,
        halls: new Map(),
      });
    }
    const theater = byTheater.get(tid)!;
    if (!theater.halls.has(st.hallId)) {
      theater.halls.set(st.hallId, {
        hallName: st.hall.name,
        hallType: st.hall.hallType,
        showtimes: [],
      });
    }
    theater.halls.get(st.hallId)!.showtimes.push(st);
  }

  return (
    <div className="space-y-6">
      {/* Date tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {tabs.map((tab) => {
          const hasShowtimes = showtimes.some(
            (st) => format(new Date(st.startTime), "yyyy-MM-dd") === tab.dateKey
          );
          return (
            <button
              key={tab.dateKey}
              onClick={() => setActiveDate(tab.dateKey)}
              className={cn(
                "shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all border",
                activeDate === tab.dateKey
                  ? "bg-red-600 border-red-600 text-white"
                  : hasShowtimes
                  ? "border-zinc-700 text-zinc-300 hover:border-red-600/50 hover:text-white"
                  : "border-zinc-800 text-zinc-600 cursor-default"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Showtimes for selected date */}
      {byTheater.size === 0 ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 py-10 text-center">
          <Clock className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500">No showtimes available for this date.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(byTheater.values()).map(({ theaterName, city, halls }) => (
            <div key={theaterName} className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
              {/* Theater header */}
              <div className="flex items-center gap-3 px-5 py-3 border-b border-zinc-800 bg-zinc-900/60">
                <MapPin className="h-4 w-4 text-red-400 shrink-0" />
                <span className="font-semibold text-zinc-100">{theaterName}</span>
                <Badge variant="outline" className="text-xs">{city}</Badge>
              </div>

              {/* Halls */}
              <div className="p-4 space-y-4">
                {Array.from(halls.values()).map(({ hallName, hallType, showtimes: hallShowtimes }) => {
                  const typeInfo = HALL_TYPE_LABELS[hallType] ?? { label: hallType, variant: "secondary" as const };
                  return (
                    <div key={hallName} className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex items-center gap-2 sm:w-40 shrink-0">
                        <span className="text-sm font-medium text-zinc-300">{hallName}</span>
                        <Badge variant={typeInfo.variant} className="text-xs">{typeInfo.label}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {hallShowtimes
                          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                          .map((st) => (
                            <Link
                              key={st.id}
                              href={`/movies/${movieId}/book/${st.id}`}
                              className="inline-flex flex-col items-center rounded-lg border border-zinc-700 bg-zinc-800/50 px-3.5 py-2 hover:border-red-600 hover:bg-red-950/20 hover:text-red-300 transition-all group"
                              onClick={() => router.prefetch(`/movies/${movieId}/book/${st.id}`)}
                            >
                              <span className="text-sm font-bold text-zinc-100 group-hover:text-red-300">
                                {formatTime24(st.startTime)}
                              </span>
                              <span className="text-[10px] text-zinc-500 group-hover:text-red-400/70 mt-0.5">
                                {formatPrice(st.basePrice)}
                              </span>
                            </Link>
                          ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
