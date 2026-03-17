import { Skeleton } from "@/components/ui/skeleton";

export function SeatMapSkeleton() {
  return (
    <div className="space-y-5">
      {/* Screen skeleton */}
      <div className="flex flex-col items-center gap-1.5 mb-6">
        <Skeleton className="h-3 w-[70%] rounded-b-[50%]" />
        <Skeleton className="h-2 w-12" />
      </div>

      {/* Row skeletons */}
      <div className="space-y-1.5">
        {Array.from({ length: 9 }).map((_, rowIdx) => (
          <div key={rowIdx} className="flex items-center gap-2">
            <Skeleton className="w-5 h-4 shrink-0" />
            <div className="flex gap-1">
              {Array.from({ length: 10 }).map((_, seatIdx) => (
                <Skeleton key={seatIdx} className="w-8 h-8 rounded-t-lg rounded-b-sm" />
              ))}
            </div>
            <Skeleton className="w-5 h-4 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
