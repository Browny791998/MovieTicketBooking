"use client";

import React from "react";
import { SeatButton } from "@/components/seats/SeatButton";
import { SeatMapSkeleton } from "@/components/seats/SeatMapSkeleton";
import type { SeatWithStatus } from "@/types";
import type { HallType } from "@prisma/client";

interface SeatMapProps {
  seats: SeatWithStatus[];
  selectedSeatIds: Set<string>;
  onSeatClick: (seat: SeatWithStatus) => void;
  hallType: HallType;
  isLoading: boolean;
  lockingId: string | null;
}

function getSeatSize(hallType: HallType): string {
  if (hallType === "IMAX") return "w-7 h-7";
  return "w-8 h-8";
}

export function SeatMap({
  seats,
  selectedSeatIds,
  onSeatClick,
  hallType,
  isLoading,
  lockingId,
}: SeatMapProps) {
  if (isLoading) return <SeatMapSkeleton />;

  // Group seats by rowLabel, sorted A→Z
  const rowMap = new Map<string, SeatWithStatus[]>();
  for (const seat of seats) {
    if (!rowMap.has(seat.rowLabel)) rowMap.set(seat.rowLabel, []);
    rowMap.get(seat.rowLabel)!.push(seat);
  }

  // Sort rows alphabetically
  const sortedRows = Array.from(rowMap.keys()).sort();

  // Determine max seats in a row for aisle gap calculation
  const maxSeatsInRow = Math.max(...Array.from(rowMap.values()).map((r) => r.length));
  const sizeClass = getSeatSize(hallType);

  return (
    <div className="space-y-5">
      {/* Screen indicator */}
      <div className="flex flex-col items-center gap-1.5 mb-6">
        <div
          className="h-3 rounded-b-[50%] bg-gradient-to-b from-zinc-400/60 to-zinc-600/20 shadow-[0_4px_16px_rgba(255,255,255,0.1)]"
          style={{
            width: "70%",
            clipPath: "polygon(5% 0%, 95% 0%, 100% 100%, 0% 100%)",
          }}
        />
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-500">
          Screen
        </p>
      </div>

      {/* Seat grid */}
      <div className="overflow-x-auto pb-2 touch-pan-x flex justify-center" style={{ touchAction: "manipulation" }}>
        <div className="inline-block space-y-1.5" role="grid" aria-label="Seat map">
          {sortedRows.map((rowLabel) => {
            const rowSeats = rowMap.get(rowLabel)!.sort((a, b) => a.seatNumber - b.seatNumber);

            return (
              <div
                key={rowLabel}
                className="flex items-center gap-2"
                role="row"
                aria-label={`Row ${rowLabel}`}
              >
                {/* Row label left */}
                <span className="w-5 shrink-0 text-center text-[10px] font-bold text-zinc-500 select-none">
                  {rowLabel}
                </span>

                {/* Seats with aisle gap */}
                <div className="flex gap-1">
                  {rowSeats.map((seat, idx) => {
                    // Insert aisle gap for wider halls (after seat 4, before last 3)
                    const showGap = maxSeatsInRow > 8 && idx === Math.floor(maxSeatsInRow / 2) - 1;
                    return (
                      <React.Fragment key={seat.id}>
                        <SeatButton
                          seat={seat}
                          isSelected={selectedSeatIds.has(seat.id)}
                          isLocking={lockingId === seat.id}
                          onClick={() => onSeatClick(seat)}
                          sizeClass={sizeClass}
                        />
                        {showGap && <div className="w-4 shrink-0" aria-hidden="true" />}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Row label right */}
                <span className="w-5 shrink-0 text-center text-[10px] font-bold text-zinc-500 select-none">
                  {rowLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
