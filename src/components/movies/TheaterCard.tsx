import Link from "next/link";
import { MapPin, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Hall, Theater } from "@/types";

interface TheaterCardProps {
  theater: Theater & {
    halls: Hall[];
    _count: { halls: number };
  };
}

const HALL_TYPE_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
  IMAX: "default",
  FOURDX: "destructive" as "default",
  STANDARD: "secondary",
};

export function TheaterCard({ theater }: TheaterCardProps) {
  const seen = new Set<string>();
  const hallTypes = theater.halls.map((h) => h.hallType).filter((t) => { if (seen.has(t)) return false; seen.add(t); return true; });

  return (
    <Link href={`/movies?theater=${theater.id}`} className="group block">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 hover:border-red-700/50 hover:bg-zinc-900/80 transition-all duration-300 hover:shadow-xl hover:shadow-red-950/20">
        <div className="flex items-start justify-between mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/10 border border-red-800/30">
            <Building2 className="h-5 w-5 text-red-400" />
          </div>
          <span className="text-xs text-zinc-500 font-medium">{theater._count.halls} halls</span>
        </div>

        <h3 className="font-bold text-zinc-100 group-hover:text-red-300 transition-colors">
          {theater.name}
        </h3>
        <div className="flex items-center gap-1.5 mt-1 text-sm text-zinc-400">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {theater.city}
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {hallTypes.map((type) => (
            <Badge key={type} variant={HALL_TYPE_VARIANTS[type] ?? "outline"} className="text-xs">
              {type}
            </Badge>
          ))}
        </div>
      </div>
    </Link>
  );
}
