import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { MapPin, Clock, Phone, Train, Layers, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Locations | Dat Shin",
  description: "Find a Dat Shin cinema near you in Yangon.",
};

const HALL_TYPE_LABELS: Record<string, string> = {
  STANDARD: "Standard",
  IMAX: "IMAX",
  FOURDX: "4DX",
};

const LOCATION_DETAILS: Record<string, {
  address: string;
  access: string;
  hours: string;
  phone: string;
  mapUrl: string;
  highlights: string[];
}> = {
  "Dat Shin Downtown": {
    address: "No. 123, Pansodan Street, Kyauktada Township, Yangon 11182",
    access: "5 min walk from Pansodan Jetty · City Bus routes 37, 42 stop nearby",
    hours: "Mon–Thu 10:00–23:30 · Fri–Sun 09:00–00:30",
    phone: "+95 9-1234-56789",
    mapUrl: "https://maps.google.com/?q=Kyauktada+Yangon+Myanmar",
    highlights: ["8 screens", "IMAX with Laser", "Dolby Atmos", "VIP Recliner Lounge"],
  },
  "Dat Shin Junction": {
    address: "No. 45, Pyay Road, Kamayut Township, Yangon 11041",
    access: "2 min walk from Junction Square · City Bus routes 8, 15, 52 stop nearby",
    hours: "Mon–Thu 10:30–23:00 · Fri–Sun 09:30–00:00",
    phone: "+95 9-9876-54321",
    mapUrl: "https://maps.google.com/?q=Kamayut+Yangon+Myanmar",
    highlights: ["8 screens", "4DX motion seats", "Dolby Atmos", "Rooftop terrace bar"],
  },
};

export default async function LocationsPage() {
  const theaters = await prisma.theater.findMany({
    include: {
      halls: { orderBy: { hallType: "asc" } },
      _count: { select: { halls: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-zinc-800/60 bg-zinc-950 py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-red-600/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-800/40 bg-red-600/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-red-400">
            <MapPin className="h-3.5 w-3.5" />
            {theaters.length} Locations · Yangon
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-white leading-tight mb-5">
            Find Your
            <span className="text-red-500"> Cinema</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Two iconic venues across Yangon — each designed to deliver the ultimate cinematic experience.
          </p>
        </div>
      </section>

      {/* Theaters */}
      <section className="py-16 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-10">
        {theaters.map((theater) => {
          const details = LOCATION_DETAILS[theater.name] ?? {
            address: theater.address ?? "Yangon, Myanmar",
            access: "See Google Maps for directions",
            hours: "Daily 10:00–24:00",
            phone: "Contact us for info",
            mapUrl: `https://maps.google.com/?q=${encodeURIComponent(theater.name)}`,
            highlights: [],
          };

          const hallTypeCounts = theater.halls.reduce<Record<string, number>>((acc, h) => {
            acc[h.hallType] = (acc[h.hallType] ?? 0) + 1;
            return acc;
          }, {});

          return (
            <div
              key={theater.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-red-950/40 via-zinc-900 to-zinc-900 px-8 py-6 border-b border-zinc-800">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{theater.name}</h2>
                    <p className="text-sm text-zinc-500 mt-1">{theater.city}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(hallTypeCounts).map(([type, count]) => (
                      <Badge key={type} variant={type === "IMAX" ? "default" : type === "FOURDX" ? "secondary" : "outline"}>
                        {count}× {HALL_TYPE_LABELS[type] ?? type}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
                {/* Info */}
                <div className="p-8 space-y-5">
                  <div className="flex gap-3">
                    <MapPin className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-0.5">Address</p>
                      <p className="text-sm text-zinc-300">{details.address}</p>
                      <a
                        href={details.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-red-400 hover:text-red-300 mt-1 inline-block"
                      >
                        Open in Google Maps →
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Train className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-0.5">Access</p>
                      <p className="text-sm text-zinc-300">{details.access}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Clock className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-0.5">Hours</p>
                      <p className="text-sm text-zinc-300 whitespace-pre-line">{details.hours}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Phone className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-0.5">Phone</p>
                      <a href={`tel:${details.phone}`} className="text-sm text-zinc-300 hover:text-white">
                        {details.phone}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Screens + Highlights */}
                <div className="p-8 space-y-6">
                  {details.highlights.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="h-4 w-4 text-red-400" />
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Highlights</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {details.highlights.map((h) => (
                          <span key={h} className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Layers className="h-4 w-4 text-red-400" />
                      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Screens</p>
                    </div>
                    <div className="space-y-1.5">
                      {theater.halls.map((hall) => (
                        <div key={hall.id} className="flex items-center justify-between text-sm">
                          <span className="text-zinc-300">{hall.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-500">{hall.totalSeats} seats</span>
                            <Badge variant="outline" className="text-xs">
                              {HALL_TYPE_LABELS[hall.hallType] ?? hall.hallType}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link
                    href={`/movies?theater=${theater.id}`}
                    className="block w-full rounded-lg bg-red-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-red-500"
                  >
                    View Showtimes at {theater.name.split(" ").slice(-1)[0]}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
